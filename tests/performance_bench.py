import time
import socket
from core.security import is_safe_url
import sys
import os

# Ensure we can import from the root
sys.path.append(os.getcwd())

def benchmark_is_safe_url():
    urls = [
        "https://google.com/search?q=test1",
        "https://google.com/search?q=test2",
        "https://google.com/search?q=test3",
        "https://google.com/search?q=test4",
        "https://google.com/search?q=test5",
    ] * 20  # 100 calls total, mostly same domain

    start_time = time.perf_counter()
    for url in urls:
        is_safe_url(url)
    end_time = time.perf_counter()

    total_time = end_time - start_time
    print(f"Total time for 100 is_safe_url calls: {total_time:.4f} seconds")
    print(f"Average time per call: {(total_time/100)*1000:.4f} ms")

def benchmark_bs4_parsing():
    from bs4 import BeautifulSoup
    with open("frontend/index.html", "r") as f:
        html = f.read()

    # Simulate a larger HTML if index.html is small
    html = html * 50

    start_time = time.perf_counter()
    for _ in range(50):
        soup = BeautifulSoup(html, "html.parser")
        _ = soup.find_all("a")
    end_time = time.perf_counter()

    reparse_time = end_time - start_time
    print(f"Total time for 50 BeautifulSoup re-parses: {reparse_time:.4f} seconds")

    soup = BeautifulSoup(html, "html.parser")
    start_time = time.perf_counter()
    for _ in range(50):
        _ = soup.find_all("a")
    end_time = time.perf_counter()

    reuse_time = end_time - start_time
    print(f"Total time for 50 BeautifulSoup reuses: {reuse_time:.4f} seconds")
    print(f"Improvement: {((reparse_time - reuse_time) / reparse_time) * 100:.2f}%")

if __name__ == "__main__":
    print("--- Starting Benchmark ---")
    benchmark_is_safe_url()
    print("\n--- Starting BS4 Benchmark ---")
    benchmark_bs4_parsing()
