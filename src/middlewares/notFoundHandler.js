import createHttpError from 'http-errors';

export function notFoundHandler() {
  throw createHttpError(404, 'Route not found');
}
