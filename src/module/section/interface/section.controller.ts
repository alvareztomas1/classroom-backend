import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Hypermedia } from '@common/base/application/decorator/hypermedia.decorator';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { Policies } from '@module/iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@module/iam/authorization/infrastructure/policy/guard/policy.guard';
import { SectionResponseDto } from '@module/section/application/dto/section.response.dto';
import { UpdateSectionDto } from '@module/section/application/dto/update.section.dto';
import { CreateSectionPolicyHandler } from '@module/section/application/policy/create-section-policy.handler';
import { UpdateSectionPolicyHandler } from '@module/section/application/policy/update-section-policy.handler';
import { SectionService } from '@module/section/application/service/section.service';

import { CreateSectionDtoQuery } from '../application/dto/create.section.dto';

@Controller('course/:courseId/section')
@UseGuards(PoliciesGuard)
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @Policies(CreateSectionPolicyHandler)
  @Hypermedia([
    {
      endpoint: '/course/:courseId/section/:id',
      method: HttpMethod.PATCH,
      rel: 'update-section',
    },
    {
      endpoint: '/course/:courseId/section/:id',
      method: HttpMethod.DELETE,
      rel: 'delete-section',
    },
  ])
  saveOne(
    @Body() createSectionDto: CreateSectionDtoQuery,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<SectionResponseDto> {
    return this.sectionService.saveOne({ ...createSectionDto, courseId });
  }

  @Patch(':id')
  @Policies(UpdateSectionPolicyHandler)
  @Hypermedia([
    {
      method: HttpMethod.POST,
      rel: 'create-section',
      endpoint: '/course/:courseId/section',
    },
    {
      endpoint: '/course/:courseId/section/:id',
      method: HttpMethod.DELETE,
      rel: 'delete-section',
    },
  ])
  async updateOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSectionDto,
  ): Promise<SectionResponseDto> {
    return this.sectionService.updateOne(id, updateDto);
  }

  @Delete(':id')
  async deleteOneByIdOrFail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuccessOperationResponseDto> {
    return this.sectionService.deleteOneByIdOrFail(id);
  }
}
