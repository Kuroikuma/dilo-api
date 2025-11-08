import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class WorkflowDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  id?: string | null;
}

class FileUploadDto {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

class ChatkitConfigurationDto {
  @ApiPropertyOptional({ type: () => FileUploadDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FileUploadDto)
  file_upload?: FileUploadDto;
}

export class CreateSessionRequestBodyDto {
  @ApiPropertyOptional({ type: () => WorkflowDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowDto)
  workflow?: WorkflowDto | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  workflowId?: string | null;

  @ApiPropertyOptional({ type: () => ChatkitConfigurationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ChatkitConfigurationDto)
  chatkit_configuration?: ChatkitConfigurationDto;
}
