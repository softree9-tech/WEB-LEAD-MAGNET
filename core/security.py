import socket, ipaddress
from urllib.parse import urlparse

def is_safe_url(url: str) -> bool:
    """Validates URL scheme and resolves hostname to check for private/reserved IPs (SSRF protection)."""
    if not url: return False
    if not url.startswith(('http://', 'https://')): url = 'https://' + url
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https') or not parsed.hostname: return False
        for info in socket.getaddrinfo(parsed.hostname, None):
            ip = ipaddress.ip_address(info[4][0])
            if any([ip.is_private, ip.is_loopback, ip.is_link_local, ip.is_reserved, ip.is_multicast, ip.is_unspecified]):
                return False
        return True
    except Exception: return False
