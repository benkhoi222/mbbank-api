import { Request, Response, NextFunction } from 'express';

/**
 * Middleware thêm các header bảo mật
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Ngăn chặn clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Bảo vệ chống XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Ngăn chặn MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self';"
  );
  
  // Ngăn chặn truy cập từ các nguồn không đáng tin cậy
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // Ngăn chặn các tính năng trình duyệt có thể gây rủi ro bảo mật
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
};