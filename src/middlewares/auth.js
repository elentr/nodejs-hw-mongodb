import createHttpError from 'http-errors';

import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';

export async function auth(req, res, next) {
  const { authorization } = req.headers;
  console.log('Authorization header:', authorization);
  if (typeof authorization !== 'string') {
    throw new createHttpError.Unauthorized('Please provide access token');
  }

  const [bearer, accessToken] = authorization.split(' ', 2);
  console.log('Bearer:', bearer, 'AccessToken:', accessToken);
  if (bearer !== 'Bearer' || typeof accessToken !== 'string') {
    throw new createHttpError.Unauthorized('Please provide access token');
  }

  const session = await Session.findOne({ accessToken });
  console.log('Session found:', session);
  if (session === null) {
    throw new createHttpError.Unauthorized('Session not found');
  }

  if (session.accessTokenValidUntil < new Date()) {
    throw new createHttpError.Unauthorized('Access token expired');
  }

  const user = await User.findById(session.userId);
  console.log('User found:', user);
  if (user === null) {
    throw new createHttpError.Unauthorized('User not found');
  }

  req.user = { id: user._id, name: user.name };
  next();
}
