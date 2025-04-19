import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { validateFields, validateIdParam } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Sử dụng Bearer token trong Authorization header
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 *       description: Truyền token trực tiếp qua header X-API-Key
 *     QueryToken:
 *       type: apiKey
 *       in: query
 *       name: token
 *       description: Truyền token qua query parameter ?token=
 */

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Lấy danh sách tất cả tài khoản
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *       - QueryToken: []
 *     responses:
 *       200:
 *         description: Danh sách tài khoản
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, AccountController.getAllAccounts);

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Lấy thông tin tài khoản theo ID
 *     tags: [Accounts]
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
 *         description: Thông tin tài khoản
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authenticateToken, validateIdParam, AccountController.getAccountById);

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Tạo tài khoản mới
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Tên đăng nhập MB Bank
 *               password:
 *                 type: string
 *                 description: Mật khẩu MB Bank
 *               name:
 *                 type: string
 *                 description: Tên hiển thị
 *     responses:
 *       201:
 *         description: Tài khoản đã được tạo
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
 *                   example: Tạo tài khoản thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', validateFields(['username', 'password']), AccountController.createAccount);

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Cập nhật tài khoản
 *     tags: [Accounts]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên hiển thị
 *               password:
 *                 type: string
 *                 description: Mật khẩu MB Bank
 *               status:
 *                 type: string
 *                 enum: [active, inactive, locked]
 *                 description: Trạng thái tài khoản
 *     responses:
 *       200:
 *         description: Tài khoản đã được cập nhật
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
 *                   example: Cập nhật tài khoản thành công
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', authenticateToken, validateIdParam, AccountController.updateAccount);

/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Xóa tài khoản
 *     tags: [Accounts]
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
 *         description: Tài khoản đã được xóa
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
 *                   example: Xóa tài khoản thành công
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authenticateToken, validateIdParam, AccountController.deleteAccount);

/**
 * @swagger
 * /accounts/me:
 *   get:
 *     summary: Lấy thông tin tài khoản hiện tại từ token
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *       - QueryToken: []
 *     responses:
 *       200:
 *         description: Thông tin tài khoản
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me', authenticateToken, AccountController.getAccountFromToken);

export default router; 