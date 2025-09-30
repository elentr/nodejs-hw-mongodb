import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import contactsRouter from './routers/contacts.js';

dotenv.config();

// Читаємо змінну оточення PORT
const PORT = Number(process.env.PORT) || 3000;

export const setupServer = () => {
  const app = express();
  app.use(cors());
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    })
  );

  // Підключення роутів
  app.use('/', contactsRouter);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Обробка помилок
  app.use((err, req, res, next) => {
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,
    });
    next(err);
  });
};
