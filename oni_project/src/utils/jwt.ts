import * as jwt from 'jsonwebtoken';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export function generateToken(
  payload: object,
  secret: jwt.Secret,
  expiresIn: jwt.SignOptions['expiresIn'],
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string, secret: jwt.Secret) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}