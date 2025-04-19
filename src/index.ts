import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { rateLimiter } from './middlewares/rate-limit.middleware';
import { securityHeaders } from './middlewares/security.middleware';
import { testConnection, initializeDatabase } from './config/database';
import { specs } from './config/swagger';

// Tải biến môi trường
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Cấu hình JSON parsing với xử lý lỗi
app.use(express.json({
  limit: '1mb', // Giới hạn kích thước request
  strict: true, // Chỉ chấp nhận mảng và đối tượng
  verify: (req: any, _res: any, buf: Buffer) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      // Cannot use res.status() here as it's not a full Response object
      throw new Error('Dữ liệu JSON không hợp lệ');
    }
  }
}));

// Middleware xử lý lỗi JSON parsing
const jsonErrorHandler = (err: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'Dữ liệu JSON không hợp lệ',
      error: 'invalid_json_format'
    });
    return;
  }
  next(err);
};

app.use(jsonErrorHandler);

app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Áp dụng giới hạn tốc độ request
app.use(rateLimiter);

// Áp dụng header bảo mật
app.use(securityHeaders);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MB Bank API Documentation'
}));

// Định tuyến API
app.use('/api', routes);

// Trang chủ đơn giản
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'API MB Bank - Sẵn sàng phục vụ',
    endpoints: {
      documentation: '/api-docs',
      accounts: '/api/accounts',
      mbbank: '/api/mbbank',
      users: '/api/users',
      admin: '/api/admin'
    },
    admin_setup: {
      url: '/api/admin/setup',
      method: 'POST',
      description: 'Tạo tài khoản admin đầu tiên (chỉ hoạt động khi chưa có admin nào trong hệ thống)'
    }
  });
});

// Xử lý lỗi
app.use(errorHandler);

// Xử lý route không tồn tại
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy endpoint'
  });
});

// Khởi động máy chủ
const startServer = async () => {
  try {
    // Kiểm tra kết nối database
    await testConnection();

    // Khởi tạo cơ sở dữ liệu
    await initializeDatabase();

    // Khởi động server - lắng nghe trên tất cả các interfaces (0.0.0.0)
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Máy chủ đang chạy trên cổng ${PORT}`);
      console.log(`API có thể truy cập từ mạng qua địa chỉ IP của máy chủ`);
    });
  } catch (error) {
    console.error('Lỗi khởi động máy chủ:', error);
    process.exit(1);
  }
};

// Khởi chạy ứng dụng
startServer();