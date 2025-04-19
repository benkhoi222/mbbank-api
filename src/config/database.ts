import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Cấu hình kết nối MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Hàm kiểm tra kết nối database
export const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('Kết nối MySQL thành công!');
    connection.release();
  } catch (error) {
    console.error('Lỗi kết nối MySQL:', error);
    throw error;
  }
};

// Tạo bảng accounts và users nếu chưa tồn tại
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Tạo bảng accounts
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        status ENUM('active', 'inactive', 'locked') DEFAULT 'active',
        token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY (username),
        UNIQUE KEY (token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Tạo bảng users cho quản lý người dùng và phân quyền
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        role ENUM('admin', 'user') DEFAULT 'user',
        status ENUM('active', 'inactive', 'locked') DEFAULT 'active',
        token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY (username),
        UNIQUE KEY (email),
        UNIQUE KEY (token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Khởi tạo cơ sở dữ liệu thành công');
  } catch (error) {
    console.error('Lỗi khởi tạo cơ sở dữ liệu:', error);
    throw error;
  }
};

export default pool;