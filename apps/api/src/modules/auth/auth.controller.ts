import { FastifyRequest, FastifyReply } from 'fastify';
import { loginSchema, changePasswordSchema } from '@temple/shared';
import { IAuthService } from './auth.service.js';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    const input = loginSchema.parse(request.body);
    const { user, tokenPayload, isFirstTimeLogin } = await this.authService.login(input) as any;
    const token = await reply.jwtSign(tokenPayload);

    return reply.send({
      token,
      user,
      isFirstTimeLogin: isFirstTimeLogin || false
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

  async changeFirstTimePassword(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const { newPassword } = request.body as any;
    if (!newPassword || newPassword.trim().length < 4) {
      return reply.status(400).send({ message: 'New password must be at least 4 characters.' });
    }
    await (this.authService as any).changeFirstTimePassword(userId, newPassword.trim());
    return reply.send({ message: 'First time password updated successfully' });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const user = await this.authService.getCurrentUser(userId);

    return reply.send({ user });
  }
}
