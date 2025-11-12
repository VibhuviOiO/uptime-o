-- Minimal data: 2 agents, 8 monitors, 2 regions

-- schedules
INSERT INTO schedules (id, name, interval, include_response_body, thresholds_warning, thresholds_critical) VALUES
(1, '60s GET', 60, TRUE, 500, 1000);

-- api_monitors
INSERT INTO api_monitors (id, name, method, type, url, schedule_id, headers, body) VALUES
(1, 'ISRO Spacecrafts', 'GET', 'HTTPS', 'https://isro.vercel.app/api/spacecrafts', 1, NULL, NULL),
(2, 'ISRO Launchers', 'GET', 'HTTPS', 'https://isro.vercel.app/api/launchers', 1, NULL, NULL),
(3, 'ISRO Customer Satellites', 'GET', 'HTTPS', 'https://isro.vercel.app/api/customer_satellites', 1, NULL, NULL),
(4, 'Aviation Weather METAR', 'GET', 'HTTPS', 'https://aviationweather.gov/api/data/metar?ids=KMCI&format=json', 1, NULL, NULL),
(5, 'NHTSA Vehicle API', 'GET', 'HTTPS', 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/5UXWX7C5*BA?format=json&modelyear=2011', 1, NULL, NULL),
(6, 'Squiggle AFL Teams', 'GET', 'HTTPS', 'https://api.squiggle.com.au/?q=teams', 1, NULL, NULL),
(7, 'NVD Schema', 'GET', 'HTTPS', 'https://csrc.nist.gov/schema/nvd/feed/1.0/nvd_cve_feed_json_1.0.schema', 1, NULL, NULL),
(8, 'JSONPlaceholder Posts', 'GET', 'HTTPS', 'https://jsonplaceholder.typicode.com/posts/1', 1, NULL, NULL);

-- regions
INSERT INTO regions (id, name, region_code, group_name) VALUES
(1, 'US East', 'us-east-1', 'US'),
(2, 'US West', 'us-west-1', 'US');

-- datacenters
INSERT INTO datacenters (id, code, name, region_id) VALUES
(1, 'va', 'Virginia', 1),
(2, 'sf', 'San Francisco', 2);

-- agents
INSERT INTO agents (id, name, datacenter_id) VALUES
(1, 'US-East-Agent', 1),
(2, 'US-West-Agent', 2);

-- agent_monitors (all 8 monitors to 2 agents)
INSERT INTO agent_monitors (id, agent_id, monitor_id, active, created_by, created_date) VALUES
(1, 1, 1, TRUE, 'system', CURRENT_TIMESTAMP), (2, 1, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(3, 1, 3, TRUE, 'system', CURRENT_TIMESTAMP), (4, 1, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(5, 1, 5, TRUE, 'system', CURRENT_TIMESTAMP), (6, 1, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(7, 1, 7, TRUE, 'system', CURRENT_TIMESTAMP), (8, 1, 8, TRUE, 'system', CURRENT_TIMESTAMP),
(9, 2, 1, TRUE, 'system', CURRENT_TIMESTAMP), (10, 2, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(11, 2, 3, TRUE, 'system', CURRENT_TIMESTAMP), (12, 2, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(13, 2, 5, TRUE, 'system', CURRENT_TIMESTAMP), (14, 2, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(15, 2, 7, TRUE, 'system', CURRENT_TIMESTAMP), (16, 2, 8, TRUE, 'system', CURRENT_TIMESTAMP);

-- Reset sequences
SELECT setval('schedules_id_seq', (SELECT MAX(id) FROM schedules));
SELECT setval('api_monitors_id_seq', (SELECT MAX(id) FROM api_monitors));
SELECT setval('regions_id_seq', (SELECT MAX(id) FROM regions));
SELECT setval('datacenters_id_seq', (SELECT MAX(id) FROM datacenters));
SELECT setval('agents_id_seq', (SELECT MAX(id) FROM agents));
SELECT setval('agent_monitors_id_seq', (SELECT MAX(id) FROM agent_monitors));
