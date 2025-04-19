import { Request, Response } from 'express';
import { AccountModel, Account } from '../models/account.model';
import { MBBankService } from '../services/mbbank.service';
import { generateAccountToken } from '../utils/token.utils';
import { ConflictError, NotFoundError } from '../utils/error.utils';

export class AccountController {
  // Lấy tất cả tài khoản
  static async getAllAccounts(req: Request, res: Response): Promise<void> {
    try {
      const accounts = await AccountModel.getAllAccounts();
      
      // Loại bỏ thông tin mật khẩu trước khi trả về
      const sanitizedAccounts = accounts.map(account => {
        const { password, ...rest } = account;
        return rest;
      });
      
      res.status(200).json({
        success: true,
        data: sanitizedAccounts
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi lấy danh sách tài khoản: ${error.message}`
      });
    }
  }

  // Lấy tài khoản theo ID
  static async getAccountById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }
      
      const account = await AccountModel.getAccountById(id);
      
      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }
      
      // Loại bỏ mật khẩu trước khi trả về
      const { password, ...sanitizedAccount } = account;
      
      res.status(200).json({
        success: true,
        data: sanitizedAccount
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi lấy thông tin tài khoản: ${error.message}`
      });
    }
  }

  // Tạo tài khoản mới hoặc cập nhật mật khẩu nếu đã tồn tại
  static async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, name } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Tên đăng nhập và mật khẩu là bắt buộc'
        });
        return;
      }
      
      // Kiểm tra tài khoản đã tồn tại chưa
      const existingAccount = await AccountModel.getAccountByUsername(username);
      
      // Nếu tài khoản đã tồn tại
      if (existingAccount) {
        // Tạo token mới
        const token = generateAccountToken(username, existingAccount.id);
        
        // Cập nhật mật khẩu nếu khác với mật khẩu hiện tại
        if (existingAccount.password !== password) {
          // Cập nhật mật khẩu và token
          await AccountModel.updateAccount(existingAccount.id!, {
            password,
            token
          });
          
          // Đăng nhập lại vào MB Bank với mật khẩu mới
          if (existingAccount.id) {
            const updatedAccount = await AccountModel.getAccountById(existingAccount.id);
            if (updatedAccount) {
              // Đăng nhập lại vào MB Bank với mật khẩu mới
              await MBBankService.login(updatedAccount);
            }
          }
          
          res.status(200).json({
            success: true,
            message: 'Cập nhật mật khẩu và đăng nhập lại thành công',
            data: {
              id: existingAccount.id,
              username,
              name: existingAccount.name,
              status: existingAccount.status,
              token
            }
          });
        } else {
          // Mật khẩu giống nhau, kiểm tra trạng thái đăng nhập
          if (existingAccount.id) {
            const account = await AccountModel.getAccountById(existingAccount.id);
            if (account) {
              const loginStatus = await MBBankService.checkLoginStatus(account);
              
              // Cập nhật token
              await AccountModel.updateToken(existingAccount.id, token);
              
              // Xác định thông báo dựa vào trạng thái và loại lỗi
              let statusMessage = loginStatus.message;
              let loginStatusText = loginStatus.success ? 'đang đăng nhập' : 'chưa đăng nhập';
              
              // Nếu có lỗi Invalid Credentials, đề xuất cập nhật mật khẩu
              if (!loginStatus.success && loginStatus.error_type === 'invalid_credentials') {
                statusMessage = 'Có thể mật khẩu đã thay đổi trên hệ thống MB Bank. Vui lòng cập nhật mật khẩu mới.';
              }
              
              res.status(200).json({
                success: loginStatus.success,
                message: statusMessage,
                data: {
                  id: existingAccount.id,
                  username,
                  status: existingAccount.status,
                  token
                }
              });
            }
          }
        }
        return;
      }
      
      // Tạo tài khoản mới
      const token = generateAccountToken(username);
      
      const newAccount: Account = {
        username,
        password,
        name,
        status: 'active',
        token
      };
      
      const id = await AccountModel.createAccount(newAccount);
      
      res.status(201).json({
        success: true,
        message: 'Tạo tài khoản thành công',
        data: { 
          id, 
          username, 
          name, 
          status: 'active', 
          token 
        },
        auth: {
          token: token,
          type: 'Bearer',
          expires: 'never',
          use_with: 'Authorization header hoặc X-API-Key header hoặc query parameter ?token='
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi tạo tài khoản: ${error.message}`
      });
    }
  }

  // Cập nhật tài khoản
  static async updateAccount(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }
      
      // Kiểm tra tài khoản tồn tại
      const existingAccount = await AccountModel.getAccountById(id);
      if (!existingAccount) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }
      
      // Lấy dữ liệu cập nhật
      const { name, password, status } = req.body;
      
      // Tạo đối tượng cập nhật
      const updateData: Partial<Account> = {};
      
      if (name !== undefined) updateData.name = name;
      if (password !== undefined) updateData.password = password;
      if (status !== undefined) updateData.status = status;
      
      // Cập nhật tài khoản
      const updated = await AccountModel.updateAccount(id, updateData);
      
      if (updated) {
        res.status(200).json({
          success: true,
          message: 'Cập nhật tài khoản thành công'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Không có dữ liệu nào được cập nhật'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi cập nhật tài khoản: ${error.message}`
      });
    }
  }

  // Xóa tài khoản
  static async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }
      
      // Kiểm tra tài khoản tồn tại
      const existingAccount = await AccountModel.getAccountById(id);
      if (!existingAccount) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }
      
      // Xóa tài khoản
      const deleted = await AccountModel.deleteAccount(id);
      
      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Xóa tài khoản thành công'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Không thể xóa tài khoản'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi xóa tài khoản: ${error.message}`
      });
    }
  }

  // Lấy thông tin tài khoản hiện tại từ token
  static async getAccountFromToken(req: Request, res: Response): Promise<void> {
    try {
      // req.account đã được thiết lập bởi middleware authenticateToken
      const account = req.account;
      
      if (!account) {
        throw new NotFoundError('Không tìm thấy thông tin tài khoản');
      }
      
      // Loại bỏ mật khẩu và token trước khi trả về
      const { password, token, ...sanitizedAccount } = account;
      
      res.status(200).json({
        success: true,
        data: sanitizedAccount
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy thông tin tài khoản'
      });
    }
  }
} 