import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { IPaymentProvider } from '@payment/application/interface/payment-provider.interface';
import { PaymentMethod } from '@payment/domain/payment-method.enum';
import { PaymentProviderStorage } from '@payment/infrastructure/storage/payment-provider.storage';

describe('PaymentProviderStorage', () => {
  let service: PaymentProviderStorage;
  const mockPaymentProvider: IPaymentProvider = {
    createPaymentOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentProviderStorage],
    }).compile();

    service = module.get<PaymentProviderStorage>(PaymentProviderStorage);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('add() method', () => {
    it('Should add a payment provider to the collection', () => {
      service.add(PaymentMethod.PayPal, mockPaymentProvider);
      expect(service['collection'].has(PaymentMethod.PayPal)).toBeTruthy();
      expect(service['collection'].get(PaymentMethod.PayPal)).toBe(
        mockPaymentProvider,
      );
    });

    it('Should overwrite existing provider if same key is used', () => {
      const newMockProvider: IPaymentProvider = {
        createPaymentOrder: jest.fn(),
      };

      service.add(PaymentMethod.PayPal, mockPaymentProvider);
      service.add(PaymentMethod.PayPal, newMockProvider);

      expect(service['collection'].size).toBe(1);
      expect(service['collection'].get(PaymentMethod.PayPal)).toBe(
        newMockProvider,
      );
    });
  });

  describe('get() method', () => {
    it('Should return the correct payment provider when it exists', () => {
      service.add(PaymentMethod.PayPal, mockPaymentProvider);
      const result = service.get(PaymentMethod.PayPal);
      expect(result).toBe(mockPaymentProvider);
    });

    it('Should throw InternalServerErrorException when provider does not exist', () => {
      const nonExistentMethod = 'NonExistentMethod' as PaymentMethod;
      expect(() => service.get(nonExistentMethod)).toThrow(
        InternalServerErrorException,
      );
      expect(() => service.get(nonExistentMethod)).toThrow(
        `Can't find instance of payment provider "${nonExistentMethod}".`,
      );
    });
  });

  describe('Integration between add and get', () => {
    it('Should be able to retrieve what was added', () => {
      const stripeProvider: IPaymentProvider = {
        createPaymentOrder: jest.fn(),
      };
      const stripeProviderKey = 'StripeProvider' as PaymentMethod;

      service.add(stripeProviderKey, stripeProvider);
      const retrieved = service.get(stripeProviderKey);

      expect(retrieved).toBe(stripeProvider);
    });

    it('Should maintain separate entries for different providers', () => {
      const paypalProvider: IPaymentProvider = {
        createPaymentOrder: jest.fn(),
      };
      const stripeProvider: IPaymentProvider = {
        createPaymentOrder: jest.fn(),
      };
      const stripeProviderKey = 'StripeProvider' as PaymentMethod;

      service.add(PaymentMethod.PayPal, paypalProvider);
      service.add(stripeProviderKey, stripeProvider);

      expect(service.get(PaymentMethod.PayPal)).toBe(paypalProvider);
      expect(service.get(stripeProviderKey)).toBe(stripeProvider);
      expect(service['collection'].size).toBe(2);
    });
  });
});
