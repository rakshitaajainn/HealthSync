const isDevelopment = process.env.NODE_ENV !== 'production';

const sanitizeMeta = (meta = {}) =>
  Object.fromEntries(
    Object.entries(meta).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

const formatMeta = (meta = {}) => {
  const cleanMeta = sanitizeMeta(meta);

  if (!Object.keys(cleanMeta).length) {
    return '';
  }

  return ` ${JSON.stringify(cleanMeta)}`;
};

const log = (level, scope, message, meta = {}) => {
  if (!isDevelopment && level === 'debug') {
    return;
  }

  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] [${scope}] ${message}${formatMeta(meta)}`;

  if (level === 'error') {
    console.error(line);
    return;
  }

  console.log(line);
};

module.exports = {
  info: (scope, message, meta) => log('info', scope, message, meta),
  warn: (scope, message, meta) => log('warn', scope, message, meta),
  error: (scope, message, meta) => log('error', scope, message, meta),
  debug: (scope, message, meta) => log('debug', scope, message, meta),
};
