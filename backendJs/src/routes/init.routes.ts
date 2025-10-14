import { Router } from 'express';
import { initController } from '../controllers/init.controller';
import { authRateLimit } from '../middlewares/security';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Initialization
 *   description: Application initialization and setup
 */

/**
 * @swagger
 * /api/init/status:
 *   get:
 *     summary: Get application initialization status
 *     tags: [Initialization]
 *     responses:
 *       200:
 *         description: Status retrieved successfully
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
 *                     initialized:
 *                       type: boolean
 *                     adminCount:
 *                       type: number
 *                     totalUsers:
 *                       type: number
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get('/status', initController.getStatus);

/**
 * @swagger
 * /api/init/initialize:
 *   post:
 *     summary: Initialize application with first admin user
 *     tags: [Initialization]
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
 *                 description: Admin username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Admin password
 *               nom:
 *                 type: string
 *                 description: Admin last name
 *               prenom:
 *                 type: string
 *                 description: Admin first name
 *     responses:
 *       201:
 *         description: Application initialized successfully
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
 *                     message:
 *                       type: string
 *                     adminEmail:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid data or missing required fields
 *       409:
 *         description: Application already initialized
 *       500:
 *         description: Server error
 */
router.post('/initialize', authRateLimit, initController.initialize);

/**
 * @swagger
 * /api/init/reset:
 *   post:
 *     summary: Reset application (DANGEROUS - deletes all users)
 *     tags: [Initialization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirm
 *             properties:
 *               confirm:
 *                 type: string
 *                 enum: [RESET_ALL_DATA]
 *                 description: Confirmation string to reset all data
 *     responses:
 *       200:
 *         description: Application reset successfully
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
 *                     message:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing or invalid confirmation
 *       500:
 *         description: Server error
 */
router.post('/reset', authRateLimit, initController.reset);

export default router;
