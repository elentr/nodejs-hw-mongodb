import createHttpError from 'http-errors';
import swaggerUI from 'swagger-ui-express';
import path from 'path';
import fs from 'node:fs';

export const swaggerDocs = () => {
  const SWAGGER_PATH = path.join(process.cwd(), 'docs', 'swagger.json');
  try {
    const swaggerDoc = JSON.parse(fs.readFileSync(SWAGGER_PATH).toString());
    return [...swaggerUI.serve, swaggerUI.setup(swaggerDoc)];
  } catch (err) {
    console.error('Swagger docs load error:', err);
    return (req, res, next) =>
      next(createHttpError(500, "Can't load swagger docs"));
  }
};
