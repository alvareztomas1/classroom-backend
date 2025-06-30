import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';

import { CreatePaymentMethodDto } from '@module/payment-method/application/dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from '@module/payment-method/application/dto/payment-method-response.dto';
import { PaymentMethodFieldsQueryParamsDto } from '@module/payment-method/application/dto/query-params/payment-method-fields-query-params.dto';
import { PaymentMethodFilterQueryParamsDto } from '@module/payment-method/application/dto/query-params/payment-method-filter-query-params.dto';
import { PaymentMethodSortQueryParamsDto } from '@module/payment-method/application/dto/query-params/payment-method-sort-query-params.dto';
import { UpdatePaymentMethodDto } from '@module/payment-method/application/dto/update-payment-method.dto';
import { PaymentMethodCRUDService } from '@module/payment-method/application/service/payment-method-crud.service';

@Controller('payment-method')
export class PaymentMethodController {
  constructor(
    private readonly paymentMethodService: PaymentMethodCRUDService,
  ) {}

  @Get()
  async getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: PaymentMethodFilterQueryParamsDto,
    @Query('fields') fields: PaymentMethodFieldsQueryParamsDto,
    @Query('sort') sort: PaymentMethodSortQueryParamsDto,
  ): Promise<CollectionDto<PaymentMethodResponseDto>> {
    return await this.paymentMethodService.getAll({
      page,
      filter,
      fields: fields.target,
      sort,
    });
  }

  @Get(':id')
  async getOneById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentMethodResponseDto> {
    return this.paymentMethodService.getOneByIdOrFail(id);
  }

  @Post()
  async saveOne(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    return await this.paymentMethodService.saveOne(createPaymentMethodDto);
  }

  @Patch(':id')
  async updateOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    return await this.paymentMethodService.updateOne(
      id,
      updatePaymentMethodDto,
    );
  }

  @Delete(':id')
  async deleteOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuccessOperationResponseDto> {
    return this.paymentMethodService.deleteOneByIdOrFail(id);
  }
}
