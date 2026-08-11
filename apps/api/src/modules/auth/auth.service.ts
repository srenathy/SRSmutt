import bcrypt from 'bcryptjs';
import { LoginInput, ChangePasswordInput, UserResponse } from '@temple/shared';
import { IUserRepository } from './auth.repository.js';
import { UnauthorizedError, NotFoundError, BadRequestError } from '../../common/errors.js';

export interface IAuthService {
  login(input: LoginInput): Promise<{ user: UserResponse; tokenPayload: { id: string; username: string; role: any } }>;
  changePassword(userId: string, input: ChangePasswordInput): Promise<void>;
  getCurrentUser(userId: string): Promise<UserResponse>;
}

export class AuthService implements IAuthService {
  constructor(private readonly userRepo: IUserRepository) {}

  async login(input: LoginInput) {
    const user = await this.userRepo.findByUsername(input.username);
    if (!user) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const userResponse: UserResponse = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role as any,
      createdAt: user.createdAt
    };

    return {
      user: userResponse,
      tokenPayload: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Incorrect current password');
    }

    const newHash = await bcrypt.hash(input.newPassword, 10);
    await this.userRepo.updatePasswordHash(userId, newHash);
  }

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role as any,
      createdAt: user.createdAt
    };
  }
}
