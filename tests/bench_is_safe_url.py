import time
import socket
import sys
import os
from functools import lru_cache

sys.path.append(os.getcwd())
from core.security import is_safe_url

def benchmark_is_safe_url():
    urls = [
        "https://google.com/search?q=1",
        "https://google.com/search?q=2",
        "https://google.com/search?q=3",
        "https://google.com/search?q=4",
        "https://google.com/search?q=5",
        "https://apple.com/1",
        "https://apple.com/2",
        "https://apple.com/3",
        "https://apple.com/4",
        "https://apple.com/5",
    ] * 5 # 50 URLs, but only 2 unique domains

    print(f"Benchmarking is_safe_url with {len(urls)} calls...")

    start_time = time.time()
    for url in urls:
        is_safe_url(url)
    end_time = time.time()

    duration = end_time - start_time
    print(f"Total time without cache: {duration:.4f}s")
    print(f"Average time per call: {(duration/len(urls))*1000:.4f}ms")

if __name__ == "__main__":
    benchmark_is_safe_url()
