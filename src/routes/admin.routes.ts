import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { validateFields } from '../middlewares/validation.middleware';
import { authenticateUser, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Tạo tài khoản admin đầu tiên (chỉ khi chưa có admin nào)
router.post('/setup', validateFields(['username', 'password', 'email']), AdminController.createFirstAdmin);

// Lấy danh sách tất cả tài khoản MB Bank (chỉ admin)
router.get('/accounts', authenticateUser, requireAdmin, AdminController.getAllMBAccounts);

// Kiểm tra trạng thái đăng nhập của tất cả tài khoản (chỉ admin)
router.get('/accounts/status', authenticateUser, requireAdmin, AdminController.checkAllAccountsStatus);

// Kiểm tra số dư của tất cả tài khoản (chỉ admin)
router.get('/accounts/balance', authenticateUser, requireAdmin, AdminController.checkAllAccountsBalance);

export default router;
