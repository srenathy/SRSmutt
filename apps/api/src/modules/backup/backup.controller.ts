import { FastifyRequest, FastifyReply } from 'fastify';
import { IBackupService } from './backup.service.js';

export class BackupController {
  constructor(private readonly service: IBackupService) {}

  async export(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    const backupData = await this.service.exportDatabase(userId);
    
    reply.header('Content-Type', 'application/json');
    reply.header('Content-Disposition', `attachment; filename="srsmutt-backup-${new Date().toISOString().split('T')[0]}.json"`);
    return reply.send(backupData);
  }
}
