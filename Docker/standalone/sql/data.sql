-- schedules
INSERT INTO schedules (id, name, interval, include_response_body, thresholds_warning, thresholds_critical) VALUES
(1, '60s GET', 60, TRUE, 300, 800),
(2, '120s GET', 120, TRUE, 500, 1000),
(3, '200s POST', 200, TRUE, 700, 1500);

-- http_monitors
INSERT INTO http_monitors (id, name, method, type, url, schedule_id, headers, body) VALUES
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

-- agent_monitors (assign all monitors to all agents)
INSERT INTO agent_monitors (id, agent_id, monitor_id, active, created_by, created_date) VALUES
(1, 1, 1, TRUE, 'system', CURRENT_TIMESTAMP),
(2, 1, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(3, 1, 3, TRUE, 'system', CURRENT_TIMESTAMP),
(4, 1, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(5, 2, 1, TRUE, 'system', CURRENT_TIMESTAMP),
(6, 2, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(7, 2, 3, TRUE, 'system', CURRENT_TIMESTAMP),
(8, 2, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(9, 3, 1, TRUE, 'system', CURRENT_TIMESTAMP),
(10, 3, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(11, 3, 3, TRUE, 'system', CURRENT_TIMESTAMP),
(12, 3, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(13, 4, 1, TRUE, 'system', CURRENT_TIMESTAMP),
(14, 4, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(15, 4, 3, TRUE, 'system', CURRENT_TIMESTAMP),
(16, 4, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(17, 5, 1, TRUE, 'system', CURRENT_TIMESTAMP),
(18, 5, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(19, 5, 3, TRUE, 'system', CURRENT_TIMESTAMP),
(20, 5, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(21, 6, 1, TRUE, 'system', CURRENT_TIMESTAMP),
(22, 6, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(23, 6, 3, TRUE, 'system', CURRENT_TIMESTAMP),
(24, 6, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(25, 7, 1, TRUE, 'system', CURRENT_TIMESTAMP),
(26, 7, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(27, 7, 3, TRUE, 'system', CURRENT_TIMESTAMP),
(28, 7, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(29, 8, 1, TRUE, 'system', CURRENT_TIMESTAMP),
(30, 8, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(31, 8, 3, TRUE, 'system', CURRENT_TIMESTAMP),
(32, 8, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(33, 9, 1, TRUE, 'system', CURRENT_TIMESTAMP),
(34, 9, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(35, 9, 3, TRUE, 'system', CURRENT_TIMESTAMP),
(36, 9, 4, TRUE, 'system', CURRENT_TIMESTAMP);

-- Reset sequences
SELECT setval('schedules_id_seq', (SELECT MAX(id) FROM schedules));
SELECT setval('http_monitors_id_seq', (SELECT MAX(id) FROM http_monitors));
SELECT setval('regions_id_seq', (SELECT MAX(id) FROM regions));
SELECT setval('datacenters_id_seq', (SELECT MAX(id) FROM datacenters));
SELECT setval('agents_id_seq', (SELECT MAX(id) FROM agents));
SELECT setval('agent_monitors_id_seq', (SELECT MAX(id) FROM agent_monitors));
