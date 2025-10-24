-- schedules
INSERT INTO schedules (id, name, interval, include_response_body, thresholds_warning, thresholds_critical) VALUES
(1, '60s GET', 60, TRUE, 300, 800),
(2, '120s GET', 120, TRUE, 500, 1000),
(3, '200s POST', 200, TRUE, 700, 1500);

-- api_monitors
INSERT INTO api_monitors (id, name, method, type, url, schedule_id, headers, body) VALUES
(1, 'IPfy Public IP Info', 'GET', 'HTTPS', 'https://api.ipify.org?format=json', 1, NULL, NULL),
(2, 'Official Joke API', 'GET', 'HTTPS', 'https://official-joke-api.appspot.com/random_joke', 1, NULL, NULL),
(3, 'Realty US Search 60s POST', 'POST', 'HTTPS', 'https://realty-in-us.p.rapidapi.com/properties/v3/list', 3, '{"Content-Type":"application/json","x-rapidapi-host":"realty-in-us.p.rapidapi.com"}', '{"limit":200,"offset":0,"postal_code":"90004","status":["for_sale","ready_to_build"],"sort":{"direction":"desc","field":"list_date"}}'),
(4, 'Realty Auto-Complete', 'GET', 'HTTPS', 'https://realty-in-us.p.rapidapi.com/locations/v2/auto-complete?input=new%20york&limit=10', 1, '{"x-rapidapi-host":"realty-in-us.p.rapidapi.com","x-rapidapi-key":"YOUR_RAPIDAPI_KEY"}', NULL);

-- regions
INSERT INTO regions (id, name, region_code, group_name) VALUES
(1, 'US East', 'us-east-1', 'US'),
(2, 'US West', 'us-west-1', 'US'),
(3, 'Europe West', 'eu-west-2', 'Europe'),
(4, 'Europe North', 'eu-north-1', 'Europe'),
(5, 'Oceania', 'ap-southeast-2', 'Oceania');

-- datacenters
INSERT INTO datacenters (id, code, name, region_id) VALUES
(1, 'va', 'Virginia', 1),
(2, 'ny', 'New York', 1),
(3, 'rdn', 'Richardson', 1),
(4, 'chi', 'Chicago', 1),
(5, 'sf', 'San Francisco', 2),
(6, 'lon', 'London', 3),
(7, 'dam', 'Amsterdam', 3),
(8, 'sto', 'Stockholm', 4),
(9, 'syd', 'Sydney', 5);

-- datacenter_monitors
INSERT INTO datacenter_monitors (datacenter_id, monitor_id) VALUES
(1,1),(1,2),(1,3),(1,4),
(2,1),(2,2),(2,3),(2,4),
(3,1),(3,2),(3,3),(3,4),
(4,1),(4,2),(4,3),(4,4),
(5,1),(5,2),(5,3),(5,4),
(6,1),(6,2),(6,3),(6,4),
(7,1),(7,2),(7,3),(7,4),
(8,1),(8,2),(8,3),(8,4),
(9,1),(9,2),(9,3),(9,4);

-- agents
INSERT INTO agents (id, name, datacenter_id) VALUES
(1, 'VA Agent', 1),
(2, 'NY Agent', 2),
(3, 'RDN Agent', 3),
(4, 'CHI Agent', 4),
(5, 'SF Agent', 5),
(6, 'LON Agent', 6),
(7, 'DAM Agent', 7),
(8, 'STO Agent', 8),
(9, 'SYD Agent', 9);

-- api_heartbeats
INSERT INTO api_heartbeats (id, monitor_id, agent_id, executed_at, success, response_time_ms, response_size_bytes, response_status_code, response_content_type, response_server, response_cache_status, dns_lookup_ms, tcp_connect_ms, tls_handshake_ms, time_to_first_byte_ms, warning_threshold_ms, critical_threshold_ms, error_type, error_message, raw_request_headers, raw_response_headers, raw_response_body) VALUES
(1, 1, 1, '2025-10-24T10:45:00Z', TRUE, 123, 22, 200, 'application/json', 'cloudflare', 'DYNAMIC', 12, 34, 56, 78, 300, 800, NULL, NULL, '{"User-Agent":"CustomMonitor/1.0"}', '{"Date":"Fri, 24 Oct 2025 10:45:00 GMT","Content-Type":"application/json","Server":"cloudflare","CF-Cache-Status":"DYNAMIC"}', '{"ip":"45.112.49.166"}'),
(2, 2, 2, '2025-10-24T10:46:00Z', TRUE, 98, 245, 200, 'application/json', 'nginx', NULL, 15, 20, 35, 50, 300, 800, NULL, NULL, '{"User-Agent":"CustomMonitor/1.0"}', '{"Date":"Fri, 24 Oct 2025 10:46:00 GMT","Content-Type":"application/json","Server":"nginx"}', '{"id":123,"setup":"Why did...","punchline":"..."}');
