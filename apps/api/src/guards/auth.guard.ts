import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../common/errors.js';

export async function authGuard(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
}
