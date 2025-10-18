import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authValidations, userValidations } from '../validators';
import { authRateLimit } from '../middlewares/security';
import { authenticateToken, requireAdmin, logAccess } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - email
 *               - password
 *               - nom
 *               - prenom
 *               - role
 *             properties:
 *               login:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *               nom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               prenom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               role:
 *                 type: string
 *                 enum: [ADMIN, RECEPTIONNISTE, USER]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     login:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nom:
 *                       type: string
 *                     prenom:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', authRateLimit, ...userValidations.create, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *               rememberMe:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authRateLimit, ...authValidations.login, authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     expiresIn:
 *                       type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', ...authValidations.refreshToken, authController.refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               nom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               prenom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/profile', authController.updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *               confirmPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/change-password', authenticateToken, ...authValidations.changePassword, authController.changePassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify access token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/verify', authController.verifyToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [ADMIN, RECEPTIONNISTE]
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, logAccess, authController.getProfile);

/**
 * @swagger
 * /api/auth/users/with-role:
 *   post:
 *     summary: Create user with specific role (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - email
 *               - password
 *               - nom
 *               - prenom
 *               - role
 *             properties:
 *               login:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, RECEPTIONNISTE]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/users/with-role', authRateLimit, authenticateToken, requireAdmin, logAccess, ...userValidations.createWithRole, authController.createUserWithRole);

/**
 * @swagger
 * /api/auth/users/admin:
 *   post:
 *     summary: Create admin user (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - email
 *               - password
 *               - nom
 *               - prenom
 *             properties:
 *               login:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/users/admin', authRateLimit, authenticateToken, requireAdmin, logAccess, ...userValidations.createAdmin, authController.createAdmin);

/**
 * @swagger
 * /api/auth/users/receptionist:
 *   post:
 *     summary: Create receptionist user (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - email
 *               - password
 *               - nom
 *               - prenom
 *             properties:
 *               login:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Receptionist user created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/users/receptionist', authRateLimit, authenticateToken, requireAdmin, logAccess, ...userValidations.createReceptionist, authController.createReceptionist);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/users', authenticateToken, requireAdmin, logAccess, authController.getAllUsers);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent (if email exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Email is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/forgot-password', authRateLimit, authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{userId}:
 *   post:
 *     summary: Reset user password by admin
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to reset password for
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/reset-password/:userId', authenticateToken, requireAdmin, logAccess, authController.resetUserPassword);

/**
 * @swagger
 * /api/auth/set-new-password:
 *   post:
 *     summary: Set new password after reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *     responses:
 *       200:
 *         description: New password set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/set-new-password', authRateLimit, authController.setNewPassword);

/**
 * @swagger
 * /api/auth/users/{userId}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/auth/users/{userId}:
 *   put:
 *     summary: Update user by ID (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               nom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               prenom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               role:
 *                 type: string
 *                 enum: [ADMIN, RECEPTIONNISTE]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     login:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nom:
 *                       type: string
 *                     prenom:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - validation error or duplicate email/login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/users/:userId', authenticateToken, requireAdmin, logAccess, authController.updateUser);

/**
 * @swagger
 * /api/auth/users/{userId}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/users/:userId', authenticateToken, requireAdmin, logAccess, authController.deleteUser);

export default router;
