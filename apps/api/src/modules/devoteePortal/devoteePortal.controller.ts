import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { devoteeRegisterSchema, devoteeSchema } from '@temple/shared';
import bcrypt from 'bcryptjs';
import { BadRequestError, NotFoundError } from '../../common/errors.js';

export class DevoteePortalController {
  constructor(private readonly prisma: PrismaClient) {}

  async registerDevotee(request: FastifyRequest, reply: FastifyReply) {
    const input = devoteeRegisterSchema.parse(request.body);

    const existingUser = await this.prisma.user.findUnique({
      where: { username: input.username }
    });
    if (existingUser) {
      throw new BadRequestError(`Username '${input.username}' is already taken.`);
    }

    let devotee = await this.prisma.devotee.findFirst({
      where: { phone: input.phone }
    });

    if (!devotee) {
      devotee = await this.prisma.devotee.create({
        data: {
          name: input.fullName,
          phone: input.phone,
          email: input.email || undefined,
          gotra: input.gotra || undefined,
          nakshatra: input.nakshatra || undefined,
          rashi: input.rashi || undefined,
          city: input.city || undefined
        }
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        fullName: input.fullName,
        passwordHash,
        role: 'DEVOTEE',
        devoteeId: devotee.id
      }
    });

    const token = request.server.jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role as any
    });

    return reply.status(201).send({
      message: 'Devotee account registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        devoteeId: user.devoteeId
      }
    });
  }

  async getMyProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { devotee: true }
    });

    if (!user || !user.devotee) {
      throw new NotFoundError('Devotee profile not found');
    }

    return reply.send({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      },
      devotee: user.devotee
    });
  }

  async updateMyProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.devoteeId) {
      throw new NotFoundError('Devotee profile not found');
    }

    const input = devoteeSchema.parse(request.body);
    const updatedDevotee = await this.prisma.devotee.update({
      where: { id: user.devoteeId },
      data: input
    });

    return reply.send({
      message: 'Profile updated successfully',
      devotee: updatedDevotee
    });
  }

  async getMyReceipts(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.devoteeId) {
      throw new NotFoundError('Devotee profile not found');
    }

    const receipts = await this.prisma.receipt.findMany({
      where: { devoteeId: user.devoteeId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            seva: true,
            shashwataSeva: true
          }
        }
      }
    });

    return reply.send({ data: receipts });
  }
}
