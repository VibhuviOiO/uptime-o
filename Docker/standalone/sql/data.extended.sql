-- schedules
INSERT INTO schedules (id, name, interval, include_response_body, thresholds_warning, thresholds_critical) VALUES
(1, '60s GET', 60, TRUE, 300, 800),
(2, '120s GET', 120, TRUE, 500, 1000),
(3, '200s POST', 200, TRUE, 700, 1500);

-- api_monitors (Working public APIs - no auth required)
INSERT INTO api_monitors (id, name, method, type, url, schedule_id, headers, body) VALUES
(1, 'ISRO Spacecrafts', 'GET', 'HTTPS', 'https://isro.vercel.app/api/spacecrafts', 1, NULL, NULL),
(2, 'ISRO Launchers', 'GET', 'HTTPS', 'https://isro.vercel.app/api/launchers', 1, NULL, NULL),
(3, 'ISRO Customer Satellites', 'GET', 'HTTPS', 'https://isro.vercel.app/api/customer_satellites', 1, NULL, NULL),
(4, 'Aviation Weather METAR', 'GET', 'HTTPS', 'https://aviationweather.gov/api/data/metar?ids=KMCI&format=json', 1, NULL, NULL),
(5, 'NHTSA Vehicle API', 'GET', 'HTTPS', 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/5UXWX7C5*BA?format=json&modelyear=2011', 1, NULL, NULL),
(6, 'Squiggle AFL Teams', 'GET', 'HTTPS', 'https://api.squiggle.com.au/?q=teams', 1, NULL, NULL),
(7, 'NVD Schema', 'GET', 'HTTPS', 'https://csrc.nist.gov/schema/nvd/feed/1.0/nvd_cve_feed_json_1.0.schema', 1, NULL, NULL),
(8, 'JSONPlaceholder Posts', 'GET', 'HTTPS', 'https://jsonplaceholder.typicode.com/posts/1', 1, NULL, NULL);

-- regions (10 regions for demo)
INSERT INTO regions (id, name, region_code, group_name) VALUES
(1, 'US East', 'us-east-1', 'US'),
(2, 'US West', 'us-west-1', 'US'),
(3, 'Europe West', 'eu-west-2', 'Europe'),
(4, 'Europe North', 'eu-north-1', 'Europe'),
(5, 'Oceania', 'ap-southeast-2', 'Oceania'),
(6, 'Asia Pacific', 'ap-south-1', 'Asia'),
(7, 'South America', 'sa-east-1', 'Americas'),
(8, 'Middle East', 'me-south-1', 'Middle East'),
(9, 'Africa', 'af-south-1', 'Africa'),
(10, 'Canada', 'ca-central-1', 'Americas');

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
(9, 'syd', 'Sydney', 5),
(10, 'mum', 'Mumbai', 6),
(11, 'sao', 'São Paulo', 7),
(12, 'bah', 'Bahrain', 8),
(13, 'cpt', 'Cape Town', 9),
(14, 'tor', 'Toronto', 10);

-- agents (14 agents across 10 regions for demo)
INSERT INTO agents (id, name, datacenter_id) VALUES
(1, 'US-East-Agent', 1),
(2, 'US-West-Agent', 5),
(3, 'EU-West-Agent', 6),
(4, 'US-East-Agent-2', 2),
(5, 'US-East-Agent-3', 3),
(6, 'US-West-Agent-2', 5),
(7, 'EU-North-Agent', 8),
(8, 'EU-West-Agent-2', 7),
(9, 'Oceania-Agent', 9),
(10, 'Asia-Pacific-Agent', 10),
(11, 'South-America-Agent', 11),
(12, 'Middle-East-Agent', 12),
(13, 'Africa-Agent', 13),
(14, 'Canada-Agent', 14);

-- agent_monitors (assign all 8 monitors to 9 agents)
INSERT INTO agent_monitors (id, agent_id, monitor_id, active, created_by, created_date) VALUES
-- Agent 1 (US East - Virginia)
(1, 1, 1, TRUE, 'system', CURRENT_TIMESTAMP), (2, 1, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(3, 1, 3, TRUE, 'system', CURRENT_TIMESTAMP), (4, 1, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(5, 1, 5, TRUE, 'system', CURRENT_TIMESTAMP), (6, 1, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(7, 1, 7, TRUE, 'system', CURRENT_TIMESTAMP), (8, 1, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 2 (US West - San Francisco)
(9, 2, 1, TRUE, 'system', CURRENT_TIMESTAMP), (10, 2, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(11, 2, 3, TRUE, 'system', CURRENT_TIMESTAMP), (12, 2, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(13, 2, 5, TRUE, 'system', CURRENT_TIMESTAMP), (14, 2, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(15, 2, 7, TRUE, 'system', CURRENT_TIMESTAMP), (16, 2, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 3 (Europe West - London)
(17, 3, 1, TRUE, 'system', CURRENT_TIMESTAMP), (18, 3, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(19, 3, 3, TRUE, 'system', CURRENT_TIMESTAMP), (20, 3, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(21, 3, 5, TRUE, 'system', CURRENT_TIMESTAMP), (22, 3, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(23, 3, 7, TRUE, 'system', CURRENT_TIMESTAMP), (24, 3, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 4 (US East - New York)
(25, 4, 1, TRUE, 'system', CURRENT_TIMESTAMP), (26, 4, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(27, 4, 3, TRUE, 'system', CURRENT_TIMESTAMP), (28, 4, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(29, 4, 5, TRUE, 'system', CURRENT_TIMESTAMP), (30, 4, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(31, 4, 7, TRUE, 'system', CURRENT_TIMESTAMP), (32, 4, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 5 (US East - Richardson)
(33, 5, 1, TRUE, 'system', CURRENT_TIMESTAMP), (34, 5, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(35, 5, 3, TRUE, 'system', CURRENT_TIMESTAMP), (36, 5, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(37, 5, 5, TRUE, 'system', CURRENT_TIMESTAMP), (38, 5, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(39, 5, 7, TRUE, 'system', CURRENT_TIMESTAMP), (40, 5, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 6 (US West - San Francisco)
(41, 6, 1, TRUE, 'system', CURRENT_TIMESTAMP), (42, 6, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(43, 6, 3, TRUE, 'system', CURRENT_TIMESTAMP), (44, 6, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(45, 6, 5, TRUE, 'system', CURRENT_TIMESTAMP), (46, 6, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(47, 6, 7, TRUE, 'system', CURRENT_TIMESTAMP), (48, 6, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 7 (Europe North - Stockholm)
(49, 7, 1, TRUE, 'system', CURRENT_TIMESTAMP), (50, 7, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(51, 7, 3, TRUE, 'system', CURRENT_TIMESTAMP), (52, 7, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(53, 7, 5, TRUE, 'system', CURRENT_TIMESTAMP), (54, 7, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(55, 7, 7, TRUE, 'system', CURRENT_TIMESTAMP), (56, 7, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 8 (Europe West - Amsterdam)
(57, 8, 1, TRUE, 'system', CURRENT_TIMESTAMP), (58, 8, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(59, 8, 3, TRUE, 'system', CURRENT_TIMESTAMP), (60, 8, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(61, 8, 5, TRUE, 'system', CURRENT_TIMESTAMP), (62, 8, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(63, 8, 7, TRUE, 'system', CURRENT_TIMESTAMP), (64, 8, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 9 (Oceania - Sydney)
(65, 9, 1, TRUE, 'system', CURRENT_TIMESTAMP), (66, 9, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(67, 9, 3, TRUE, 'system', CURRENT_TIMESTAMP), (68, 9, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(69, 9, 5, TRUE, 'system', CURRENT_TIMESTAMP), (70, 9, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(71, 9, 7, TRUE, 'system', CURRENT_TIMESTAMP), (72, 9, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 10 (Asia Pacific - Mumbai)
(73, 10, 1, TRUE, 'system', CURRENT_TIMESTAMP), (74, 10, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(75, 10, 3, TRUE, 'system', CURRENT_TIMESTAMP), (76, 10, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(77, 10, 5, TRUE, 'system', CURRENT_TIMESTAMP), (78, 10, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(79, 10, 7, TRUE, 'system', CURRENT_TIMESTAMP), (80, 10, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 11 (South America - São Paulo)
(81, 11, 1, TRUE, 'system', CURRENT_TIMESTAMP), (82, 11, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(83, 11, 3, TRUE, 'system', CURRENT_TIMESTAMP), (84, 11, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(85, 11, 5, TRUE, 'system', CURRENT_TIMESTAMP), (86, 11, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(87, 11, 7, TRUE, 'system', CURRENT_TIMESTAMP), (88, 11, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 12 (Middle East - Bahrain)
(89, 12, 1, TRUE, 'system', CURRENT_TIMESTAMP), (90, 12, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(91, 12, 3, TRUE, 'system', CURRENT_TIMESTAMP), (92, 12, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(93, 12, 5, TRUE, 'system', CURRENT_TIMESTAMP), (94, 12, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(95, 12, 7, TRUE, 'system', CURRENT_TIMESTAMP), (96, 12, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 13 (Africa - Cape Town)
(97, 13, 1, TRUE, 'system', CURRENT_TIMESTAMP), (98, 13, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(99, 13, 3, TRUE, 'system', CURRENT_TIMESTAMP), (100, 13, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(101, 13, 5, TRUE, 'system', CURRENT_TIMESTAMP), (102, 13, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(103, 13, 7, TRUE, 'system', CURRENT_TIMESTAMP), (104, 13, 8, TRUE, 'system', CURRENT_TIMESTAMP),
-- Agent 14 (Canada - Toronto)
(105, 14, 1, TRUE, 'system', CURRENT_TIMESTAMP), (106, 14, 2, TRUE, 'system', CURRENT_TIMESTAMP),
(107, 14, 3, TRUE, 'system', CURRENT_TIMESTAMP), (108, 14, 4, TRUE, 'system', CURRENT_TIMESTAMP),
(109, 14, 5, TRUE, 'system', CURRENT_TIMESTAMP), (110, 14, 6, TRUE, 'system', CURRENT_TIMESTAMP),
(111, 14, 7, TRUE, 'system', CURRENT_TIMESTAMP), (112, 14, 8, TRUE, 'system', CURRENT_TIMESTAMP);

-- Reset sequences
SELECT setval('schedules_id_seq', (SELECT MAX(id) FROM schedules));
SELECT setval('api_monitors_id_seq', (SELECT MAX(id) FROM api_monitors));
SELECT setval('regions_id_seq', (SELECT MAX(id) FROM regions));
SELECT setval('datacenters_id_seq', (SELECT MAX(id) FROM datacenters));
SELECT setval('agents_id_seq', (SELECT MAX(id) FROM agents));
SELECT setval('agent_monitors_id_seq', (SELECT MAX(id) FROM agent_monitors));
