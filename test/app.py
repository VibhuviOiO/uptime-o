import json, socket, ssl, time, requests, psutil, hashlib, gzip, io
from icmplib import traceroute, multiping
from urllib.parse import urlparse

def measure_url(url):
    parsed = urlparse(url)
    hostname = parsed.hostname
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    result = {"url": url, "timestamp": time.time()}

    # ========== DNS LOOKUP ==========
    dns_start = time.time()
    internal_ips = socket.getaddrinfo(hostname, None)
    dns_end = time.time()
    internal_ms = (dns_end - dns_start) * 1000

    internal_ips = list({x[4][0] for x in internal_ips})

    # ========== Cloudflare Lookup ==========
    try:
        cf_start = time.time()
        cf_ips = socket.getaddrinfo(hostname, None, 0, 0, 0, 0)
        cf_end = time.time()
        cf_ms = (cf_end - cf_start) * 1000
    except Exception:
        cf_ms, cf_ips = None, []

    result["dns"] = {
        "internal_lookup_ms": internal_ms,
        "cloudflare_lookup_ms": cf_ms,
        "internal_ips": internal_ips,
        "cloudflare_ips": cf_ips,
    }

    # ========== TCP + TLS ==========
    tcp_start = time.time()
    sock = socket.create_connection((hostname, port), timeout=10)
    tcp_end = time.time()
    tcp_connect_ms = (tcp_end - tcp_start) * 1000

    tls_info = {}
    if parsed.scheme == "https":
        context = ssl.create_default_context()
        tls_start = time.time()
        ssock = context.wrap_socket(sock, server_hostname=hostname)
        tls_end = time.time()
        tls_ms = (tls_end - tls_start) * 1000
        cert = ssock.getpeercert()
        cipher = ssock.cipher()
        chain_len = len(ssock.getpeercert(True))
        tls_info = {
            "tls_version": ssock.version(),
            "cipher": cipher,
            "cert_subject": dict(cert.get("subject", [])[0]) if cert.get("subject") else {},
            "cert_issuer": dict(cert.get("issuer", [])[0]) if cert.get("issuer") else {},
            "cert_notBefore": cert.get("notBefore"),
            "cert_notAfter": cert.get("notAfter"),
            "cert_chain_length": chain_len
        }
        ssock.close()
    sock.close()

    # ========== HTTP REQUEST ==========
    http_start = time.time()
    resp = requests.get(url, allow_redirects=True, timeout=20)
    http_end = time.time()

    total_ms = (http_end - http_start) * 1000
    ttfb_ms = resp.elapsed.total_seconds() * 1000

    # Compression ratio (if gzip)
    if resp.headers.get("Content-Encoding") == "gzip":
        compressed_size = len(resp.content)
        try:
            buf = io.BytesIO(resp.content)
            with gzip.GzipFile(fileobj=buf) as gz:
                decompressed_size = len(gz.read())
            compression_ratio = round(decompressed_size / compressed_size, 2)
        except Exception:
            compression_ratio = None
    else:
        compression_ratio = None

    # Hash
    hash_sha256 = hashlib.sha256(resp.content).hexdigest()

    # ========== Network Path ==========
    try:
        hops = traceroute(hostname, count=2, interval=0.3)
        network_path = [{"hop": h.distance, "ip": h.address, "latency_ms": h.avg_rtt} for h in hops]
    except Exception:
        network_path = []

    # ========== System Metrics ==========
    sys = psutil
    system_info = {
        "cpu_percent": sys.cpu_percent(interval=0.5),
        "memory_percent": sys.virtual_memory().percent,
        "bytes_sent": sys.net_io_counters().bytes_sent,
        "bytes_recv": sys.net_io_counters().bytes_recv,
        "disk_io_read_bytes": sys.disk_io_counters().read_bytes,
        "disk_io_write_bytes": sys.disk_io_counters().write_bytes,
        "load_avg": sys.getloadavg()
    }

    # ========== Phase Breakdown ==========
    phase_latencies = {
        "dns": round(internal_ms, 2),
        "tcp": round(tcp_connect_ms, 2),
        "tls": round(tls_ms if parsed.scheme == "https" else 0, 2),
        "ttfb": round(ttfb_ms, 2),
        "server_processing": round(ttfb_ms - (tls_ms if parsed.scheme == "https" else 0), 2),
        "download": round(total_ms - ttfb_ms, 2),
        "total": round(total_ms, 2)
    }

    # ========== Final Result ==========
    result.update({
        "tcp_connect_ms": tcp_connect_ms,
        "tls_info": tls_info,
        "status_code": resp.status_code,
        "protocol": resp.raw.version,
        "response_size_bytes": len(resp.content),
        "content_type": resp.headers.get("Content-Type"),
        "server": resp.headers.get("Server"),
        "cache_status": resp.headers.get("CF-Cache-Status"),
        "time_to_first_byte_ms": ttfb_ms,
        "total_time_ms": total_ms,
        "redirects": [r.url for r in resp.history],
        "compression_ratio": compression_ratio,
        "hash_sha256": hash_sha256,
        "raw_response_sample": resp.text[:300],
        "headers": dict(resp.headers),
        "system": system_info,
        "network_path": network_path,
        "phase_latencies": phase_latencies
    })

    return result


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python3 app.py <URL>")
        sys.exit(1)
    url = sys.argv[1]
    print(json.dumps(measure_url(url), indent=2))
