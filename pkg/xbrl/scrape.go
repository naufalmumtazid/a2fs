package xbrl

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"sync"
	"time"

	"github.com/go-rod/rod"
)

// ReportTarget holds the target URL and its metadata
type ReportTarget struct {
	URL     string
	Quarter string
	Year    int
}

// ReportResult holds the scraping result for a single report
type ReportResult struct {
	URL     string
	Quarter string
	Year    int
	Status  string
	Data    *zip.Reader
}

var (
	cachedCookies []*http.Cookie
	cookieTime    time.Time
	cookieMutex   sync.Mutex
)

func getValidCookies(targetURL string) ([]*http.Cookie, error) {
	cookieMutex.Lock()
	defer cookieMutex.Unlock()

	if len(cachedCookies) > 0 && time.Since(cookieTime) < 20*time.Minute {
		return cachedCookies, nil
	}

	browser := rod.New().NoDefaultDevice().MustConnect()
	defer browser.MustClose()

	page := browser.MustPage(targetURL)
	page.MustWaitLoad()
	time.Sleep(2 * time.Second)

	rodCookies, err := page.Cookies([]string{targetURL})
	if err != nil {
		return nil, err
	}

	var httpCookies []*http.Cookie
	for _, rc := range rodCookies {
		httpCookies = append(httpCookies, &http.Cookie{
			Name:     rc.Name,
			Value:    rc.Value,
			Domain:   rc.Domain,
			Path:     rc.Path,
			Secure:   rc.Secure,
			HttpOnly: rc.HTTPOnly,
		})
	}
	cachedCookies = httpCookies
	cookieTime = time.Now()
	return cachedCookies, nil
}

// ScrapeOneReport scrapes a single financial report target
func ScrapeOneReport(target ReportTarget) ReportResult {
	cookies, err := getValidCookies(target.URL)
	if err != nil {
		return ReportResult{
			URL:     target.URL,
			Quarter: target.Quarter,
			Year:    target.Year,
			Status:  fmt.Sprintf("Failed to get cookies: %v", err),
			Data:    nil,
		}
	}

	jar, _ := cookiejar.New(nil)
	u, _ := url.Parse(target.URL)
	if len(cookies) > 0 {
		jar.SetCookies(u, cookies)
	}

	client := &http.Client{
		Jar:     jar,
		Timeout: 60 * time.Second,
	}

	userAgent := "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
	httpReq, _ := http.NewRequest("GET", target.URL, nil)

	httpReq.Header.Set("User-Agent", userAgent)
	httpReq.Header.Set("Referer", target.URL)
	httpReq.Header.Set("Accept", "application/zip,application/octet-stream,*/*;q=0.8")

	resp, err := client.Do(httpReq)
	if err != nil || resp == nil || resp.StatusCode != http.StatusOK {
		statusCode := 0
		if resp != nil {
			statusCode = resp.StatusCode
			resp.Body.Close()
		}
		return ReportResult{
			URL:     target.URL,
			Quarter: target.Quarter,
			Year:    target.Year,
			Status:  fmt.Sprintf("Failed (HTTP Status: %v)", statusCode),
			Data:    nil,
		}
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil || bytes.Contains(bodyBytes[:min(len(bodyBytes), 100)], []byte("<html")) {
		return ReportResult{
			URL:     target.URL,
			Quarter: target.Quarter,
			Year:    target.Year,
			Status:  "Failed: Blocked / HTML Error",
			Data:    nil,
		}
	}

	zipReader, err := zip.NewReader(bytes.NewReader(bodyBytes), int64(len(bodyBytes)))
	if err != nil {
		return ReportResult{
			URL:     target.URL,
			Quarter: target.Quarter,
			Year:    target.Year,
			Status:  "Failed: Corrupted ZIP file",
			Data:    nil,
		}
	}

	return ReportResult{
		URL:     target.URL,
		Quarter: target.Quarter,
		Year:    target.Year,
		Status:  "Success",
		Data:    zipReader,
	}
}

func ScrapeMultipleReport(targets []ReportTarget) []ReportResult {
	if len(targets) > 0 {
		_, _ = getValidCookies(targets[0].URL)
	}

	results := make([]ReportResult, len(targets))
	var wg sync.WaitGroup

	for i, target := range targets {
		wg.Add(1)
		go func(idx int, t ReportTarget) {
			defer wg.Done()
			results[idx] = ScrapeOneReport(t)
		}(i, target)
	}

	wg.Wait()
	return results
}
