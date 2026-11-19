-- =====================================================================
-- SKEMA DATABASE (PostgreSQL)
-- Jalankan: psql "$DATABASE_URL" -f db/schema.sql
-- Aman dijalankan berulang (pakai IF NOT EXISTS / ON CONFLICT DO NOTHING).
--
-- Isinya dibagi 4 bagian:
--   1. DATA      : diisi otomatis oleh loader Go
--   2. ATURAN    : diisi manual olehmu (definisi metrik)
--   3. HASIL     : metrik standar, dihitung dari data + aturan
--   4. QUERY BANTU
-- =====================================================================


-- =====================================================================
-- 1. DATA (diisi otomatis oleh program Go)
-- =====================================================================

-- Daftar emiten.
CREATE TABLE IF NOT EXISTS emiten (
  code  text PRIMARY KEY,   -- kode saham, mis. 'BRIS'. PRIMARY KEY = tidak boleh ada dua yang sama
  name  text                -- nama perusahaan (opsional, boleh diisi nanti)
);

-- Satu baris = satu laporan keuangan, mis. "BRIS Q1 2026".
-- Laporan IDX bersifat kumulatif: Q2 = Jan-Jun, Q3 = Jan-Sep, FY = Jan-Des.
CREATE TABLE IF NOT EXISTS filing (
  id            bigserial PRIMARY KEY,              -- nomor otomatis (1, 2, 3, ...)
  emiten_code   text NOT NULL REFERENCES emiten(code),  -- harus ada di tabel emiten
  fiscal_year   int  NOT NULL,                      -- mis. 2026
  quarter       text NOT NULL
                CHECK (quarter IN ('Q1','Q2','Q3','FY')),  -- hanya 4 nilai ini yang diizinkan
  period_end    date NOT NULL,                      -- tanggal akhir periode, mis. 2026-03-31
  template      text NOT NULL DEFAULT 'unknown',    -- 'general' / 'financial' / 'unknown'
  roles         text[],                             -- kode role terdeteksi, mis. {1321000}
  source_url    text,                               -- dari mana zip diambil
  source_sha256 text,                               -- sidik jari file zip
  loaded_at     timestamptz NOT NULL DEFAULT now(), -- kapan dimasukkan
  UNIQUE (emiten_code, fiscal_year, quarter)        -- satu laporan per emiten per kuartal.
                                                    -- Dipakai loader untuk menimpa saat reload.
);

-- Daftar nama pos/tag XBRL yang pernah muncul, mis. 'idx-cor:SalesAndRevenue'.
CREATE TABLE IF NOT EXISTS concept (
  name  text PRIMARY KEY
);

-- Label manusiawi untuk tiap concept (Indonesia / Inggris). Belum diisi loader;
-- bisa diisi nanti dari file taksonomi IDX untuk membantu mencari nama concept.
CREATE TABLE IF NOT EXISTS concept_label (
  concept text REFERENCES concept(name),
  lang    text,                 -- 'id' atau 'en'
  label   text,                 -- mis. 'Penjualan dan pendapatan usaha'
  PRIMARY KEY (concept, lang)   -- satu label per concept per bahasa
);

-- FAKTA = satu angka di laporan. Tabel terbesar (jutaan baris).
-- Baris kosong di laporan (xsi:nil) tidak disimpan.
CREATE TABLE IF NOT EXISTS fact (
  id            bigserial PRIMARY KEY,
  filing_id     bigint  NOT NULL REFERENCES filing(id) ON DELETE CASCADE,
                                    -- laporan mana. ON DELETE CASCADE: kalau filing dihapus,
                                    -- fakta-faktanya ikut terhapus.
  concept       text    NOT NULL,   -- pos apa, mis. 'idx-cor:ProfitLoss'
  period_start  date,               -- awal periode. NULL untuk neraca (hanya satu tanggal)
  period_end    date    NOT NULL,   -- akhir periode / tanggal neraca
  unit          text,               -- 'IDR', 'USD', ...
  value         numeric NOT NULL,   -- nilai, sudah dikali scale dan tanda minus.
                                    -- 'numeric' = angka eksak (bukan float), cocok untuk uang.
  decimals      int,                -- ketelitian dari XBRL (mis. -6 = jutaan). NULL boleh.
  dimensions    jsonb NOT NULL DEFAULT '{}'  -- rincian (segmen, dll.) dalam JSON.
                                    -- '{}' = angka utama tanpa rincian.
);

-- INDEKS: seperti daftar isi buku, supaya pencarian cepat.
CREATE INDEX IF NOT EXISTS fact_filing_concept_idx ON fact (filing_id, concept);
CREATE INDEX IF NOT EXISTS fact_concept_period_idx ON fact (concept, period_end);
CREATE INDEX IF NOT EXISTS fact_dims_gin           ON fact USING gin (dimensions);  -- untuk mencari di dalam JSON


-- =====================================================================
-- 2. ATURAN (kamu yang menulis; kecil, tidak terkait emiten)
-- =====================================================================

-- Peta: kode role di laporan -> template. Dibaca loader untuk mengisi filing.template.
CREATE TABLE IF NOT EXISTS role_template (
  role_code text PRIMARY KEY,   -- mis. '1321000'
  template  text NOT NULL       -- mis. 'general'
);
INSERT INTO role_template VALUES
  ('1321000', 'general'),       -- laba rugi, General Industry
  ('4312000', 'financial')      -- laba rugi, Financial and Sharia Industry
ON CONFLICT DO NOTHING;          -- kalau sudah ada, lewati

-- Daftar metrik standar yang ingin kamu punya.
CREATE TABLE IF NOT EXISTS metric (
  code    text PRIMARY KEY,     -- 'revenue', 'net_income', ...
  name_id text,
  name_en text,
  kind    text NOT NULL
          CHECK (kind IN ('flow','stock'))
          -- flow  = angka sepanjang periode (laba rugi, arus kas): ada awal & akhir
          -- stock = angka pada satu tanggal (neraca): total aset, ekuitas
);

-- Definisi: concept mana saja yang dijumlahkan menjadi metrik tertentu.
-- Versi minimal: semua concept dijumlahkan (tanpa tanda minus/plus).
CREATE TABLE IF NOT EXISTS metric_component (
  metric_code text REFERENCES metric(code),
  concept     text,
  PRIMARY KEY (metric_code, concept)
);

-- CONTOH ISI. Nama concept di bawah hanya ILUSTRASI.
-- Cari nama aslinya dengan query "konsep apa saja yang ada" di bagian 4.
INSERT INTO metric VALUES
  ('revenue',      'Pendapatan',   'Revenue',      'flow'),
  ('net_income',   'Laba bersih',  'Net income',   'flow'),
  ('total_assets', 'Total aset',   'Total assets', 'stock')
ON CONFLICT DO NOTHING;

INSERT INTO metric_component VALUES
  ('revenue',      'idx-cor:SalesAndRevenue'),                                              -- General Industry
  ('revenue',      'idx-cor:RevenueFromFundManagementAsMudharib'),                          -- bank syariah
  ('revenue',      'idx-cor:ProvisionsAndCommissionsIncomeFromTransactionsOtherThanLoan'),
  ('revenue',      'idx-cor:GainsLossesOnChangesInForeignExchangeRates'),
  ('revenue',      'idx-cor:OtherOperatingIncome'),
  ('net_income',   'idx-cor:ProfitLoss'),
  ('total_assets', 'idx-cor:Assets')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 3. HASIL STANDAR (dihitung dari fact + aturan)
-- =====================================================================

-- Tabel yang dibaca aplikasi / screener. Satu baris = satu metrik, satu emiten, satu kuartal.
-- Nilai flow di sini masih KUMULATIF (YTD), sesuai laporan asli.
CREATE TABLE IF NOT EXISTS financials (
  emiten_code text   NOT NULL REFERENCES emiten(code),
  fiscal_year int    NOT NULL,
  quarter     text   NOT NULL,
  period_end  date   NOT NULL,
  metric_code text   NOT NULL REFERENCES metric(code),
  value       numeric,
  unit        text,
  filing_id   bigint REFERENCES filing(id),   -- jejak: angka ini berasal dari laporan mana
  PRIMARY KEY (emiten_code, fiscal_year, quarter, metric_code)
);

-- ---------------------------------------------------------------------
-- PERHITUNGAN METRIK. Jalankan ulang setiap kali data baru masuk atau
-- aturan di metric_component berubah. Aman diulang (ON CONFLICT = timpa).
--
-- Cara kerja, langkah demi langkah:
--   a. Ambil tiap laporan (filing)
--   b. Cari fakta milik laporan itu, hanya yang:
--        - periodenya = periode laporan berjalan (bukan kolom tahun lalu)
--        - tanpa dimensi (dimensions = '{}')
--   c. Cocokkan nama concept-nya dengan aturan di metric_component
--   d. Jumlahkan per metrik
-- ---------------------------------------------------------------------
INSERT INTO financials (emiten_code, fiscal_year, quarter, period_end, metric_code, value, unit, filing_id)
SELECT fl.emiten_code,
       fl.fiscal_year,
       fl.quarter,
       fl.period_end,
       mc.metric_code,
       SUM(f.value),            -- jumlahkan semua fakta yang cocok
       MIN(f.unit),             -- unit (diasumsikan sama untuk satu metrik)
       fl.id
FROM filing fl
JOIN fact f                               -- gabungkan laporan dengan fakta-faktanya
  ON f.filing_id  = fl.id
 AND f.period_end = fl.period_end         -- periode berjalan saja
 AND f.dimensions = '{}'::jsonb           -- angka utama, tanpa rincian
JOIN metric_component mc                  -- gabungkan dengan aturan: concept ini masuk metrik apa?
  ON mc.concept = f.concept
JOIN metric m
  ON m.code = mc.metric_code
WHERE (m.kind = 'stock' AND f.period_start IS NULL)                         -- neraca: satu tanggal
   OR (m.kind = 'flow'  AND f.period_start = make_date(fl.fiscal_year, 1, 1)) -- laba rugi: dari 1 Januari (YTD)
GROUP BY fl.emiten_code, fl.fiscal_year, fl.quarter, fl.period_end, mc.metric_code, fl.id
ON CONFLICT (emiten_code, fiscal_year, quarter, metric_code)
DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit, filing_id = EXCLUDED.filing_id;
-- Catatan: make_date(tahun,1,1) mengasumsikan tahun buku Januari-Desember.
-- Untuk emiten dengan tahun buku lain, bagian ini perlu disesuaikan.

-- ---------------------------------------------------------------------
-- VIEW kuartal murni. View = query yang disimpan dengan nama, dipakai
-- seperti tabel. Hanya untuk metrik 'flow' (laba rugi).
--   Q1 murni = YTD Q1
--   Q2 murni = YTD Q2 - YTD Q1
--   Q3 murni = YTD Q3 - YTD Q2
--   Q4 murni = FY      - YTD Q3
-- Bila kuartal sebelumnya tidak ada datanya, hasilnya NULL (bukan angka salah).
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW financials_quarterly AS
SELECT f.emiten_code, f.fiscal_year, f.quarter, f.period_end, f.metric_code,
       CASE f.quarter
         WHEN 'Q1' THEN f.value
         ELSE f.value - p.value
       END AS value
FROM financials f
JOIN metric m ON m.code = f.metric_code AND m.kind = 'flow'
LEFT JOIN financials p                    -- p = baris kuartal sebelumnya (kalau ada)
  ON p.emiten_code = f.emiten_code
 AND p.fiscal_year = f.fiscal_year
 AND p.metric_code = f.metric_code
 AND p.quarter = CASE f.quarter WHEN 'Q2' THEN 'Q1'
                                WHEN 'Q3' THEN 'Q2'
                                WHEN 'FY' THEN 'Q3' END;

-- ---------------------------------------------------------------------
-- VIEW TTM (12 bulan terakhir) untuk metrik flow = jumlah 4 kuartal murni terakhir.
-- Hasilnya hanya muncul bila ada 4 kuartal berurutan (tanpa bolong).
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW financials_ttm AS
SELECT emiten_code, fiscal_year, quarter, period_end, metric_code, ttm
FROM (
  SELECT q.*,
         SUM(value) OVER w AS ttm,                -- jumlah jendela 4 baris terakhir
         COUNT(value) OVER w AS n                 -- berapa baris berisi (bukan NULL) di jendela
  FROM financials_quarterly q
  WINDOW w AS (PARTITION BY emiten_code, metric_code
               ORDER BY period_end
               ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)
) t
WHERE n = 4;   -- buang yang kuartalnya kurang dari 4


-- =====================================================================
-- 4. QUERY BANTU (jalankan manual saat dibutuhkan)
-- =====================================================================

-- (a) Concept apa saja yang ada, dan berapa laporan yang memakainya.
--     Pakai ini untuk memilih nama concept yang benar di metric_component.
--   SELECT concept, COUNT(DISTINCT filing_id) AS jumlah_laporan
--   FROM fact
--   WHERE dimensions = '{}'
--   GROUP BY concept
--   ORDER BY jumlah_laporan DESC;

-- (b) Semua angka satu laporan, untuk dicocokkan dengan laporan asli.
--   SELECT concept, period_start, period_end, value
--   FROM fact
--   WHERE filing_id = (SELECT id FROM filing
--                      WHERE emiten_code = 'BRIS' AND fiscal_year = 2026 AND quarter = 'Q1')
--   ORDER BY concept;

-- (c) Cari concept lewat kata kunci (setelah concept_label diisi).
--   SELECT concept, label FROM concept_label WHERE label ILIKE '%laba bruto%';

-- (d) Hasil metrik satu emiten (BRIS Q1 2026 revenue seharusnya 8933526 dalam satuan laporan).
--   SELECT * FROM financials
--   WHERE emiten_code = 'BRIS' AND fiscal_year = 2026 AND quarter = 'Q1';

-- (e) Contoh screener: 20 emiten dengan net income TTM terbesar.
--   SELECT emiten_code, ttm
--   FROM financials_ttm
--   WHERE metric_code = 'net_income' AND period_end = '2026-03-31'
--   ORDER BY ttm DESC
--   LIMIT 20;
