import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';

import { Hypermedia } from '@common/base/application/decorator/hypermedia.decorator';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { SectionResponseDto } from '@module/section/application/dto/section.response.dto';
import { UpdateSectionDto } from '@module/section/application/dto/update.section.dto';
import { SectionService } from '@module/section/application/service/section.service';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Patch(':id')
  @Hypermedia([
    {
      endpoint: '/section/:id',
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
