declare namespace NodeJS {
    interface ProcessEnv {
      INFURA_URL: string;
      INFURA_API_KEY: string;
      JWT_PUBLIC_KEY: string;
      JWT_PRIVATE_KEY: string;
      JWT_KEY_NAME: string;
    }
  }