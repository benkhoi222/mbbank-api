import { Request, Response } from 'express';
import { MBBankService, TransactionHistoryParams } from '../services/mbbank.service';
import { AccountModel, Account } from '../models/account.model';
import { NotFoundError } from '../utils/error.utils';

export class MBBankController {
  // Đăng nhập vào tài khoản MB Bank
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);

      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }

      // Lấy thông tin tài khoản từ cơ sở dữ liệu
      const account = await AccountModel.getAccountById(accountId);

      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }

      // Thực hiện đăng nhập
      const loginResult = await MBBankService.login(account);

      // Phản hồi kết quả
      if (loginResult.success) {
        res.status(200).json(loginResult);
      } else {
        res.status(401).json(loginResult);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi đăng nhập: ${error.message}`
      });
    }
  }

  // Kiểm tra trạng thái đăng nhập
  static async checkLoginStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);

      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }

      // Lấy thông tin tài khoản từ cơ sở dữ liệu
      const account = await AccountModel.getAccountById(accountId);

      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }

      // Kiểm tra trạng thái đăng nhập
      const statusResult = await MBBankService.checkLoginStatus(account);

      // Phản hồi kết quả
      if (statusResult.success) {
        res.status(200).json(statusResult);
      } else {
        // Xử lý theo loại lỗi
        if (statusResult.error_type && statusResult.error_type === 'invalid_credentials') {
          res.status(401).json({
            success: false,
            message: 'Sai tên đăng nhập hoặc mật khẩu. Vui lòng cập nhật thông tin đăng nhập.',
            error_type: statusResult.error_type
          });
        } else {
          res.status(401).json(statusResult);
        }
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi kiểm tra trạng thái đăng nhập: ${error.message}`
      });
    }
  }

  // Lấy số dư tài khoản
  static async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);

      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }

      // Lấy thông tin tài khoản từ cơ sở dữ liệu
      const account = await AccountModel.getAccountById(accountId);

      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }

      // Lấy số dư tài khoản
      const balanceResult = await MBBankService.getBalance(account);

      res.status(200).json({
        success: true,
        data: balanceResult
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi lấy số dư tài khoản: ${error.message}`
      });
    }
  }

  // Lấy lịch sử giao dịch
  static async getTransactionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);

      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }

      // Lấy thông tin tài khoản từ cơ sở dữ liệu
      const account = await AccountModel.getAccountById(accountId);

      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }

      // Lấy thông tin từ query params
      const { accountNumber, fromDate, toDate } = req.query;

      // Kiểm tra các thông tin bắt buộc
      if (!accountNumber || !fromDate || !toDate) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: accountNumber, fromDate và toDate là bắt buộc'
        });
        return;
      }

      // Chuẩn bị dữ liệu cho API
      const params: TransactionHistoryParams = {
        accountNumber: accountNumber as string,
        fromDate: fromDate as string,
        toDate: toDate as string
      };

      // Lấy lịch sử giao dịch
      const transactionResult = await MBBankService.getTransactionHistory(account, params);

      res.status(200).json({
        success: true,
        data: transactionResult
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi lấy lịch sử giao dịch: ${error.message}`
      });
    }
  }

  // Đăng xuất tài khoản
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);

      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }

      // Lấy thông tin tài khoản từ cơ sở dữ liệu
      const account = await AccountModel.getAccountById(accountId);

      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }

      // Thực hiện đăng xuất
      MBBankService.logout(account.username);

      res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi đăng xuất: ${error.message}`
      });
    }
  }

  // Lấy số dư tài khoản sử dụng token
  static async getBalanceWithToken(req: Request, res: Response): Promise<void> {
    try {
      // Lấy thông tin tài khoản từ req.account đã được thiết lập bởi middleware
      const account = req.account as Account;

      if (!account) {
        throw new NotFoundError('Không tìm thấy thông tin tài khoản');
      }

      // Lấy số dư tài khoản
      const balanceResult = await MBBankService.getBalance(account);

      res.status(200).json({
        success: true,
        data: balanceResult
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: `Lỗi khi lấy số dư tài khoản: ${error.message}`
      });
    }
  }

  // Lấy lịch sử giao dịch sử dụng token
  static async getTransactionHistoryWithToken(req: Request, res: Response): Promise<void> {
    try {
      // Lấy thông tin tài khoản từ req.account đã được thiết lập bởi middleware
      const account = req.account as Account;

      if (!account) {
        throw new NotFoundError('Không tìm thấy thông tin tài khoản');
      }

      // Lấy thông tin từ query params
      const { accountNumber, fromDate, toDate } = req.query;

      // Kiểm tra các thông tin bắt buộc
      if (!accountNumber || !fromDate || !toDate) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: accountNumber, fromDate và toDate là bắt buộc'
        });
        return;
      }

      // Chuẩn bị dữ liệu cho API
      const params: TransactionHistoryParams = {
        accountNumber: accountNumber as string,
        fromDate: fromDate as string,
        toDate: toDate as string
      };

      // Lấy lịch sử giao dịch
      const transactionResult = await MBBankService.getTransactionHistory(account, params);

      res.status(200).json({
        success: true,
        data: transactionResult
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: `Lỗi khi lấy lịch sử giao dịch: ${error.message}`
      });
    }
  }

  // Kiểm tra trạng thái đăng nhập sử dụng token
  static async checkLoginStatusWithToken(req: Request, res: Response): Promise<void> {
    try {
      // Lấy thông tin tài khoản từ req.account đã được thiết lập bởi middleware
      const account = req.account as Account;

      if (!account) {
        throw new NotFoundError('Không tìm thấy thông tin tài khoản');
      }

      // Kiểm tra trạng thái đăng nhập
      const statusResult = await MBBankService.checkLoginStatus(account);

      // Phản hồi kết quả
      if (statusResult.success) {
        res.status(200).json(statusResult);
      } else {
        // Xử lý theo loại lỗi
        if (statusResult.error_type && statusResult.error_type === 'invalid_credentials') {
          res.status(401).json({
            success: false,
            message: 'Sai tên đăng nhập hoặc mật khẩu. Vui lòng cập nhật thông tin đăng nhập.',
            error_type: statusResult.error_type
          });
        } else {
          res.status(401).json(statusResult);
        }
      }
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: `Lỗi khi kiểm tra trạng thái đăng nhập: ${error.message}`
      });
    }
  }

  // Lấy lịch sử giao dịch theo số ngày sử dụng token
  static async getTransactionHistoryByDaysWithToken(req: Request, res: Response): Promise<void> {
    try {
      // Lấy thông tin tài khoản từ req.account đã được thiết lập bởi middleware
      const account = req.account as Account;

      if (!account) {
        throw new NotFoundError('Không tìm thấy thông tin tài khoản');
      }

      // Lấy thông tin từ query params
      const { accountNumber, days, fromDate: queryFromDate, toDate: queryToDate } = req.query;

      // Kiểm tra số tài khoản
      if (!accountNumber) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: accountNumber là bắt buộc'
        });
        return;
      }

      // Kiểm tra và tạo fromDate và toDate nếu chưa có
      let fromDate = queryFromDate as string;
      let toDate = queryToDate as string;

      // Nếu không có fromDate hoặc toDate, tự tính toán dựa trên tham số days
      if ((!fromDate || !toDate) && days) {
        const daysValue = Number(days);
        if (!isNaN(daysValue) && daysValue > 0 && daysValue <= 90) {
          // Tạo ngày hiện tại và đặt về 00:00:00
          const today = new Date();
          // Đặt múi giờ Việt Nam (UTC+7)
          today.setHours(today.getHours() + 7);
          today.setHours(0, 0, 0, 0);

          // Tính ngày bắt đầu
          const fromDateObj = new Date(today);
          fromDateObj.setDate(today.getDate() - daysValue + 1); // +1 để tính cả ngày hiện tại

          // Chuyển đổi sang định dạng dd/mm/yyyy
          const formatDate = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          };

          fromDate = formatDate(fromDateObj);
          toDate = formatDate(today);
        } else {
          res.status(400).json({
            success: false,
            message: 'Tham số days không hợp lệ. Phải là số nguyên dương và không vượt quá 90.'
          });
          return;
        }
      }

      // Kiểm tra lại fromDate và toDate sau khi tính toán
      if (!fromDate || !toDate) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: fromDate và toDate là bắt buộc hoặc cần cung cấp tham số days hợp lệ'
        });
        return;
      }

      // Chuẩn bị dữ liệu cho API
      const params: TransactionHistoryParams = {
        accountNumber: accountNumber as string,
        fromDate: fromDate,
        toDate: toDate
      };

      // Lấy lịch sử giao dịch
      const transactionResult = await MBBankService.getTransactionHistory(account, params);

      res.status(200).json({
        success: true,
        data: transactionResult
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: `Lỗi khi lấy lịch sử giao dịch: ${error.message}`
      });
    }
  }

  // Lấy lịch sử giao dịch theo số ngày
  static async getTransactionHistoryByDays(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);

      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }

      // Lấy thông tin tài khoản từ cơ sở dữ liệu
      const account = await AccountModel.getAccountById(accountId);

      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }

      // Lấy thông tin từ query params
      const { accountNumber, days, fromDate: queryFromDate, toDate: queryToDate } = req.query;

      // Kiểm tra số tài khoản
      if (!accountNumber) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: accountNumber là bắt buộc'
        });
        return;
      }

      // Kiểm tra và tạo fromDate và toDate nếu chưa có
      let fromDate = queryFromDate as string;
      let toDate = queryToDate as string;

      // Nếu không có fromDate hoặc toDate, tự tính toán dựa trên tham số days
      if ((!fromDate || !toDate) && days) {
        const daysValue = Number(days);
        if (!isNaN(daysValue) && daysValue > 0 && daysValue <= 90) {
          // Tạo ngày hiện tại và đặt về 00:00:00
          const today = new Date();
          // Đặt múi giờ Việt Nam (UTC+7)
          today.setHours(today.getHours() + 7);
          today.setHours(0, 0, 0, 0);

          // Tính ngày bắt đầu
          const fromDateObj = new Date(today);
          fromDateObj.setDate(today.getDate() - daysValue + 1); // +1 để tính cả ngày hiện tại

          // Chuyển đổi sang định dạng dd/mm/yyyy
          const formatDate = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          };

          fromDate = formatDate(fromDateObj);
          toDate = formatDate(today);
        } else {
          res.status(400).json({
            success: false,
            message: 'Tham số days không hợp lệ. Phải là số nguyên dương và không vượt quá 90.'
          });
          return;
        }
      }

      // Kiểm tra lại fromDate và toDate sau khi tính toán
      if (!fromDate || !toDate) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: fromDate và toDate là bắt buộc hoặc cần cung cấp tham số days hợp lệ'
        });
        return;
      }

      // Chuẩn bị dữ liệu cho API
      const params: TransactionHistoryParams = {
        accountNumber: accountNumber as string,
        fromDate: fromDate,
        toDate: toDate
      };

      // Lấy lịch sử giao dịch
      const transactionResult = await MBBankService.getTransactionHistory(account, params);

      res.status(200).json({
        success: true,
        data: transactionResult
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi lấy lịch sử giao dịch: ${error.message}`
      });
    }
  }
}