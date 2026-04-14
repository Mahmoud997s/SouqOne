import { IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PushKeys {
  @IsString()
  p256dh!: string;

  @IsString()
  auth!: string;
}

export class PushSubscriptionDto {
  @IsString()
  endpoint!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PushKeys)
  keys!: PushKeys;
}

export class PushUnsubscribeDto {
  @IsString()
  endpoint!: string;
}
