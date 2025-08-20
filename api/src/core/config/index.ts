const appConfig = {
  port: parseInt(process.env.PORT, 10) || 3001,
  X_API: process.env.X_API || 'ZGFzZGFzYXNkMTIzMjM=',
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME ?? 'mobile',
    autoLoadEntities: process.env.AUTOLOAD === 'true',
    dropSchema: process.env.DROPSCHEMA === 'true',
    synchronize: process.env.SYNC === 'true',
    log: process.env.LOGGING === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'defaultSecretKey',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
  moogoldApi: process.env.MOOGOLD_API ?? 'https://moogold-api.supasales.pro',
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_SECRET,
  },
  appEnv: process.env.APP_ENV,
  bakongToken: process.env.BAKONG_TOKEN,
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  abaApiKey: process.env.ABA_PAYWAY_API_KEY || '',
  merchantId: process.env.ABA_PAYWAY_MERCHANT_ID || '',
  abaApiUrl: process.env.ABA_PAYWAY_API_URL || '',
  isTestEnv: process.env.APP_ENV === 'testing',
  telegramGroup: process.env.TELEGRAM_GROUP,
};

export default appConfig;
