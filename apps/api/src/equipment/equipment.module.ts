import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { EquipmentRequestsController } from './equipment-requests.controller';
import { OperatorsController } from './operators.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EquipmentController, EquipmentRequestsController, OperatorsController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
