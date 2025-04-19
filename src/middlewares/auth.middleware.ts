import { Request, Response, NextFunction } from 'express';
import { AccountModel } from '../models/account.model';
import { UserModel } from '../models/user.model';
import { UnauthorizedError, BadRequestError } from '../utils/error.utils';

// Mở rộng interface của Request để thêm đối tượng account và user với kiểu dữ liệu rõ ràng
import { Account } from '../models/account.model';
import { User } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      account?: Account;
      user?: User;
    }
  }
}

/**
 * Đọc token từ các header khác nhau
 * @param req Request object
 * @returns Token nếu tìm thấy, null nếu không
 */
export const extractToken = (req: Request): string | null => {
  try {
    // Kiểm tra Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]?.trim();
      if (token && token.length > 0) {
        return token;
      }
    }

    // Kiểm tra X-API-Key header
    const apiKey = req.headers['x-api-key'];
    if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0) {
      return apiKey.trim();
    }

    // Kiểm tra token trong query parameter
    if (req.query && req.query.token && typeof req.query.token === 'string' && req.query.token.trim().length > 0) {
      return req.query.token.trim();
    }

    return null;
  } catch (error) {
    console.error('Lỗi khi trích xuất token:', error);
    return null;
  }
};

/**
 * Middleware xác thực token từ header cho tài khoản MB Bank
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Lấy token từ header hoặc query string
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Không tìm thấy token xác thực');
    }

    // Kiểm tra định dạng token
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(token)) {
      throw new BadRequestError('Token chứa ký tự không hợp lệ');
    }

    // Tìm tài khoản với token này
    const account = await AccountModel.getAccountByToken(token);

    if (!account) {
      throw new UnauthorizedError('Token không hợp lệ hoặc đã hết hạn');
    }

    // Kiểm tra trạng thái tài khoản
    if (account.status && account.status !== 'active') {
      throw new UnauthorizedError(`Tài khoản ${account.status === 'locked' ? 'đã bị khóa' : 'không hoạt động'}`);
    }

    // Gắn thông tin tài khoản vào request để sử dụng ở các middleware hoặc controller tiếp theo
    req.account = account;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware xác thực token từ header cho người dùng hệ thống
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Lấy token từ header hoặc query string
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Không tìm thấy token xác thực');
    }

    // Kiểm tra định dạng token
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(token)) {
      throw new BadRequestError('Token chứa ký tự không hợp lệ');
    }

    // Tìm người dùng với token này
    const user = await UserModel.getUserByToken(token);

    if (!user) {
      throw new UnauthorizedError('Token không hợp lệ hoặc đã hết hạn');
    }

    // Kiểm tra trạng thái người dùng
    if (user.status && user.status !== 'active') {
      throw new UnauthorizedError(`Tài khoản ${user.status === 'locked' ? 'đã bị khóa' : 'không hoạt động'}`);
    }

    // Gắn thông tin người dùng vào request để sử dụng ở các middleware hoặc controller tiếp theo
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware kiểm tra quyền admin
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Bạn chưa đăng nhập');
    }

    if (req.user.role !== 'admin') {
      throw new UnauthorizedError('Bạn không có quyền truy cập tài nguyên này');
    }

    next();
  } catch (error) {
    next(error);
  }
};