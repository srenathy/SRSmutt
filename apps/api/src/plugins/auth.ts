import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { env } from '../config/env.js';
import { Role } from '@temple/shared';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; username: string; role: Role };
    user: { id: string; username: string; role: Role };
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: '7d'
    }
  });

  fastify.log.info('JWT Authentication plugin registered');
};

export default fp(authPlugin);
