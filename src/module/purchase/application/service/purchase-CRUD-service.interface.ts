import { ICRUDService } from '@common/base/application/service/crud-service.interface';

import { CreatePurchaseDto } from '@purchase/application/dto/create-purchase.dto';
import { PurchaseResponseDto } from '@purchase/application/dto/purchase-response.dto';
import { UpdatePurchaseDto } from '@purchase/application/dto/update-purchase.dto';
import { Purchase } from '@purchase/domain/purchase.entity';

export const PURCHASE_CRUD_SERVICE_KEY = 'purchase_crud_service';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPurchaseCRUDService
  extends Omit<
    ICRUDService<
      Purchase,
      PurchaseResponseDto,
      CreatePurchaseDto,
      UpdatePurchaseDto
    >,
    'deleteOneByIdOrFail'
  > {}
