import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { Hypermedia } from '@common/base/application/decorator/hypermedia.decorator';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { SectionResponseDto } from '@module/section/application/dto/section.response.dto';
import { UpdateSectionDto } from '@module/section/application/dto/update.section.dto';
import { SectionService } from '@module/section/application/service/section.service';

import { CreateSectionDto } from '../application/dto/create.section.dto';

@Controller('course/:courseId/section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
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
  saveOneSection(
    @Body() createSectionDto: Omit<CreateSectionDto, 'courseId'>,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<SectionResponseDto> {
    return this.sectionService.saveOne({ ...createSectionDto, courseId });
  }

  @Patch(':id')
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
