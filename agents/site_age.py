import requests
from datetime import datetime

def get_site_age_data(url: str) -> dict:
    try:
        domain = url.replace("https://","").replace("http://","").split("/")[0]
        # Wayback Machine API
        first_res = requests.get(
            f"http://archive.org/wayback/available?url={domain}&timestamp=20000101",
            timeout=8
        ).json()
        recent_res = requests.get(
            f"http://archive.org/wayback/available?url={domain}",
            timeout=8
        ).json()

        first_ts = first_res.get("archived_snapshots",{}).get("closest",{}).get("timestamp","")
        recent_ts = recent_res.get("archived_snapshots",{}).get("closest",{}).get("timestamp","")

        first_year = int(first_ts[:4]) if len(first_ts) >= 4 else None

        site_age_years = None
        if len(first_ts) >= 8:
            first_dt = datetime(int(first_ts[:4]), int(first_ts[4:6]), int(first_ts[6:8]))
            site_age_years = round((datetime.now() - first_dt).days / 365, 1)

        days_since = None
        if len(recent_ts) >= 8:
            recent_dt = datetime(int(recent_ts[:4]), int(recent_ts[4:6]), int(recent_ts[6:8]))
            days_since = (datetime.now() - recent_dt).days

        level = "unknown"
        if days_since is not None:
            if days_since < 30: level = "active"
            elif days_since < 180: level = "stale"
            elif days_since < 365: level = "aging"
            else: level = "abandoned"

        return {
            "site_age_years": site_age_years,
            "days_since_update": days_since,
            "decay_level": level,
            "first_seen_year": first_year,
            "wayback_available": True if first_ts else False
        }
    except Exception as e:
        print(f"Site age check failed for {url}: {e}")
        return {
            "site_age_years": None,
            "days_since_update": None,
            "decay_level": "unknown",
            "first_seen_year": None,
            "wayback_available": False
        }
