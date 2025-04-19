import { Request, Response } from 'express';
import { UserModel, User } from '../models/user.model';
import { generateAccountToken } from '../utils/token.utils';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/error.utils';
import bcrypt from 'bcrypt';

export class UserController {
  // Lấy tất cả người dùng (chỉ admin mới có quyền)
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      // Kiểm tra quyền admin
      if (!req.user || req.user.role !== 'admin') {
        throw new UnauthorizedError('Bạn không có quyền truy cập tài nguyên này');
      }

      const users = await UserModel.getAllUsers();
      
      // Loại bỏ thông tin mật khẩu trước khi trả về
      const sanitizedUsers = users.map(user => {
        const { password, ...rest } = user;
        return rest;
      });
      
      res.status(200).json({
        success: true,
        data: sanitizedUsers
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách người dùng'
      });
    }
  }

  // Lấy người dùng theo ID (chỉ admin hoặc chính người dùng đó mới có quyền)
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID người dùng không hợp lệ'
        });
        return;
      }
      
      // Kiểm tra quyền truy cập
      if (!req.user) {
        throw new UnauthorizedError('Bạn chưa đăng nhập');
      }
      
      // Chỉ admin hoặc chính người dùng đó mới có quyền xem thông tin
      if (req.user.role !== 'admin' && req.user.id !== id) {
        throw new UnauthorizedError('Bạn không có quyền truy cập thông tin này');
      }
      
      const user = await UserModel.getUserById(id);
      
      if (!user) {
        throw new NotFoundError('Không tìm thấy người dùng');
      }
      
      // Loại bỏ mật khẩu trước khi trả về
      const { password, ...sanitizedUser } = user;
      
      res.status(200).json({
        success: true,
        data: sanitizedUser
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy thông tin người dùng'
      });
    }
  }

  // Tạo người dùng mới
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, name, email, role } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!username || !password || !email) {
        res.status(400).json({
          success: false,
          message: 'Tên đăng nhập, mật khẩu và email là bắt buộc'
        });
        return;
      }
      
      // Kiểm tra email hợp lệ
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Email không hợp lệ'
        });
        return;
      }
      
      // Kiểm tra người dùng đã tồn tại chưa
      const existingUser = await UserModel.getUserByUsername(username);
      if (existingUser) {
        throw new ConflictError('Tên đăng nhập đã tồn tại');
      }
      
      // Kiểm tra email đã tồn tại chưa
      const existingEmail = await UserModel.getUserByEmail(email);
      if (existingEmail) {
        throw new ConflictError('Email đã được sử dụng');
      }
      
      // Kiểm tra quyền khi tạo tài khoản admin
      if (role === 'admin' && req.user && req.user.role !== 'admin') {
        throw new UnauthorizedError('Bạn không có quyền tạo tài khoản admin');
      }
      
      // Mã hóa mật khẩu
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Tạo token
      const token = generateAccountToken(username);
      
      // Tạo người dùng mới
      const newUser: User = {
        username,
        password: hashedPassword,
        name,
        email,
        role: role || 'user',
        status: 'active',
        token
      };
      
      const id = await UserModel.createUser(newUser);
      
      // Loại bỏ mật khẩu trước khi trả về
      const { password: _, ...userData } = newUser;
      
      res.status(201).json({
        success: true,
        message: 'Tạo người dùng thành công',
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
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo người dùng'
      });
    }
  }

  // Cập nhật thông tin người dùng
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { name, email, password, role, status } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID người dùng không hợp lệ'
        });
        return;
      }
      
      // Kiểm tra quyền truy cập
      if (!req.user) {
        throw new UnauthorizedError('Bạn chưa đăng nhập');
      }
      
      // Chỉ admin hoặc chính người dùng đó mới có quyền cập nhật thông tin
      const isAdmin = req.user.role === 'admin';
      const isSelfUpdate = req.user.id === id;
      
      if (!isAdmin && !isSelfUpdate) {
        throw new UnauthorizedError('Bạn không có quyền cập nhật thông tin này');
      }
      
      // Chỉ admin mới có quyền thay đổi role và status
      if ((role || status) && !isAdmin) {
        throw new UnauthorizedError('Bạn không có quyền thay đổi vai trò hoặc trạng thái người dùng');
      }
      
      // Kiểm tra người dùng tồn tại
      const user = await UserModel.getUserById(id);
      if (!user) {
        throw new NotFoundError('Không tìm thấy người dùng');
      }
      
      // Chuẩn bị dữ liệu cập nhật
      const updateData: Partial<User> = {};
      
      if (name) updateData.name = name;
      
      if (email) {
        // Kiểm tra email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({
            success: false,
            message: 'Email không hợp lệ'
          });
          return;
        }
        
        // Kiểm tra email đã tồn tại chưa (nếu khác với email hiện tại)
        if (email !== user.email) {
          const existingEmail = await UserModel.getUserByEmail(email);
          if (existingEmail) {
            throw new ConflictError('Email đã được sử dụng');
          }
          updateData.email = email;
        }
      }
      
      if (password) {
        // Mã hóa mật khẩu
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }
      
      if (role && isAdmin) updateData.role = role;
      if (status && isAdmin) updateData.status = status;
      
      // Cập nhật thông tin
      if (Object.keys(updateData).length > 0) {
        await UserModel.updateUser(id, updateData);
      }
      
      // Lấy thông tin người dùng sau khi cập nhật
      const updatedUser = await UserModel.getUserById(id);
      
      if (!updatedUser) {
        throw new NotFoundError('Không tìm thấy người dùng sau khi cập nhật');
      }
      
      // Loại bỏ mật khẩu trước khi trả về
      const { password: _, ...sanitizedUser } = updatedUser;
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin người dùng thành công',
        data: sanitizedUser
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật thông tin người dùng'
      });
    }
  }

  // Xóa người dùng (chỉ admin mới có quyền)
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID người dùng không hợp lệ'
        });
        return;
      }
      
      // Kiểm tra quyền admin
      if (!req.user || req.user.role !== 'admin') {
        throw new UnauthorizedError('Bạn không có quyền xóa người dùng');
      }
      
      // Không cho phép admin tự xóa tài khoản của mình
      if (req.user.id === id) {
        throw new UnauthorizedError('Bạn không thể xóa tài khoản của chính mình');
      }
      
      // Kiểm tra người dùng tồn tại
      const user = await UserModel.getUserById(id);
      if (!user) {
        throw new NotFoundError('Không tìm thấy người dùng');
      }
      
      // Xóa người dùng
      const result = await UserModel.deleteUser(id);
      
      if (!result) {
        throw new Error('Không thể xóa người dùng');
      }
      
      res.status(200).json({
        success: true,
        message: 'Xóa người dùng thành công'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi xóa người dùng'
      });
    }
  }

  // Lấy thông tin người dùng hiện tại từ token
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // req.user đã được thiết lập bởi middleware authenticateToken
      const user = req.user;
      
      if (!user) {
        throw new NotFoundError('Không tìm thấy thông tin người dùng');
      }
      
      // Loại bỏ mật khẩu và token trước khi trả về
      const { password, token, ...sanitizedUser } = user;
      
      res.status(200).json({
        success: true,
        data: sanitizedUser
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy thông tin người dùng'
      });
    }
  }

  // Đăng nhập người dùng
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Tên đăng nhập và mật khẩu là bắt buộc'
        });
        return;
      }
      
      // Tìm người dùng theo username
      const user = await UserModel.getUserByUsername(username);
      
      if (!user) {
        throw new UnauthorizedError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
      
      // Kiểm tra trạng thái tài khoản
      if (user.status !== 'active') {
        throw new UnauthorizedError(`Tài khoản ${user.status === 'locked' ? 'đã bị khóa' : 'không hoạt động'}`);
      }
      
      // Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
      
      // Tạo token mới
      const token = generateAccountToken(username, user.id);
      
      // Cập nhật token
      await UserModel.updateToken(user.id!, token);
      
      // Loại bỏ mật khẩu trước khi trả về
      const { password: _, ...userData } = user;
      
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          ...userData,
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
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi khi đăng nhập'
      });
    }
  }
}
