import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';

export async function registerUser(payload) {
  const user = await User.findOne({ email: payload.email });

  if (user !== null) {
    throw new createHttpError.Conflict('Email in use');
  }

  payload.password = await bcrypt.hash(payload.password, 10);

  return await User.create(payload);
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email });
  if (user === null) {
    throw new createHttpError.Unauthorized('Invalid credentials');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new createHttpError.Unauthorized('Invalid credentials');
  }

  await Session.deleteOne({ userId: user._id });

  return Session.create({
    userId: user._id,
    accessToken: crypto.randomBytes(30).toString('base64'),
    refreshToken: crypto.randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });
}

export async function logoutUser(sessionId) {
  await Session.deleteOne({ _id: sessionId });
}

export async function refreshSession(sessionId, refreshToken) {
  const session = await Session.findById(sessionId);

  if (session === null) {
    throw new createHttpError.Unauthorized('Session not found');
  }

  if (session.refreshToken !== refreshToken) {
    throw new createHttpError.Unauthorized('Refresh token is invalid');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    throw new createHttpError.Unauthorized('Refresh token is expired');
  }

  await Session.deleteOne({ _id: session._id });

  return Session.create({
    userId: session.userId,
    accessToken: crypto.randomBytes(30).toString('base64'),
    refreshToken: crypto.randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });
}

export async function sendResetEmail(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new createHttpError.NotFound('User not found!');
  }

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });

  const link = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

  try {
    console.log(link);
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
    });
  } catch (error) {
    console.log(link);
    throw new createHttpError(
      500,
      'Failed to send the email, please try again later.'
    );
  }
}

export async function resetPassword(token, password) {
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new createHttpError.Unauthorized('Token is expired or invalid.');
  }

  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw new createHttpError.NotFound('User not found!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(user._id, { password: hashedPassword });
  await Session.deleteMany({ userId: user._id });
}
