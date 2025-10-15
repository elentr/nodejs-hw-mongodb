import createHttpError from 'http-errors';

export const validateBody = schema => async (req, res, next) => {
  const isBodyMissing =
    req.body == null ||
    (typeof req.body === 'object' && Object.keys(req.body).length === 0);
  if (isBodyMissing) {
    return next(new createHttpError.BadRequest('Request body is missing'));
  }

  try {
    await schema.validateAsync(req.body, {
      abortEarly: false,
    });
    next();
  } catch (err) {
    const error = err.details.map(detail => detail.message);

    next(new createHttpError.BadRequest(error));
  }
};
