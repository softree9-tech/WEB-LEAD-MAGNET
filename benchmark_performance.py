import time
import sys
import os
from bs4 import BeautifulSoup

# Add current directory to path so we can import our modules
sys.path.append(os.getcwd())

from core.security import is_safe_url
from agents.website_analyzer import count_broken_links

def benchmark_safe_url():
    print("--- Benchmarking is_safe_url ---")
    url = "https://google.com"
    iterations = 50

    # Warm up cache
    is_safe_url(url)

    start = time.perf_counter()
    for _ in range(iterations):
        is_safe_url(url)
    end = time.perf_counter()

    total_time = end - start
    avg_time = total_time / iterations
    print(f"Total time for {iterations} calls (cached): {total_time:.8f}s")
    print(f"Average time per call (cached): {avg_time:.8f}s")
    return avg_time

def benchmark_bs4_parsing():
    print("\n--- Benchmarking BS4 Parsing in count_broken_links ---")
    html_content = "<html><body>" + "".join([f'<a href="https://example.com/{i}">Link {i}</a>' for i in range(100)]) + "</body></html>"
    base_url = "https://example.com"
    iterations = 20

    soup = BeautifulSoup(html_content, "html.parser")

    # Measure optimized performance (no parsing inside count_broken_links)
    start = time.perf_counter()
    for _ in range(iterations):
        count_broken_links(soup, base_url)
    end = time.perf_counter()

    total_time = end - start
    avg_time = total_time / iterations
    print(f"Total time for {iterations} calls (optimized): {total_time:.4f}s")
    print(f"Average time per call: {avg_time:.4f}s")

    # Measure parsing alone
    start = time.perf_counter()
    for _ in range(iterations):
        BeautifulSoup(html_content, "html.parser")
    end = time.perf_counter()
    parsing_time = (end - start) / iterations
    print(f"Average BS4 parsing time alone: {parsing_time:.4f}s")

    return avg_time, parsing_time

if __name__ == "__main__":
    benchmark_safe_url()
    benchmark_bs4_parsing()
