/**
 * Enterprise Structured Logger
 */
const isDev = import.meta.env.DEV;

const log = (level, message, data = null) => {
  if (!isDev && level === 'debug') return;

  const timestamp = new Date().toISOString();
  const styles = {
    debug: 'color: #888; font-weight: bold',
    info:  'color: #14B8A6; font-weight: bold',
    warn:  'color: #F59E0B; font-weight: bold',
    error: 'color: #EF4444; font-weight: bold',
  };

  console.log(
    `%c[${timestamp}] [${level.toUpperCase()}] %c${message}`,
    styles[level],
    'color: inherit',
    data ?? ''
  );
};

export const logger = {
  debug: (msg, data) => log('debug', msg, data),
  info:  (msg, data) => log('info', msg, data),
  warn:  (msg, data) => log('warn', msg, data),
  error: (msg, data) => log('error', msg, data),
};
