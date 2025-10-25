import type { Request, Response, NextFunction } from 'express';

// Global error handler middleware
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
	res.status(500).json({ error: err.message || 'Internal server error' });
}
