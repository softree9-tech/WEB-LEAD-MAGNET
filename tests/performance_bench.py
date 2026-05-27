import time
import sys
import os
from bs4 import BeautifulSoup
from unittest.mock import MagicMock, patch
from typing import Union

sys.path.append(os.getcwd())

# Create a large dummy HTML
large_html = "<html><body>" + "".join([f'<a href="/link-{i}">Link {i}</a>' for i in range(1000)]) + "</body></html>"

def benchmark_soup_reuse():
    print("--- Benchmarking BeautifulSoup Reuse ---")

    from agents.website_analyzer import count_broken_links

    with patch('agents.website_analyzer.check_single_link', return_value=""):
        # 1. Parsing in each call (simulated by passing HTML)
        start = time.time()
        for _ in range(10):
            count_broken_links(large_html, "https://example.com")
        duration_parsing = time.time() - start
        print(f"Time with re-parsing (10 calls): {duration_parsing:.4f}s")

        # 2. Reusing soup object (passing Soup)
        soup = BeautifulSoup(large_html, "html.parser")
        start = time.time()
        for _ in range(10):
            count_broken_links(soup, "https://example.com")
        duration_reuse = time.time() - start
        print(f"Time with soup reuse (10 calls): {duration_reuse:.4f}s")

        gain = duration_parsing - duration_reuse
        print(f"Actual gain: {gain:.4f}s (~{gain/duration_parsing*100:.1f}%)")

def benchmark_is_safe_url_caching():
    print("\n--- Benchmarking is_safe_url Caching ---")
    from core.security import is_safe_url

    url = "https://google.com"

    # First call to warm up cache
    is_safe_url(url)

    start = time.time()
    for _ in range(100):
        is_safe_url(url)
    duration = time.time() - start
    print(f"Time for 100 cached calls: {duration:.4f}s")
    print(f"Average time per cached call: {duration/100*1000:.4f}ms")

    # Clear cache to compare with uncached (simulated by unique URLs)
    start = time.time()
    for i in range(10):
        is_safe_url(f"https://example{i}.com")
    duration_uncached = time.time() - start
    print(f"Time for 10 uncached calls: {duration_uncached:.4f}s")
    print(f"Average time per uncached call: {duration_uncached/10*1000:.4f}ms")

if __name__ == "__main__":
    benchmark_soup_reuse()
    benchmark_is_safe_url_caching()
