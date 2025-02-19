import math


def sanitize_dict(d):
    """Recursively replace inf and NaNs with None (or any default value)."""
    if isinstance(d, dict):
        return {k: sanitize_dict(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [sanitize_dict(item) for item in d]
    elif isinstance(d, float):
        if math.isinf(d) or math.isnan(d):
            return None  # or any other value
    return d
