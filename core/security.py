import socket
import ipaddress
from urllib.parse import urlparse

def is_safe_url(url: str) -> bool:
    """
    Validates that a URL is safe to request by ensuring its hostname
    does not resolve to private, loopback, or link-local IP addresses.
    This helps prevent Server-Side Request Forgery (SSRF) attacks.
    """
    if not url:
        return False

    try:
        # Ensure URL has a scheme for proper parsing if it's just a domain
        if not url.startswith(('http://', 'https://')):
            # We use http as a dummy scheme for parsing; the actual request may differ
            parsed = urlparse(f"http://{url}")
        else:
            parsed = urlparse(url)

        hostname = parsed.hostname
        if not hostname:
            return False

        # Resolve all IP addresses for the hostname to check against blocklists
        # Using getaddrinfo handles both IPv4 and IPv6
        try:
            addr_info = socket.getaddrinfo(hostname, None)
        except socket.gaierror:
            # Cannot resolve hostname, potentially unsafe or invalid
            return False

        for info in addr_info:
            ip_str = info[4][0]
            ip = ipaddress.ip_address(ip_str)

            # Block private, loopback, and link-local ranges
            if ip.is_private or ip.is_loopback or ip.is_link_local:
                return False

        return True
    except Exception:
        # Fail closed: if any error occurs during validation, treat the URL as unsafe
        return False
