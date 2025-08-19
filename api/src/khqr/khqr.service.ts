import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import * as crypto from 'crypto';
import { KHQR, CURRENCY, COUNTRY, TAG } from 'ts-khqr';
import { KhQr } from './entities/khqr.entity';
import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import appConfig from 'src/core/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  BakongTransactionStatus,
  ReCheckTransactionInterface,
  ReCheckTransactionListInterface,
} from './interfaces/res-check-transaction.interface';
import { BakongStatus } from 'src/auth/role.enum';
import { KhQrInfo } from 'src/users/khqr.interface';

@Injectable()
export class KhqrService {
  constructor(
    @InjectRepository(KhQr)
    private khQRRepository: Repository<KhQr>,
    private httpService: HttpService,
  ) {}

  logger = new Logger(KhqrService.name);

  generateBakong(
    amount: number,
    khQr: KhQrInfo,
  ): {
    md5: string;
    qr: string;
  } {
    this.logger.log('Generate order with amount', amount);
    this.logger.log('ENV', process.env.NODE_ENV);

    const result = KHQR.generate({
      tag: TAG.TAG_29,
      accountID: khQr?.accountID,
      merchantName: khQr?.merchantName,
      merchantCity: khQr?.merchantCity,
      acquiringBank: khQr?.acquiringBank,
      currency: CURRENCY.USD,
      countryCode: COUNTRY.KH,
      merchantID: khQr?.merchantID,
      amount,
    });

    this.logger.log('Generate QR:', result);

    if (!result) {
      throw new BadRequestException('failed to generate order qr');
    }

    return {
      md5: result.data.md5,
      qr: result.data.qr,
    };
  }

  parseQrString(data: string): KhQrInfo {
    const result = KHQR.parse(data);

    this.logger.log('Parse QR String:', result);
    return {
      tag: TAG.TAG_29,
      accountID: result.data.bakongAccountID,
      merchantName: result.data.merchantName,
      merchantCity: result.data.merchantCity,
      acquiringBank: result.data.acquiringBank,
      merchantID: result.data.accountInformation,
    };
  }

  async newTransaction(amount: number, payment?: KhQrInfo): Promise<KhQr> {
    this.logger.log('New Transaction with amount', amount);

    const generateBakong = this.generateBakong(amount, payment);

    const khqrTransaction = new KhQr();
    khqrTransaction.data = generateBakong.qr;
    khqrTransaction.md5 = generateBakong.md5;
    khqrTransaction.amount = amount;

    return this.khQRRepository.save(khqrTransaction);
  }

  async validateTransaction(qr: KhQr): Promise<KhQr | undefined> {
    const result = await this.checkTransactionMd5(qr.md5);

    if (result && result.responseMessage === BakongTransactionStatus.Success) {
      qr.status = BakongStatus.Success;
      qr.amount = result.data.amount;
      qr.currency = result.data.currency;
      qr.fromAccountId = result.data.fromAccountId;
      qr.toAccountId = result.data.toAccountId;

      return this.khQRRepository.save(qr);
    }

    return undefined;
  }

  async checkTransactionMd5(
    md5: string,
  ): Promise<ReCheckTransactionInterface | undefined> {
    if (appConfig.appEnv === 'testing') {
      return {
        data: {
          amount: 0.1,
          currency: 'USD',
          fromAccountId: '123',
          toAccountId: '123',
        },
        responseMessage: BakongTransactionStatus.Success,
      };
    }

    this.logger.log('MD5:', md5);

    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post(
            `https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5`,
            {
              md5,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${appConfig.bakongToken}`,
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw 'An error happened!';
            }),
          ),
      );

      this.logger.warn(data);

      const res = data as ReCheckTransactionInterface;

      return res;
    } catch (error) {
      this.logger.warn('Call to KHQR Service');
      this.logger.warn(error);
      return undefined;
    }
  }

  async checkTransactionMd5List(
    md5: string[],
    from: string,
  ): Promise<ReCheckTransactionListInterface[]> {
    if (appConfig.appEnv === 'testing') {
      return [
        {
          md5: 'sdasd',
          data: {
            amount: 0.1,
            currency: 'USD',
            fromAccountId: '123',
            toAccountId: '123',
          },
        },
      ];
    }
    return [];

    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post(
            `https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5_list`,
            md5,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${appConfig.bakongToken}`,
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw 'An error happened!';
            }),
          ),
      );
      const res = data.data as ReCheckTransactionListInterface[];
      return res;
    } catch (error) {
      this.logger.warn('Call to KHQR Service LIST:' + from);
      this.logger.warn(error);
      return undefined;
    }
  }

  getHash(hashStr: string): string {
    const apiKey = appConfig.abaApiKey;
    const hmac = crypto.createHmac('sha512', apiKey);
    hmac.update(hashStr);
    const hash = hmac.digest('base64');

    this.logger.log(apiKey);
    this.logger.log(hash);
    return hash;
  }

  getApiUrl(): string {
    this.logger.log(appConfig.abaApiUrl);
    return appConfig.abaApiUrl;
  }

  async checkTransactionAba(no: string): Promise<
    | {
        payment_status_code: number;
        total_amount: number;
        payment_status: string;
        no: string;
      }
    | undefined
  > {
    this.logger.log('checkTransactionAba');
    if (appConfig.appEnv === 'testing') {
      return {
        no: 'no12312',
        payment_status_code: 1,
        total_amount: 2,
        payment_status: 'APPROVED',
      };
    }
    const now = Date.now();

    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post(
            `https://checkout.payway.com.kh/api/payment-gateway/v1/payments/check-transaction-2`,
            {
              req_time: now,
              merchant_id: appConfig.merchantId,
              tran_id: no,
              hash: this.getHash(`${now}${appConfig.merchantId}${no}`),
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw 'An error happened!';
            }),
          ),
      );

      const res = data as {
        data: {
          payment_status_code: number;
          total_amount: number;
          payment_status: string;
          no: string;
        };
      };
      res.data.no = no;
      this.logger.warn(res.data);
      return res.data;
    } catch (error) {
      this.logger.warn('Call to KHQR Service');
      this.logger.warn(error);
      return undefined;
    }
  }
}
