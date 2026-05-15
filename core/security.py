import socket
import ipaddress
from urllib.parse import urlparse

def is_safe_url(url: str) -> bool:
    """
    Checks if a URL is safe to access (prevents SSRF).
    - Ensures it's a valid HTTP/HTTPS URL.
    - Resolves the hostname and checks if it's a private/reserved IP.
    """
    if not url:
        return False

    # Standardize URL for parsing
    if not url.startswith(('http://', 'https://')):
        test_url = 'https://' + url
    else:
        test_url = url

    try:
        parsed = urlparse(test_url)
        hostname = parsed.hostname
        if not hostname:
            return False

        # Block loopback and other common local hostnames explicitly
        if hostname.lower() in ['localhost', 'loopback', 'metadata.google.internal', '169.254.169.254']:
            return False

        # Resolve hostname to IP addresses
        # We use getaddrinfo to handle both IPv4 and IPv6
        addr_info = socket.getaddrinfo(hostname, None)
        for family, kind, proto, canonname, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)

            # Check for private/reserved/loopback/etc.
            if (ip.is_private or
                ip.is_loopback or
                ip.is_link_local or
                ip.is_multicast or
                ip.is_reserved or
                ip.is_unspecified):
                return False

        return True
    except Exception:
        # If we can't parse or resolve, it's safer to reject it for this lead engine
        return False
