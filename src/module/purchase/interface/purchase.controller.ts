import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Hypermedia } from '@common/base/application/decorator/hypermedia.decorator';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@iam/authorization/infrastructure/policy/guard/policy.guard';
import { User } from '@iam/user/domain/user.entity';

import { CreatePurchaseDtoRequest } from '@purchase/application/dto/create-purchase.dto';
import { PurchaseResponseDto } from '@purchase/application/dto/purchase-response.dto';
import { UpdatePurchasePaymentMethodDto } from '@purchase/application/dto/update-purchase-payment-method.dto';
import { UpdatePurchaseStatusDto } from '@purchase/application/dto/update-purchase-status.dto';
import { ManagePurchasePolicyHandler } from '@purchase/application/policy/manage-purchase-policy.handler';
import { ReadPurchasePolicyHandler } from '@purchase/application/policy/read-purchase-policy.handler';
import { UpdatePurchasePaymentMethodPolicyHandler } from '@purchase/application/policy/update-purchase-payment-method.policy.handler';
import {
  IPurchaseCRUDService,
  PURCHASE_CRUD_SERVICE_KEY,
} from '@purchase/application/service/purchase-CRUD-service.interface';
import { Purchase } from '@purchase/domain/purchase.entity';

@Controller('purchase')
@UseGuards(PoliciesGuard)
export class PurchaseController {
  constructor(
    @Inject(PURCHASE_CRUD_SERVICE_KEY)
    private readonly purchaseService: IPurchaseCRUDService,
  ) {}

  @Get(':id')
  @Policies(ReadPurchasePolicyHandler)
  @Hypermedia([
    {
      rel: 'create-purchase',
      endpoint: '/purchase',
      method: HttpMethod.POST,
    },
    {
      rel: 'update-payment-method',
      endpoint: '/purchase/:id/payment-method',
      method: HttpMethod.PATCH,
    },
    {
      rel: 'update-status',
      endpoint: '/purchase/:id/status',
      method: HttpMethod.PATCH,
      action: AppAction.Manage,
      subject: Purchase,
    },
  ])
  async getOneById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PurchaseResponseDto> {
    return await this.purchaseService.getOneByIdOrFail(id);
  }

  @Post()
  @Hypermedia([
    {
      rel: 'get-purchase',
      endpoint: '/purchase/:id',
      method: HttpMethod.GET,
    },
    {
      rel: 'update-payment-method',
      endpoint: '/purchase/:id/payment-method',
      method: HttpMethod.PATCH,
    },
    {
      rel: 'update-status',
      endpoint: '/purchase/:id/status',
      method: HttpMethod.PATCH,
      action: AppAction.Manage,
      subject: Purchase,
    },
  ])
  async saveOne(
    @Body() createPurchaseDto: CreatePurchaseDtoRequest,
    @CurrentUser() user: User,
  ): Promise<PurchaseResponseDto> {
    return await this.purchaseService.saveOne({
      ...createPurchaseDto,
      userId: user.id!,
    });
  }

  @Patch(':id/status')
  @Policies(ManagePurchasePolicyHandler)
  @Hypermedia([
    {
      rel: 'get-purchase',
      endpoint: '/purchase/:id',
      method: HttpMethod.GET,
    },
    {
      rel: 'create-purchase',
      endpoint: '/purchase',
      method: HttpMethod.POST,
    },
    {
      rel: 'update-payment-method',
      endpoint: '/purchase/:id/payment-method',
      method: HttpMethod.PATCH,
    },
  ])
  async updateOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePurchaseDto: UpdatePurchaseStatusDto,
  ): Promise<PurchaseResponseDto> {
    return await this.purchaseService.updateStatusByIdOrFail(
      id,
      updatePurchaseDto,
    );
  }

  @Patch(':id/payment-method')
  @Policies(UpdatePurchasePaymentMethodPolicyHandler)
  @Hypermedia([
    {
      rel: 'get-purchase',
      endpoint: '/purchase/:id',
      method: HttpMethod.GET,
    },
    {
      rel: 'create-purchase',
      endpoint: '/purchase',
      method: HttpMethod.POST,
    },
    {
      rel: 'update-status',
      endpoint: '/purchase/:id/status',
      method: HttpMethod.PATCH,
      action: AppAction.Manage,
      subject: Purchase,
    },
  ])
  async updatePaymentMethod(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePurchasePaymentMethodDto: UpdatePurchasePaymentMethodDto,
  ): Promise<PurchaseResponseDto> {
    return await this.purchaseService.updatePaymentMethodByIdOrFail(
      id,
      updatePurchasePaymentMethodDto,
    );
  }
}
