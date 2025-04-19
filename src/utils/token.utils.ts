import crypto from 'crypto';

/**
 * Tạo token ngẫu nhiên với độ dài chỉ định
 * @param length Độ dài token
 * @returns Token được tạo
 */
export const generateToken = (length: number = 64): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Tạo token dựa trên thông tin tài khoản
 * @param username Tên đăng nhập
 * @param id ID của tài khoản
 * @returns Token được tạo
 */
export const generateAccountToken = (username: string, id?: number): string => {
  const timestamp = new Date().getTime();
  const randomPart = crypto.randomBytes(16).toString('hex');
  const data = `${username}:${id || 'new'}:${timestamp}:${randomPart}`;

  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}; 