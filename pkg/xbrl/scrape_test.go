package xbrl

import (
	"testing"
)

func TestScrapeOneReport(t *testing.T) {
	// Using the real IDX URL provided
	target := ReportTarget{
		URL:     "https://www.idx.co.id/Portals/0/StaticData/ListedCompanies/Corporate_Actions/New_Info_JSX/Jenis_Informasi/01_Laporan_Keuangan/02_Soft_Copy_Laporan_Keuangan//Laporan%20Keuangan%20Tahun%202026/TW1/AADI/inlineXBRL.zip",
		Quarter: "TW1",
		Year:    2026,
	}

	// Run the scraper function
	result := ScrapeOneReport(target)

	// Log the status for terminal debugging
	t.Logf("Real URL Scraping Result - Status: %s", result.Status)

	if result.Status != "Success" {
		t.Fatalf("Failed to fetch report from real URL. Status: %s", result.Status)
	}

	if result.Data == nil {
		t.Errorf("Expected zip data to not be nil when status is Success")
	} else {
		t.Logf("Successfully read ZIP file, total files inside ZIP: %d", len(result.Data.File))
	}
}

func TestScrapeMultipleReport(t *testing.T) {
	// List of target URLs to test concurrently
	targets := []ReportTarget{
		{
			URL:     "https://www.idx.co.id/Portals/0/StaticData/ListedCompanies/Corporate_Actions/New_Info_JSX/Jenis_Informasi/01_Laporan_Keuangan/02_Soft_Copy_Laporan_Keuangan//Laporan%20Keuangan%20Tahun%202026/TW1/AADI/inlineXBRL.zip",
			Quarter: "TW1",
			Year:    2026,
		},
		{
			URL:     "https://www.idx.co.id/Portals/0/StaticData/ListedCompanies/Corporate_Actions/New_Info_JSX/Jenis_Informasi/01_Laporan_Keuangan/02_Soft_Copy_Laporan_Keuangan//Laporan%20Keuangan%20Tahun%202026/TW2/AADI/inlineXBRL.zip",
			Quarter: "TW2",
			Year:    2026,
		},
	}

	// Run the multi-scraper function
	results := ScrapeMultipleReport(targets)

	// Loop through each result to verify them properly
	for i, res := range results {
		t.Logf("Target [%d] (%s %d) - Status: %s", i, res.Quarter, res.Year, res.Status)

		if res.Status != "Success" {
			t.Errorf("Failed to fetch report for %s %d. Status: %s", res.Quarter, res.Year, res.Status)
			continue
		}

		if res.Data == nil {
			t.Errorf("ZIP data is nil for %s %d even though status is Success", res.Quarter, res.Year)
		} else {
			t.Logf("Successfully read ZIP for %s %d, total files: %d", res.Quarter, res.Year, len(res.Data.File))
		}
	}
}
