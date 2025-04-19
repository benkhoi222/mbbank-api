declare module 'mbbank' {
  interface MBConfig {
    username: string;
    password: string;
    preferredOCRMethod?: 'default' | 'tesseract' | 'custom';
    customOCRFunction?: (image: Buffer) => Promise<string>;
    saveWasm?: boolean;
  }

  interface TransactionHistoryParams {
    accountNumber: string;
    fromDate: string; // định dạng 'dd/mm/yyyy'
    toDate: string; // định dạng 'dd/mm/yyyy'
  }

  class MB {
    constructor(config: MBConfig);
    
    login(): Promise<any>;
    getBalance(): Promise<any>;
    getTransactionsHistory(params: TransactionHistoryParams): Promise<any>;
  }

  export { MB, MBConfig, TransactionHistoryParams };
} 