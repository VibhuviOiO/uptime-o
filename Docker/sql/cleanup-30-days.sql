-- ✅ Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 🧹 Delete old heartbeat rows (runs every hour)
SELECT cron.schedule(
    'heartbeat_cleanup',
    '0 * * * *', -- hourly
    $$DELETE FROM api_heartbeats
      WHERE executed_at < NOW() - INTERVAL '30 days'$$
);

-- 💣 Drop expired partitions (runs daily @ 01:00)
SELECT cron.schedule(
    'drop_old_partitions',
    '0 1 * * *',
    $cron$
    DO $$
    DECLARE part TEXT;
    BEGIN
      FOR part IN
        SELECT child.relname
        FROM pg_inherits
        JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
        JOIN pg_class child ON pg_inherits.inhrelid = child.oid
        WHERE parent.relname = 'api_heartbeats'
        AND child.relname < 'api_heartbeats_' ||
            to_char(NOW() - INTERVAL '30 days', 'YYYY_MM_DD')
      LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(part) || ' CASCADE';
      END LOOP;
    END
    $$;
    $cron$
);
