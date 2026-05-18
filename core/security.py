import socket
import ipaddress
from urllib.parse import urlparse

def is_safe_url(url: str) -> bool:
    """
    Validates that a URL is safe to request, preventing SSRF attacks
    by blocking private, loopback, and reserved IP addresses.
    """
    try:
        if not url:
            return False

        # Add scheme if missing for proper parsing
        if "://" not in url:
            test_url = f"http://{url}"
        else:
            test_url = url

        parsed = urlparse(test_url)
        hostname = parsed.hostname

        if not hostname:
            return False

        # Resolve hostname to IP
        # Note: This is still vulnerable to DNS rebinding if the caller re-resolves
        # the hostname later, but it's a significant first layer of defense.
        ip_address = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(ip_address)

        # Check if IP is private or reserved
        if (ip.is_private or
            ip.is_loopback or
            ip.is_link_local or
            ip.is_reserved or
            ip.is_multicast or
            ip_address == "0.0.0.0"):
            return False

        return True
    except Exception:
        # If we can't resolve it or it's not a valid URL/IP, consider it unsafe
        return False
