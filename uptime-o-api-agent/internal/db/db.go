package db

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
)

func Connect(connString string) (*pgxpool.Pool, error) {
	return pgxpool.Connect(context.Background(), connString)
}

func AcquireLock(ctx context.Context, pool *pgxpool.Pool, agentID int) (bool, error) {
	var acquired bool
	err := pool.QueryRow(ctx, "SELECT pg_try_advisory_lock($1)", agentID).Scan(&acquired)
	return acquired, err
}

func ReleaseLock(ctx context.Context, pool *pgxpool.Pool, agentID int) error {
	_, err := pool.Exec(ctx, "SELECT pg_advisory_unlock($1)", agentID)
	return err
}
