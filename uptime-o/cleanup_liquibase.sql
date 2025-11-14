-- Clean slate: Remove all http_monitors and http_heartbeats related data

-- Delete Liquibase changelog entries
DELETE FROM databasechangelog 
WHERE id IN (
    '20251025202837-1',
    '20251025202837-1-data',
    '20251025202841-1',
    '20251025202841-1-data',
    '20251115011440-1',
    '20251115011440-2',
    '20251115011440-3',
    '20251115011440-4',
    '20251115120000-1',
    '20251115130000-1',
    '20251115140000-1',
    '20251115150000-1',
    '20251115150000-2',
    '20251115150000-3',
    '20251115160000-1',
    '20251116000000-1',
    '20251116000000-2'
);

-- Drop tables
DROP TABLE IF EXISTS http_heartbeats CASCADE;
DROP TABLE IF EXISTS http_monitors CASCADE;
DROP TABLE IF EXISTS api_heartbeats CASCADE;
DROP TABLE IF EXISTS api_monitors CASCADE;

-- Restart your application - Liquibase will create clean tables
