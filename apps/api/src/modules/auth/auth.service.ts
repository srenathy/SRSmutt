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
    let user = await this.userRepo.findByUsername(input.username);

    // If no direct user account, check if devotee exists with this phone number
    if (!user) {
      const cleanPhone = input.username.replace(/\D/g, '');
      if (cleanPhone.length >= 7) {
        const devotee = await (this.userRepo as any).prisma.devotee.findFirst({
          where: { phone: { contains: cleanPhone.slice(-10) } }
        });
        if (devotee) {
          // Auto-provision user account with mobile number as default password
          const defaultHash = await bcrypt.hash(devotee.phone, 10);
          user = await (this.userRepo as any).prisma.user.create({
            data: {
              username: devotee.phone,
              passwordHash: defaultHash,
              fullName: devotee.name,
              role: 'DEVOTEE',
              devoteeId: devotee.id
            }
          });
        }
      }
    }

    if (!user) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid username or password');
    }

    // First time login is flagged if devotee is logging in with default mobile number password
    const cleanPhone = (user.username || '').replace(/\D/g, '');
    const isFirstTimeLogin = user.role === 'DEVOTEE' && (input.password === cleanPhone || input.password === user.username);

    const userResponse: UserResponse & { isFirstTimeLogin?: boolean } = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role as any,
      canAccessBilling: user.canAccessBilling,
      canAccessExpenses: user.canAccessExpenses,
      canAccessReports: user.canAccessReports,
      canAccessMasters: user.canAccessMasters,
      canApproveExpenses: user.canApproveExpenses,
      isFirstTimeLogin,
      createdAt: user.createdAt
    };

    return {
      user: userResponse,
      isFirstTimeLogin,
      tokenPayload: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  }

  async changeFirstTimePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.updatePasswordHash(userId, newHash);
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
      canAccessBilling: user.canAccessBilling,
      canAccessExpenses: user.canAccessExpenses,
      canAccessReports: user.canAccessReports,
      canAccessMasters: user.canAccessMasters,
      canApproveExpenses: user.canApproveExpenses,
      createdAt: user.createdAt
    };
  }
}
