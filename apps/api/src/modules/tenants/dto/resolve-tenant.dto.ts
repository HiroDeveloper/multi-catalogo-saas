import { IsString, MaxLength } from 'class-validator';

export class ResolveTenantDto {
  @IsString()
  @MaxLength(255)
  hostname!: string;
}
