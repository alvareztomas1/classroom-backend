import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CurrentUser } from '@module/iam/authentication/infrastructure/decorator/current-user.decorator';
import { User } from '@module/iam/user/domain/user.entity';
import { CreatePurchaseDtoRequest } from '@module/purchase/application/dto/create-purchase.dto';
import { PurchaseResponseDto } from '@module/purchase/application/dto/purchase-response.dto';
import { UpdatePurchaseDto } from '@module/purchase/application/dto/update-purchase.dto';
import {
  IPurchaseCRUDService,
  PURCHASE_CRUD_SERVICE_KEY,
} from '@module/purchase/application/service/purchase-CRUD-service.interface';

@Controller('purchase')
export class PurchaseController {
  constructor(
    @Inject(PURCHASE_CRUD_SERVICE_KEY)
    private readonly purchaseService: IPurchaseCRUDService,
  ) {}

  @Get(':id')
  async getOneById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PurchaseResponseDto> {
    return await this.purchaseService.getOneByIdOrFail(id);
  }

  @Post()
  async saveOne(
    @Body() createPurchaseDto: CreatePurchaseDtoRequest,
    @CurrentUser() user: User,
  ): Promise<PurchaseResponseDto> {
    return await this.purchaseService.saveOne({
      ...createPurchaseDto,
      userId: user.id!,
    });
  }

  @Patch(':id')
  async updateOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    return await this.purchaseService.updateOneByIdOrFail(
      id,
      updatePurchaseDto,
    );
  }
}
