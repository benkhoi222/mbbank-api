import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateFields, validateIdParam } from '../middlewares/validation.middleware';
import { authenticateUser, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Đăng nhập người dùng
router.post('/login', validateFields(['username', 'password']), UserController.login);

// Tạo người dùng mới (không cần xác thực)
router.post('/', validateFields(['username', 'password', 'email']), UserController.createUser);

// Lấy thông tin người dùng hiện tại từ token
router.get('/me', authenticateUser, UserController.getCurrentUser);

// Lấy danh sách tất cả người dùng (chỉ admin)
router.get('/', authenticateUser, requireAdmin, UserController.getAllUsers);

// Lấy thông tin người dùng theo ID (admin hoặc chính người dùng đó)
router.get('/:id', authenticateUser, validateIdParam, UserController.getUserById);

// Cập nhật thông tin người dùng (admin hoặc chính người dùng đó)
router.put('/:id', authenticateUser, validateIdParam, UserController.updateUser);

// Xóa người dùng (chỉ admin)
router.delete('/:id', authenticateUser, requireAdmin, validateIdParam, UserController.deleteUser);

export default router;
