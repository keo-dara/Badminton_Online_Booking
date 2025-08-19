import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { BakongStatus } from 'src/auth/role.enum';
import { KhqrService } from 'src/khqr/khqr.service';
import { KhQrInfo } from 'src/users/khqr.interface';

describe('KHQR Integration Test', () => {
  let khqrService: KhqrService;

  let info: KhQrInfo;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    khqrService = moduleRef.get(KhqrService);
    info = khqrService.parseQrString(
      '00020101021229180014ma_seanda@aclb52045999530384054040.105802KH5909Ma Seanda6010Phnom Penh9917001317274280006106304D849',
    );
  });

  it('check transaction md5', async () => {
    const result = await khqrService.checkTransactionMd5('sdsadasdsdas');

    expect(result.data.amount).toBeDefined();
    expect(result.data.currency).toBeDefined();
    expect(result.data.fromAccountId).toBeDefined();
    expect(result.data.toAccountId).toBeDefined();
  });

  it('check transaction md5', async () => {
    const result = await khqrService.checkTransactionMd5List(
      ['sdsdadsaas'],
      'test',
    );
    expect(result.length).toBe(1);
  });

  describe('KH QR Function testing', () => {
    it('generation work', () => {
      const result = khqrService.generateBakong(0.1, info);

      expect(result.md5).toBeDefined();
      expect(result.qr).toBeDefined();
    });

    it('save khqr', async () => {
      const qr = await khqrService.newTransaction(0.1, info);

      expect(qr.id).toBe(1);
    });

    it('validate transaction', async () => {
      const qr = await khqrService.newTransaction(0.1, info);

      const result = await khqrService.validateTransaction(qr);

      expect(result.amount).toBe(0.1);
      expect(result.currency).toBe('USD');
      expect(result.status).toBe(BakongStatus.Success);
      expect(result.fromAccountId).toBe('123');
      expect(result.toAccountId).toBe('123');
    });

    it('generate hash work', () => {
      const transactionId = 'NO1125';
      const amount = '0.01';
      const firstName = '';
      const lastName = '';
      const phone = '';
      const email = '';
      const reqTime = 1739376737824;
      const merchantId = 'vsmashbadmintonclub';
      const paymentOption = 'abapay_khqr';

      const hashString = `${reqTime}${merchantId}${transactionId}${amount}${firstName}${lastName}${email}${phone}${paymentOption}`;
      const hash = khqrService.getHash(hashString);

      expect(hash).toBe(
        'QFrrJDe4np/q4+8i8kb0olw5xcO3H9tqj6iAWuAB6oyNe+FfCjzthPzG6xkOx72PcQdX+0yVzwd//J1ooA95rg==',
      );
    });
  });
});
