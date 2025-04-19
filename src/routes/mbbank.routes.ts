import { Router } from 'express';
import { MBBankController } from '../controllers/mbbank.controller';
import { validateIdParam, validateTransactionParams, validateDaysParam } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /mbbank/{id}/login:
 *   post:
 *     summary: Đăng nhập vào tài khoản MB Bank
 *     tags: [MB Bank]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tài khoản
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đăng nhập thành công
 *                 data:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
/**
 * @swagger
 * /mbbank/me/balance:
 *   get:
 *     summary: Lấy số dư tài khoản (sử dụng token)
 *     tags: [MB Bank]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *       - QueryToken: []
 *     responses:
 *       200:
 *         description: Số dư tài khoản
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me/balance', authenticateToken, MBBankController.getBalanceWithToken);

/**
 * @swagger
 * /mbbank/me/transactions:
 *   get:
 *     summary: Lấy lịch sử giao dịch (sử dụng token)
 *     tags: [MB Bank]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *       - QueryToken: []
 *     parameters:
 *       - in: query
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Số tài khoản
 *       - in: query
 *         name: fromDate
 *         required: true
 *         schema:
 *           type: string
 *         description: Ngày bắt đầu (định dạng dd/mm/yyyy)
 *       - in: query
 *         name: toDate
 *         required: true
 *         schema:
 *           type: string
 *         description: Ngày kết thúc (định dạng dd/mm/yyyy)
 *     responses:
 *       200:
 *         description: Lịch sử giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me/transactions', authenticateToken, validateTransactionParams, MBBankController.getTransactionHistoryWithToken);

/**
 * @swagger
 * /mbbank/me/status:
 *   get:
 *     summary: Kiểm tra trạng thái đăng nhập (sử dụng token)
 *     tags: [MB Bank]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *       - QueryToken: []
 *     responses:
 *       200:
 *         description: Trạng thái đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đang đăng nhập
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me/status', authenticateToken, MBBankController.checkLoginStatusWithToken);

/**
 * @swagger
 * /mbbank/{id}/login:
 *   post:
 *     summary: Đăng nhập vào tài khoản MB Bank
 *     tags: [MB Bank]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tài khoản
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đăng nhập thành công
 *                 data:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/login', validateIdParam, MBBankController.login);

/**
 * @swagger
 * /mbbank/{id}/status:
 *   get:
 *     summary: Kiểm tra trạng thái đăng nhập
 *     tags: [MB Bank]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *       - QueryToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tài khoản
 *     responses:
 *       200:
 *         description: Trạng thái đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đang đăng nhập
 *                 data:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/status', authenticateToken, validateIdParam, MBBankController.checkLoginStatus);

/**
 * @swagger
 * /mbbank/{id}/balance:
 *   get:
 *     summary: Lấy số dư tài khoản
 *     tags: [MB Bank]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *       - QueryToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tài khoản
 *     responses:
 *       200:
 *         description: Số dư tài khoản
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/balance', authenticateToken, validateIdParam, MBBankController.getBalance);

/**
 * @swagger
 * /mbbank/{id}/transactions:
 *   get:
 *     summary: Lấy lịch sử giao dịch
 *     tags: [MB Bank]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tài khoản
 *       - in: query
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Số tài khoản
 *       - in: query
 *         name: fromDate
 *         required: true
 *         schema:
 *           type: string
 *         description: Ngày bắt đầu (định dạng dd/mm/yyyy)
 *       - in: query
 *         name: toDate
 *         required: true
 *         schema:
 *           type: string
 *         description: Ngày kết thúc (định dạng dd/mm/yyyy)
 *     responses:
 *       200:
 *         description: Lịch sử giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/transactions', authenticateToken, validateIdParam, validateTransactionParams, MBBankController.getTransactionHistory);

/**
 * @swagger
 * /mbbank/{id}/logout:
 *   post:
 *     summary: Đăng xuất tài khoản
 *     tags: [MB Bank]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tài khoản
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đăng xuất thành công
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/logout', authenticateToken, validateIdParam, MBBankController.logout);

/**
 * @swagger
 * /mbbank/me/transactions/days:
 *   get:
 *     summary: Lấy lịch sử giao dịch theo số ngày (sử dụng token)
 *     tags: [MB Bank]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *       - QueryToken: []
 *     parameters:
 *       - in: query
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Số tài khoản
 *       - in: query
 *         name: days
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 90
 *         description: Số ngày cần lấy lịch sử (tính từ ngày hiện tại trở về trước, tối đa 90 ngày)
 *     responses:
 *       200:
 *         description: Lịch sử giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me/transactions/days', authenticateToken, validateDaysParam, MBBankController.getTransactionHistoryByDaysWithToken);

/**
 * @swagger
 * /mbbank/{id}/transactions/days:
 *   get:
 *     summary: Lấy lịch sử giao dịch theo số ngày
 *     tags: [MB Bank]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *       - QueryToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tài khoản
 *       - in: query
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Số tài khoản
 *       - in: query
 *         name: days
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 90
 *         description: Số ngày cần lấy lịch sử (tính từ ngày hiện tại trở về trước, tối đa 90 ngày)
 *     responses:
 *       200:
 *         description: Lịch sử giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/transactions/days', authenticateToken, validateIdParam, validateDaysParam, MBBankController.getTransactionHistoryByDays);

export default router;