import { Router } from 'express';
import accountRoutes from './account.routes';
import mbbankRoutes from './mbbank.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Định tuyến cho quản lý tài khoản MB Bank
router.use('/accounts', accountRoutes);

// Định tuyến cho hoạt động MB Bank
router.use('/mbbank', mbbankRoutes);

// Định tuyến cho quản lý người dùng hệ thống
router.use('/users', userRoutes);

// Định tuyến cho quản trị viên
router.use('/admin', adminRoutes);

export default router;