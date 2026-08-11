import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '@temple/shared';
import { ForbiddenError } from '../common/errors.js';

export function roleGuard(allowedRoles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = request.user;
    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenError(`Access denied: required role in [${allowedRoles.join(', ')}]`);
    }
  };
}
