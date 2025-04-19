import { Request, Response } from 'express';
import { AccountModel } from '../models/account.model';
import { UserModel } from '../models/user.model';
import { MBBankService } from '../services/mbbank.service';
import { NotFoundError, UnauthorizedError } from '../utils/error.utils';

type UserRole = 'admin' | 'user';
type UserStatus = 'active' | 'inactive' | 'locked';
interface UserInput {
  username: string;
  password?: string; // Password might not always be needed as input directly
  name?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  token: string;
}

export class AdminController {
  // Lấy tất cả tài khoản MB Bank (chỉ admin)
  static async getAllMBAccounts(req: Request, res: Response): Promise<Response | void> {
    try {
      // Kiểm tra quyền admin
      if (!req.user || req.user.role !== 'admin') {
        throw new UnauthorizedError('Bạn không có quyền truy cập tài nguyên này');
      }

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
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách tài khoản'
      });
    }
  }

  // Kiểm tra trạng thái đăng nhập của tất cả tài khoản (chỉ admin)
  static async checkAllAccountsStatus(req: Request, res: Response): Promise<Response | void> {
    try {
      // Kiểm tra quyền admin
      if (!req.user || req.user.role !== 'admin') {
        throw new UnauthorizedError('Bạn không có quyền truy cập tài nguyên này');
      }

      const accounts = await AccountModel.getAllAccounts();
      const statusResults = [];

      // Kiểm tra trạng thái đăng nhập của từng tài khoản
      for (const account of accounts) {
        try {
          const status = await MBBankService.checkLoginStatus(account);
          statusResults.push({
            id: account.id,
            username: account.username,
            name: account.name,
            status: account.status,
            login_status: status.success ? 'logged_in' : 'logged_out',
            message: status.message
          });
        } catch (error: any) {
          statusResults.push({
            id: account.id,
            username: account.username,
            name: account.name,
            status: account.status,
            login_status: 'error',
            message: error.message || 'Lỗi kiểm tra trạng thái'
          });
        }
      }

      res.status(200).json({
        success: true,
        data: statusResults
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi kiểm tra trạng thái tài khoản'
      });
    }
  }

  // Kiểm tra số dư của tất cả tài khoản (chỉ admin)
  static async checkAllAccountsBalance(req: Request, res: Response): Promise<Response | void> {
    try {
      // Kiểm tra quyền admin
      if (!req.user || req.user.role !== 'admin') {
        throw new UnauthorizedError('Bạn không có quyền truy cập tài nguyên này');
      }

      const accounts = await AccountModel.getAllAccounts();
      const balanceResults = [];

      // Kiểm tra số dư của từng tài khoản
      for (const account of accounts) {
        try {
          const balance = await MBBankService.getBalance(account);
          balanceResults.push({
            id: account.id,
            username: account.username,
            name: account.name,
            status: account.status,
            balance: balance
          });
        } catch (error: any) {
          balanceResults.push({
            id: account.id,
            username: account.username,
            name: account.name,
            status: account.status,
            balance: null,
            error: error.message || 'Lỗi kiểm tra số dư'
          });
        }
      }

      res.status(200).json({
        success: true,
        data: balanceResults
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi kiểm tra số dư tài khoản'
      });
    }
  }

  // Tạo tài khoản admin đầu tiên (chỉ khi chưa có admin nào)
  static async createFirstAdmin(req: Request, res: Response): Promise<Response | void> {
    try {
      // Kiểm tra xem đã có admin nào chưa
      const hasAdmin = await UserModel.hasAdminUser();
      
      if (hasAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Đã tồn tại tài khoản admin trong hệ thống'
        });
      }
      
      const { username, password, name, email } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!username || !password || !email) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập, mật khẩu và email là bắt buộc'
        });
      }
      
      // Kiểm tra email hợp lệ
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email không hợp lệ'
        });
      }
      
      // Kiểm tra người dùng đã tồn tại chưa
      const existingUser = await UserModel.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Tên đăng nhập đã tồn tại'
        });
      }
      
      // Kiểm tra email đã tồn tại chưa
      const existingEmail = await UserModel.getUserByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }
      
      // Mã hóa mật khẩu
      const bcrypt = require('bcrypt');
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Tạo token
      const { generateAccountToken } = require('../utils/token.utils');
      const token = generateAccountToken(username);
      
      // Tạo người dùng admin đầu tiên
      const newUser: UserInput = {
        username,
        password: hashedPassword,
        name: name || '', // Ensure name is provided, even if empty
        email,
        role: 'admin', // This now correctly matches UserRole
        status: 'active', // This matches UserStatus
        token
      };
      
      const id = await UserModel.createUser(newUser);
      
      // Loại bỏ mật khẩu trước khi trả về
      const { password: _, ...userData } = newUser;
      
      res.status(201).json({
        success: true,
        message: 'Tạo tài khoản admin đầu tiên thành công',
        data: { 
          id,
          ...userData
        },
        auth: {
          token: token,
          type: 'Bearer',
          expires: 'never',
          use_with: 'Authorization header hoặc X-API-Key header hoặc query parameter ?token='
        }
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo tài khoản admin'
      });
    }
  }
}
