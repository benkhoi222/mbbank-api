import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

// Swagger definition
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MB Bank API',
      version,
      description: 'API để tích hợp với MB Bank, hỗ trợ đa tài khoản',
      contact: {
        name: 'Support',
        email: 'support@example.com'
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Sử dụng Bearer token trong Authorization header'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'Truyền token trực tiếp qua header X-API-Key'
        },
        QueryToken: {
          type: 'apiKey', 
          in: 'query',
          name: 'token',
          description: 'Truyền token qua query parameter ?token='
        }
      },
      schemas: {
        Account: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID của tài khoản',
            },
            username: {
              type: 'string',
              description: 'Tên đăng nhập MB Bank',
            },
            password: {
              type: 'string',
              description: 'Mật khẩu MB Bank',
            },
            name: {
              type: 'string',
              description: 'Tên hiển thị',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'locked'],
              description: 'Trạng thái tài khoản',
            },
            token: {
              type: 'string',
              description: 'Token xác thực',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian tạo',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian cập nhật',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Lỗi xảy ra',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Thành công',
            },
            data: {
              type: 'object',
              example: {},
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Yêu cầu không hợp lệ',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Unauthorized: {
          description: 'Không được xác thực',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Không tìm thấy tài nguyên',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Lỗi máy chủ nội bộ',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const specs = swaggerJsdoc(options); 