import { FastifyRequest, FastifyReply } from 'fastify';
import { loginSchema, changePasswordSchema } from '@temple/shared';
import { IAuthService } from './auth.service.js';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    const input = loginSchema.parse(request.body);
    const { user, tokenPayload } = await this.authService.login(input);
    const token = await reply.jwtSign(tokenPayload);

    return reply.send({
      token,
      user
    });
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const input = changePasswordSchema.parse(request.body);
    await this.authService.changePassword(userId, input);

    return reply.send({
      message: 'Password changed successfully'
    });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const user = await this.authService.getCurrentUser(userId);

    return reply.send({ user });
  }
}
