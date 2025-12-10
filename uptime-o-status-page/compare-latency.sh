#!/bin/bash

set -e

MONITOR_ID="${1:-1001}"
RUNS="${2:-20}"

echo "==========================================="
echo "URL Latency Comparison: DB vs Real-time"
echo "==========================================="
echo ""

# Get URLs from database
echo "Fetching URLs from database..."
PRIMARY_URL=$(docker exec -i postgres psql -U uptimeo -d uptimeo -t -c "SELECT url FROM api_monitors WHERE id = $MONITOR_ID;" | xargs)
ADDITIONAL_URL=$(docker exec -i postgres psql -U uptimeo -d uptimeo -t -c "SELECT additional_urls::jsonb->>0 FROM api_monitors WHERE id = $MONITOR_ID;" | xargs)

echo "Primary URL: $PRIMARY_URL"
echo "Additional URL: $ADDITIONAL_URL"
echo ""

test_url() {
  local url=$1
  local label=$2
  local use_cf_dns=$3
  
  echo "=========================================" >&2
  echo "$label" >&2
  echo "=========================================" >&2
  echo "URL: $url" >&2
  
  if [ "$use_cf_dns" = "cloudflare" ]; then
    echo "DNS: Using Cloudflare (1.1.1.1)" >&2
  else
    echo "DNS: System default" >&2
  fi
  
  echo "" >&2
  
  local total_dns=0 total_tcp=0 total_tls=0 total_response=0 total_time=0
  
  for i in $(seq 1 $RUNS); do
    if [ "$use_cf_dns" = "cloudflare" ]; then
      OUTPUT=$(curl --dns-servers 1.1.1.1 -w "%{time_namelookup},%{time_connect},%{time_appconnect},%{time_total}" -o /dev/null -s "$url" 2>/dev/null || \
               curl -w "%{time_namelookup},%{time_connect},%{time_appconnect},%{time_total}" -o /dev/null -s "$url")
    else
      OUTPUT=$(curl -w "%{time_namelookup},%{time_connect},%{time_appconnect},%{time_total}" -o /dev/null -s "$url")
    fi
    
    IFS=',' read -r dns_time tcp_time tls_time total_time_sec <<< "$OUTPUT"
    
    dns_ms=$(echo "$dns_time * 1000" | bc | xargs printf "%.0f")
    tcp_ms=$(echo "($tcp_time - $dns_time) * 1000" | bc | xargs printf "%.0f")
    tls_ms=$(echo "($tls_time - $tcp_time) * 1000" | bc | xargs printf "%.0f")
    response_ms=$(echo "($total_time_sec - $tls_time) * 1000" | bc | xargs printf "%.0f")
    total_ms=$(echo "$total_time_sec * 1000" | bc | xargs printf "%.0f")
    
    total_dns=$(echo "$total_dns + $dns_ms" | bc)
    total_tcp=$(echo "$total_tcp + $tcp_ms" | bc)
    total_tls=$(echo "$total_tls + $tls_ms" | bc)
    total_response=$(echo "$total_response + $response_ms" | bc)
    total_time=$(echo "$total_time + $total_ms" | bc)
    
    sleep 0.05
  done
  
  local avg_dns=$(echo "scale=2; $total_dns / $RUNS" | bc)
  local avg_tcp=$(echo "scale=2; $total_tcp / $RUNS" | bc)
  local avg_tls=$(echo "scale=2; $total_tls / $RUNS" | bc)
  local avg_response=$(echo "scale=2; $total_response / $RUNS" | bc)
  local avg_total=$(echo "scale=2; $total_time / $RUNS" | bc)
  
  printf "DNS: %.2fms | TCP: %.2fms | TLS: %.2fms | Response: %.2fms | TOTAL: %.2fms\n" \
    "$avg_dns" "$avg_tcp" "$avg_tls" "$avg_response" "$avg_total" >&2
  echo "" >&2
  
  echo "$avg_dns,$avg_tcp,$avg_tls,$avg_response,$avg_total"
}

# Test Primary URL
echo "==========================================="
echo "PRIMARY URL TESTS"
echo "==========================================="
echo ""
primary_default=$(test_url "$PRIMARY_URL" "1. Primary URL (System DNS)" "default")
primary_cf=$(test_url "$PRIMARY_URL" "2. Primary URL (Cloudflare DNS)" "cloudflare")

# Test Additional URL
if [ -n "$ADDITIONAL_URL" ]; then
  echo "==========================================="
  echo "ADDITIONAL URL TESTS"
  echo "==========================================="
  echo ""
  additional_default=$(test_url "$ADDITIONAL_URL" "3. Additional URL (System DNS)" "default")
  additional_cf=$(test_url "$ADDITIONAL_URL" "4. Additional URL (Cloudflare DNS)" "cloudflare")
fi

# Get database values
echo "==========================================="
echo "DATABASE STORED VALUES (Last $RUNS)"
echo "==========================================="
echo ""

db_data=$(docker exec -i postgres psql -U uptimeo -d uptimeo -t << EOF
SELECT
  m.url,
  ROUND(AVG(h.dns_lookup_ms), 2),
  ROUND(AVG(h.tcp_connect_ms), 2),
  ROUND(AVG(h.tls_handshake_ms), 2),
  ROUND(AVG(h.response_time_ms), 2),
  ROUND(AVG(h.dns_lookup_ms + h.tcp_connect_ms + h.tls_handshake_ms + h.response_time_ms), 2)
FROM (
  SELECT * FROM api_heartbeats WHERE monitor_id = $MONITOR_ID ORDER BY executed_at DESC LIMIT $RUNS
) h
JOIN api_monitors m ON h.monitor_id = m.id
GROUP BY m.url;
EOF
)

echo "$db_data" | while IFS='|' read -r url dns tcp tls response total; do
  url=$(echo "$url" | xargs)
  dns=$(echo "$dns" | xargs)
  tcp=$(echo "$tcp" | xargs)
  tls=$(echo "$tls" | xargs)
  response=$(echo "$response" | xargs)
  total=$(echo "$total" | xargs)
  
  echo "URL: $url"
  printf "DNS: %sms | TCP: %sms | TLS: %sms | Response: %sms | TOTAL: %sms\n" "$dns" "$tcp" "$tls" "$response" "$total"
  echo ""
done

echo "==========================================="
echo "SUMMARY COMPARISON"
echo "==========================================="
echo ""
echo "Test                          | DNS    | TCP    | TLS    | Response | TOTAL"
echo "------------------------------+--------+--------+--------+----------+--------"

IFS=',' read -r p_dns p_tcp p_tls p_resp p_total <<< "$primary_default"
printf "Primary (System DNS)          | %6.2f | %6.2f | %6.2f | %8.2f | %6.2f\n" "$p_dns" "$p_tcp" "$p_tls" "$p_resp" "$p_total"

IFS=',' read -r p_dns p_tcp p_tls p_resp p_total <<< "$primary_cf"
printf "Primary (Cloudflare DNS)      | %6.2f | %6.2f | %6.2f | %8.2f | %6.2f\n" "$p_dns" "$p_tcp" "$p_tls" "$p_resp" "$p_total"

if [ -n "$ADDITIONAL_URL" ]; then
  IFS=',' read -r a_dns a_tcp a_tls a_resp a_total <<< "$additional_default"
  printf "Additional (System DNS)       | %6.2f | %6.2f | %6.2f | %8.2f | %6.2f\n" "$a_dns" "$a_tcp" "$a_tls" "$a_resp" "$a_total"
  
  IFS=',' read -r a_dns a_tcp a_tls a_resp a_total <<< "$additional_cf"
  printf "Additional (Cloudflare DNS)   | %6.2f | %6.2f | %6.2f | %8.2f | %6.2f\n" "$a_dns" "$a_tcp" "$a_tls" "$a_resp" "$a_total"
fi

echo ""
echo "Database values shown above for comparison."
