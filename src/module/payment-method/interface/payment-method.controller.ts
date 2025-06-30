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
  UseGuards,
} from '@nestjs/common';

import { Hypermedia } from '@common/base/application/decorator/hypermedia.decorator';
import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { Policies } from '@module/iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@module/iam/authorization/infrastructure/policy/guard/policy.guard';
import { CreatePaymentMethodDto } from '@module/payment-method/application/dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from '@module/payment-method/application/dto/payment-method-response.dto';
import { PaymentMethodFieldsQueryParamsDto } from '@module/payment-method/application/dto/query-params/payment-method-fields-query-params.dto';
import { PaymentMethodFilterQueryParamsDto } from '@module/payment-method/application/dto/query-params/payment-method-filter-query-params.dto';
import { PaymentMethodSortQueryParamsDto } from '@module/payment-method/application/dto/query-params/payment-method-sort-query-params.dto';
import { UpdatePaymentMethodDto } from '@module/payment-method/application/dto/update-payment-method.dto';
import { CreatePaymentMethodPolicyHandler } from '@module/payment-method/application/policy/create-payment-method-policy.handler';
import { DeletePaymentMethodPolicyHandler } from '@module/payment-method/application/policy/delete-payment-method-policy.handler';
import { UpdatePaymentMethodPolicyHandler } from '@module/payment-method/application/policy/update-payment-method-policy.handler';
import { PaymentMethodCRUDService } from '@module/payment-method/application/service/payment-method-crud.service';

@Controller('payment-method')
@UseGuards(PoliciesGuard)
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
  @Hypermedia([
    {
      endpoint: '/payment-method',
      rel: 'create-payment-method',
      method: HttpMethod.POST,
    },
    {
      endpoint: '/payment-method/:id',
      rel: 'update-payment-method',
      method: HttpMethod.PATCH,
    },
    {
      endpoint: '/payment-method/:id',
      rel: 'delete-payment-method',
      method: HttpMethod.DELETE,
    },
  ])
  async getOneById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentMethodResponseDto> {
    return this.paymentMethodService.getOneByIdOrFail(id);
  }

  @Post()
  @Hypermedia([
    {
      endpoint: '/payment-method/:id',
      rel: 'get-payment-method',
      method: HttpMethod.GET,
    },
    {
      endpoint: '/payment-method/:id',
      rel: 'update-payment-method',
      method: HttpMethod.PATCH,
    },
    {
      endpoint: '/payment-method/:id',
      rel: 'delete-payment-method',
      method: HttpMethod.DELETE,
    },
  ])
  @Policies(CreatePaymentMethodPolicyHandler)
  async saveOne(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    return await this.paymentMethodService.saveOne(createPaymentMethodDto);
  }

  @Patch(':id')
  @Hypermedia([
    {
      endpoint: '/payment-method/:id',
      rel: 'get-payment-method',
      method: HttpMethod.GET,
    },
    {
      endpoint: '/payment-method/:id',
      rel: 'create-payment-method',
      method: HttpMethod.POST,
    },
    {
      endpoint: '/payment-method/:id',
      rel: 'delete-payment-method',
      method: HttpMethod.DELETE,
    },
  ])
  @Policies(UpdatePaymentMethodPolicyHandler)
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
  @Hypermedia([
    {
      endpoint: '/payment-method/:id',
      rel: 'create-payment-method',
      method: HttpMethod.POST,
    },
  ])
  @Policies(DeletePaymentMethodPolicyHandler)
  async deleteOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuccessOperationResponseDto> {
    return this.paymentMethodService.deleteOneByIdOrFail(id);
  }
}
