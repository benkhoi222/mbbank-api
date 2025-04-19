import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Định nghĩa interface cho Account
export interface Account {
  id?: number;
  username: string;
  password: string;
  name?: string;
  status?: 'active' | 'inactive' | 'locked';
  token?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Class quản lý Account
export class AccountModel {
  // Lấy tất cả tài khoản
  static async getAllAccounts(): Promise<Account[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM accounts');
    return rows as Account[];
  }

  // Lấy account theo username
  static async getAccountByUsername(username: string): Promise<Account | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM accounts WHERE username = ?',
      [username]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Account;
  }

  // Lấy account theo id
  static async getAccountById(id: number): Promise<Account | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM accounts WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Account;
  }

  // Thêm account mới
  static async createAccount(account: Account): Promise<number> {
    const { username, password, name, status } = account;
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO accounts (username, password, name, status) VALUES (?, ?, ?, ?)',
      [username, password, name || null, status || 'active']
    );
    
    return result.insertId;
  }

  // Cập nhật account
  static async updateAccount(id: number, account: Partial<Account>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    
    // Xây dựng câu query từ các trường cần cập nhật
    Object.entries(account).forEach(([key, value]) => {
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
      `UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  // Xóa account
  static async deleteAccount(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM accounts WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  // Cập nhật trạng thái account
  static async updateStatus(id: number, status: 'active' | 'inactive' | 'locked'): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE accounts SET status = ? WHERE id = ?',
      [status, id]
    );
    
    return result.affectedRows > 0;
  }

  // Cập nhật token cho tài khoản
  static async updateToken(id: number, token: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE accounts SET token = ? WHERE id = ?',
      [token, id]
    );
    
    return result.affectedRows > 0;
  }

  // Lấy account theo token
  static async getAccountByToken(token: string): Promise<Account | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM accounts WHERE token = ?',
      [token]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Account;
  }
} 