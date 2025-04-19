import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Định nghĩa interface cho User
export interface User {
  id?: number;
  username: string;
  password: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive' | 'locked';
  token?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Class quản lý User
export class UserModel {
  // Lấy tất cả người dùng
  static async getAllUsers(): Promise<User[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users');
    return rows as User[];
  }

  // Lấy user theo username
  static async getUserByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as User;
  }

  // Lấy user theo id
  static async getUserById(id: number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as User;
  }

  // Lấy user theo email
  static async getUserByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as User;
  }

  // Thêm user mới
  static async createUser(user: User): Promise<number> {
    const { username, password, name, email, role, status } = user;
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, password, name, email, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password, name || null, email || null, role || 'user', status || 'active']
    );
    
    return result.insertId;
  }

  // Cập nhật user
  static async updateUser(id: number, user: Partial<User>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    
    // Xây dựng câu query từ các trường cần cập nhật
    Object.entries(user).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return false;
    }
    
    values.push(id);
    
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  // Xóa user
  static async deleteUser(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  // Cập nhật trạng thái user
  static async updateStatus(id: number, status: 'active' | 'inactive' | 'locked'): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );
    
    return result.affectedRows > 0;
  }

  // Cập nhật token cho người dùng
  static async updateToken(id: number, token: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET token = ? WHERE id = ?',
      [token, id]
    );
    
    return result.affectedRows > 0;
  }

  // Lấy user theo token
  static async getUserByToken(token: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE token = ?',
      [token]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as User;
  }

  // Kiểm tra xem có admin nào trong hệ thống chưa
  static async hasAdminUser(): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['admin']
    );
    
    return (rows[0] as any).count > 0;
  }

  // Lấy danh sách admin
  static async getAdminUsers(): Promise<User[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE role = ?',
      ['admin']
    );
    
    return rows as User[];
  }
}
