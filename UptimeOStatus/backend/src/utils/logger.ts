
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const levels = { error: 0, warn: 1, info: 2, debug: 3 };

function shouldLog(level: keyof typeof levels) {
	return levels[level] <= levels[LOG_LEVEL as keyof typeof levels];
}

export function logError(message: string, meta?: any) {
	if (shouldLog('error')) console.error(`[ERROR] ${message}`, meta || '');
}
export function logWarn(message: string, meta?: any) {
	if (shouldLog('warn')) console.warn(`[WARN] ${message}`, meta || '');
}
export function logInfo(message: string, meta?: any) {
	if (shouldLog('info')) console.info(`[INFO] ${message}`, meta || '');
}
export function logDebug(message: string, meta?: any) {
	if (shouldLog('debug')) console.debug(`[DEBUG] ${message}`, meta || '');
}
