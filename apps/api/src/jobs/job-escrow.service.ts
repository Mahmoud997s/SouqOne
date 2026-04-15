import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class JobEscrowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /* ───── INITIATE PAYMENT (create escrow) ───── */
  async pay(applicationId: string, userId: string, amount: number) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true, escrow: true },
    });

    if (!application) throw new NotFoundException('الطلب غير موجود');
    if (application.job.userId !== userId) throw new ForbiddenException('فقط صاحب العمل يمكنه الدفع');
    if (application.status !== 'ACCEPTED') throw new BadRequestException('يجب قبول الطلب أولاً');
    if (application.escrow) throw new ConflictException('تم الدفع مسبقاً لهذا الطلب');
    if (amount <= 0) throw new BadRequestException('المبلغ يجب أن يكون أكبر من صفر');

    const escrow = await this.prisma.jobEscrow.create({
      data: {
        applicationId,
        amount,
      },
    });

    // Notify the driver
    await this.notifications.create({
      userId: application.applicantId,
      type: 'SYSTEM' as any,
      title: 'تم الدفع',
      body: `تم دفع ${(amount / 1000).toFixed(3)} ر.ع. مقابل طلبك`,
      data: { escrowId: escrow.id, applicationId },
    }).catch(() => {});

    return escrow;
  }

  /* ───── RELEASE FUNDS TO DRIVER ───── */
  async release(escrowId: string, userId: string) {
    const escrow = await this.prisma.jobEscrow.findUnique({
      where: { id: escrowId },
      include: { application: { include: { job: true } } },
    });

    if (!escrow) throw new NotFoundException('سجل الضمان غير موجود');
    if (escrow.application.job.userId !== userId) throw new ForbiddenException('فقط صاحب العمل يمكنه تحرير الأموال');
    if (escrow.status !== 'HELD') throw new BadRequestException(`لا يمكن تحرير أموال بحالة: ${escrow.status}`);

    const updated = await this.prisma.jobEscrow.update({
      where: { id: escrowId },
      data: { status: 'RELEASED', releasedAt: new Date() },
    });

    // Notify the driver
    await this.notifications.create({
      userId: escrow.application.applicantId,
      type: 'SYSTEM' as any,
      title: 'تم تحرير الأموال',
      body: `تم تحويل ${(escrow.amount / 1000).toFixed(3)} ر.ع. إلى حسابك`,
      data: { escrowId },
    }).catch(() => {});

    return updated;
  }

  /* ───── OPEN DISPUTE ───── */
  async dispute(escrowId: string, userId: string, reason?: string) {
    const escrow = await this.prisma.jobEscrow.findUnique({
      where: { id: escrowId },
      include: { application: { include: { job: true } } },
    });

    if (!escrow) throw new NotFoundException('سجل الضمان غير موجود');

    // Either employer or driver can open dispute
    const isEmployer = escrow.application.job.userId === userId;
    const isDriver = escrow.application.applicantId === userId;
    if (!isEmployer && !isDriver) throw new ForbiddenException('غير مصرح');
    if (escrow.status !== 'HELD') throw new BadRequestException(`لا يمكن فتح نزاع بحالة: ${escrow.status}`);

    const updated = await this.prisma.jobEscrow.update({
      where: { id: escrowId },
      data: { status: 'DISPUTED' },
    });

    // Notify admin or the other party
    const otherPartyId = isEmployer ? escrow.application.applicantId : escrow.application.job.userId;
    await this.notifications.create({
      userId: otherPartyId,
      type: 'SYSTEM' as any,
      title: 'تم فتح نزاع',
      body: reason || 'تم فتح نزاع على الدفع',
      data: { escrowId },
    }).catch(() => {});

    return updated;
  }

  /* ───── GET ESCROW BY APPLICATION ───── */
  async getByApplication(applicationId: string) {
    return this.prisma.jobEscrow.findUnique({
      where: { applicationId },
    });
  }
}
