package main

import (
	"compress/gzip"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
)

const targetURL = "https://api.themoviedb.org"

func proxyHandler(c *gin.Context) {
	target, err := url.Parse(targetURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid target URL"})
		return
	}

	req, err := http.NewRequest(c.Request.Method, target.String()+c.Request.URL.String(), c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	for key, values := range c.Request.Header {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	req.Header.Set("Accept-Encoding", "gzip, deflate, br")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		log.Println("Failed to forward request:", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to forward request"})
		return
	}

	defer resp.Body.Close()

	var body []byte
	if strings.Contains(resp.Header.Get("Content-Encoding"), "gzip") {
		gzipReader, err := gzip.NewReader(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decompress response"})
			return
		}
		body, err = io.ReadAll(gzipReader)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read decompressed response"})
			return
		}
	} else if strings.Contains(resp.Header.Get("Content-Encoding"), "br") {
		body, err = io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read Brotli response"})
			return
		}
	} else {
		body, err = io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
			return
		}
	}

	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
}

func main() {
	r := gin.Default()

	r.Any("/*proxy", proxyHandler)

	log.Println("Starting proxy server on :8080")

	if err := r.Run(":8080"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
