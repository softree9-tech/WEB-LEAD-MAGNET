import socket
from urllib.parse import urlparse
import ipaddress

def is_safe_url(url: str) -> bool:
    """
    Validates that a URL is safe to request.
    Prevents SSRF by checking for private, loopback, and reserved IP ranges (IPv4 & IPv6).
    """
    if not url:
        return False
    try:
        # Prepend https if scheme is missing for parsing purposes
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https'):
            return False

        hostname = parsed.hostname
        if not hostname:
            return False

        # Basic check for common local hostnames
        if hostname.lower() in ('localhost', '127.0.0.1', '0.0.0.0', '::1'):
            return False

        # Use getaddrinfo to resolve all possible IPs (IPv4 & IPv6)
        # This protects against hostnames that resolve to both public and private IPs.
        addr_info = socket.getaddrinfo(hostname, None)

        for info in addr_info:
            ip_addr = info[4][0]
            ip = ipaddress.ip_address(ip_addr)

            if (ip.is_private or ip.is_loopback or ip.is_reserved or
                ip.is_multicast or ip.is_link_local or ip.is_unspecified):
                return False

        return True
    except Exception:
        return False
