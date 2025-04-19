// Import crypto polyfill before importing MB
import '../utils/crypto-polyfill';
import { MB } from 'mbbank';
import { Account } from '../models/account.model';
import dotenv from 'dotenv';

dotenv.config();

// Interface cho thông tin cấu hình MB Bank
interface MBBankConfig {
  username: string;
  password: string;
  preferredOCRMethod?: 'default' | 'tesseract' | 'custom';
  customOCRFunction?: (image: Buffer) => Promise<string>;
  saveWasm?: boolean;
}

// Interface kết quả trạng thái đăng nhập
export interface LoginStatus {
  success: boolean;
  message: string;
  data?: any;
  error_type?: string;
}

// Interface lịch sử giao dịch
export interface TransactionHistoryParams {
  accountNumber: string;
  fromDate: string; // định dạng 'dd/mm/yyyy'
  toDate: string; // định dạng 'dd/mm/yyyy'
}

// Quản lý cache các instance MB đã đăng nhập
class MBClientManager {
  private static clients: Map<string, MB> = new Map();

  // Lấy hoặc tạo mới client MB
  static async getClient(account: Account): Promise<MB> {
    // Nếu client đã tồn tại và đã đăng nhập, trả về
    if (this.clients.has(account.username)) {
      return this.clients.get(account.username)!;
    }

    // Tạo cấu hình MB từ tài khoản
    const config: MBBankConfig = {
      username: account.username,
      password: account.password,
      preferredOCRMethod: (process.env.PREFER_OCR_METHOD as 'default' | 'tesseract' | 'custom') || 'default',
      saveWasm: process.env.SAVE_WASM === 'true'
    };

    // Khởi tạo client mới
    const client = new MB(config);

    // Lưu client vào cache
    this.clients.set(account.username, client);

    return client;
  }

  // Xóa client khỏi cache
  static removeClient(username: string): void {
    this.clients.delete(username);
  }

  // Lấy toàn bộ client đã đăng nhập
  static getAllClients(): Map<string, MB> {
    return this.clients;
  }
}

// Service xử lý các chức năng của MB Bank
export class MBBankService {
  // Đăng nhập vào tài khoản MB Bank
  static async login(account: Account): Promise<LoginStatus> {
    try {
      const client = await MBClientManager.getClient(account);
      const result = await client.login();

      return {
        success: true,
        message: 'Đăng nhập thành công',
        data: result
      };
    } catch (error: any) {
      MBClientManager.removeClient(account.username);

      let errorMessage = error.message || 'Không xác định';
      let errorType = 'unknown_error';

      // Xử lý lỗi đăng nhập cụ thể
      if (errorMessage.includes('Customer is invalid')) {
        errorMessage = 'Sai tên đăng nhập hoặc mật khẩu';
        errorType = 'invalid_credentials';
      }

      return {
        success: false,
        message: `Lỗi đăng nhập: ${errorMessage}`,
        error_type: errorType
      };
    }
  }

  // Kiểm tra trạng thái đăng nhập
  static async checkLoginStatus(account: Account): Promise<LoginStatus> {
    try {
      // Lấy client hoặc tạo mới nếu chưa có
      const client = await MBClientManager.getClient(account);

      // Thử thực hiện một hoạt động đơn giản để kiểm tra trạng thái đăng nhập
      await client.getBalance();

      return {
        success: true,
        message: 'Đang đăng nhập',
        data: { username: account.username }
      };
    } catch (error: any) {
      // Xóa client khỏi cache vì đã hết hạn hoặc lỗi
      MBClientManager.removeClient(account.username);

      let errorMessage = error.message || 'Không xác định';
      let errorType = 'unknown_error';

      // Xử lý lỗi đăng nhập cụ thể
      if (errorMessage.includes('Customer is invalid')) {
        errorMessage = 'Sai tên đăng nhập hoặc mật khẩu';
        errorType = 'invalid_credentials';
      } else {
        errorMessage = 'Chưa đăng nhập hoặc phiên đã hết hạn';
        errorType = 'session_expired';
      }

      return {
        success: false,
        message: errorMessage,
        error_type: errorType
      };
    }
  }

  // Lấy số dư tài khoản
  static async getBalance(account: Account): Promise<any> {
    try {
      const client = await MBClientManager.getClient(account);
      return await client.getBalance();
    } catch (error: any) {
      // Nếu lỗi có thể do chưa đăng nhập, thử đăng nhập lại
      try {
        const client = await MBClientManager.getClient(account);
        await client.login();
        return await client.getBalance();
      } catch (retryError: any) {
        throw new Error(`Lỗi khi lấy số dư: ${retryError.message || 'Không xác định'}`);
      }
    }
  }

  // Lấy lịch sử giao dịch
  static async getTransactionHistory(
    account: Account,
    params: TransactionHistoryParams
  ): Promise<any> {
    try {
      const client = await MBClientManager.getClient(account);
      return await client.getTransactionsHistory(params);
    } catch (error: any) {
      // Nếu lỗi có thể do chưa đăng nhập, thử đăng nhập lại
      try {
        const client = await MBClientManager.getClient(account);
        await client.login();
        return await client.getTransactionsHistory(params);
      } catch (retryError: any) {
        throw new Error(`Lỗi khi lấy lịch sử giao dịch: ${retryError.message || 'Không xác định'}`);
      }
    }
  }

  // Đăng xuất tài khoản
  static logout(username: string): void {
    MBClientManager.removeClient(username);
  }
}