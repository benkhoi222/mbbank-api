import { Request, Response, NextFunction } from 'express';
import { BadRequestError, TooManyRequestsError } from '../utils/error.utils';

// Lưu trữ thông tin request
interface RequestRecord {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

// Lưu trữ IP và thông tin request
const requestMap = new Map<string, RequestRecord>();

// Cấu hình giới hạn request
const MAX_REQUESTS_PER_WINDOW = 100; // Số request tối đa trong khoảng thời gian
const WINDOW_MS = 15 * 60 * 1000; // Khoảng thời gian (15 phút)
const CLEANUP_INTERVAL = 30 * 60 * 1000; // Thời gian dọn dẹp bộ nhớ (30 phút)

// Dọn dẹp bộ nhớ định kỳ
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestMap.entries()) {
    if (now - record.lastRequest > WINDOW_MS) {
      requestMap.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Middleware giới hạn số lượng request từ một IP
 */
export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy IP của client
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
    
    if (!ip) {
      return next(new BadRequestError('Không thể xác định địa chỉ IP'));
    }
    
    const now = Date.now();
    
    // Lấy thông tin request từ IP này
    const record = requestMap.get(ip) || {
      count: 0,
      firstRequest: now,
      lastRequest: now
    };
    
    // Kiểm tra xem đã quá khoảng thời gian chưa
    if (now - record.firstRequest > WINDOW_MS) {
      // Reset nếu đã quá khoảng thời gian
      record.count = 0;
      record.firstRequest = now;
    }
    
    // Tăng số lượng request
    record.count += 1;
    record.lastRequest = now;
    
    // Lưu lại thông tin
    requestMap.set(ip, record);
    
    // Kiểm tra giới hạn
    if (record.count > MAX_REQUESTS_PER_WINDOW) {
      return next(new TooManyRequestsError('Quá nhiều yêu cầu, vui lòng thử lại sau'));
    }
    
    // Thêm header thông tin giới hạn
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.firstRequest + WINDOW_MS).toISOString());
    
    next();
  } catch (error) {
    next(error);
  }
};