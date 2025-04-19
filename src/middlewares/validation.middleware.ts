import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/error.utils';

/**
 * Middleware kiểm tra các trường bắt buộc trong request body
 * @param requiredFields Mảng các trường bắt buộc
 */
export const validateFields = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return next(new BadRequestError('Không tìm thấy dữ liệu gửi lên hoặc định dạng không hợp lệ'));
      }
      
      // Kiểm tra các trường bắt buộc
      const missingFields = requiredFields.filter(field => {
        const value = req.body[field];
        return value === undefined || value === null || value === '';
      });
      
      if (missingFields.length > 0) {
        const errorMessage = `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`;
        return next(new BadRequestError(errorMessage));
      }
      
      // Kiểm tra các trường có giá trị hợp lệ
      for (const field of requiredFields) {
        const value = req.body[field];
        
        // Kiểm tra các trường là chuỗi không chứa ký tự đặc biệt nguy hiểm
        if (typeof value === 'string' && /[<>]/.test(value)) {
          return next(new BadRequestError(`Trường ${field} chứa ký tự không hợp lệ`));
        }
        
        // Kiểm tra độ dài của chuỗi
        if (typeof value === 'string' && value.length > 1000) {
          return next(new BadRequestError(`Trường ${field} vượt quá độ dài cho phép`));
        }
      }
      
      next();
    } catch (error) {
      next(new BadRequestError('Lỗi xác thực dữ liệu'));
    }
  };
};

/**
 * Kiểm tra định dạng của ID từ tham số URL
 */
export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra id có tồn tại không
    if (!id) {
      return next(new BadRequestError('Thiếu tham số ID'));
    }
    
    // Kiểm tra id có phải là số không
    if (!/^\d+$/.test(id)) {
      return next(new BadRequestError('ID phải là số nguyên dương'));
    }
    
    const parsedId = parseInt(id, 10);
    
    // Kiểm tra giá trị của id
    if (isNaN(parsedId) || parsedId <= 0 || parsedId > 1000000) {
      return next(new BadRequestError('ID không hợp lệ hoặc nằm ngoài phạm vi cho phép'));
    }
    
    // Gán lại giá trị đã được kiểm tra
    req.params.id = parsedId.toString();
    next();
  } catch (error) {
    next(new BadRequestError('Lỗi xác thực tham số ID'));
  }
};

/**
 * Kiểm tra định dạng ngày tháng trong chuỗi 'dd/mm/yyyy'
 */
export const validateDateFormat = (dateString: string): boolean => {
  // Regex cho định dạng dd/mm/yyyy
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  
  if (!regex.test(dateString)) {
    return false;
  }
  
  // Kiểm tra tính hợp lệ của ngày tháng
  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
};

/**
 * Kiểm tra các tham số cho API lịch sử giao dịch
 */
export const validateTransactionParams = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountNumber, fromDate, toDate } = req.query;
    
    // Kiểm tra số tài khoản
    if (!accountNumber) {
      return next(new BadRequestError('Thiếu số tài khoản'));
    }
    
    // Kiểm tra định dạng số tài khoản
    if (typeof accountNumber !== 'string' || !/^\d{5,20}$/.test(accountNumber)) {
      return next(new BadRequestError('Số tài khoản không hợp lệ. Số tài khoản phải chứa 5-20 chữ số'));
    }
    
    // Kiểm tra ngày bắt đầu và kết thúc
    if (!fromDate || !toDate) {
      return next(new BadRequestError('Thiếu thông tin ngày bắt đầu hoặc ngày kết thúc'));
    }
    
    if (typeof fromDate !== 'string' || typeof toDate !== 'string') {
      return next(new BadRequestError('Định dạng ngày không hợp lệ'));
    }
    
    if (!validateDateFormat(fromDate)) {
      return next(new BadRequestError('Định dạng ngày bắt đầu không hợp lệ. Sử dụng định dạng dd/mm/yyyy'));
    }
    
    if (!validateDateFormat(toDate)) {
      return next(new BadRequestError('Định dạng ngày kết thúc không hợp lệ. Sử dụng định dạng dd/mm/yyyy'));
    }
    
    // Kiểm tra ngày bắt đầu <= ngày kết thúc
    const [fromDay, fromMonth, fromYear] = fromDate.split('/').map(Number);
    const [toDay, toMonth, toYear] = toDate.split('/').map(Number);
    
    const fromDateObj = new Date(fromYear, fromMonth - 1, fromDay);
    const toDateObj = new Date(toYear, toMonth - 1, toDay);
    
    if (fromDateObj > toDateObj) {
      return next(new BadRequestError('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc'));
    }
    
    // Kiểm tra khoảng thời gian không quá 3 tháng
    const diffTime = Math.abs(toDateObj.getTime() - fromDateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 90) {
      return next(new BadRequestError('Khoảng thời gian tìm kiếm không được vượt quá 90 ngày'));
    }
    
    // Kiểm tra ngày không trong tương lai
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (toDateObj > today) {
      return next(new BadRequestError('Ngày kết thúc không được là ngày trong tương lai'));
    }
    
    next();
  } catch (error) {
    next(new BadRequestError('Lỗi xác thực tham số giao dịch'));
  }
};

/**
 * Kiểm tra tham số days cho API lịch sử giao dịch theo số ngày
 */
export const validateDaysParam = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountNumber, days } = req.query;
    
    // Kiểm tra số tài khoản
    if (!accountNumber) {
      return next(new BadRequestError('Thiếu số tài khoản'));
    }
    
    // Kiểm tra định dạng số tài khoản
    if (typeof accountNumber !== 'string' || !/^\d{5,20}$/.test(accountNumber)) {
      return next(new BadRequestError('Số tài khoản không hợp lệ. Số tài khoản phải chứa 5-20 chữ số'));
    }
    
    // Kiểm tra tham số days
    if (!days) {
      return next(new BadRequestError('Thiếu tham số days (số ngày)'));
    }
    
    // Kiểm tra days có phải là số nguyên dương không
    const daysValue = Number(days);
    if (isNaN(daysValue) || !Number.isInteger(daysValue) || daysValue <= 0) {
      return next(new BadRequestError('Tham số days phải là số nguyên dương'));
    }
    
    // Giới hạn số ngày tối đa là 90 ngày
    if (daysValue > 90) {
      return next(new BadRequestError('Số ngày tối đa không được vượt quá 90 ngày'));
    }
    
    // Thêm thông tin ngày bắt đầu và kết thúc vào request để sử dụng sau này
    const today = new Date();
    // Đặt múi giờ Việt Nam (UTC+7)
    today.setHours(today.getHours() + 7);
    today.setHours(0, 0, 0, 0);
    
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - daysValue + 1); // +1 để tính cả ngày hiện tại
    
    // Chuyển đổi sang định dạng dd/mm/yyyy
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    // Thêm vào request để sử dụng trong controller
    req.query.fromDate = formatDate(fromDate);
    req.query.toDate = formatDate(today);
    
    next();
  } catch (error) {
    next(new BadRequestError('Lỗi xác thực tham số số ngày'));
  }
};