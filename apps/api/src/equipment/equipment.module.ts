import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EquipmentListingsService } from './equipment-listings.service';
import { EquipmentRequestsService } from './equipment-requests.service';
import { EquipmentBidsService } from './equipment-bids.service';
import { OperatorsService } from './operators.service';
import { EquipmentController } from './equipment.controller';
import { EquipmentRequestsController } from './equipment-requests.controller';
import { OperatorsController } from './operators.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EquipmentController, EquipmentRequestsController, OperatorsController],
  providers: [EquipmentListingsService, EquipmentRequestsService, EquipmentBidsService, OperatorsService],
  exports: [EquipmentListingsService, EquipmentRequestsService, EquipmentBidsService, OperatorsService],
})
export class EquipmentModule {}
