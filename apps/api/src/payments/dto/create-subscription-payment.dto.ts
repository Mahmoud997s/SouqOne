import { IsIn } from 'class-validator';

export class CreateSubscriptionPaymentDto {
  @IsIn(['PRO', 'ENTERPRISE'])
  plan!: 'PRO' | 'ENTERPRISE';
}
