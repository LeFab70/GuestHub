import { Router } from 'express';
import { badgeController } from '../controllers/badge.controller';
import { badgeValidations } from '../validators';
import { authRateLimit } from '../middlewares/security';

const router = Router();

/**
 * @swagger
 * /api/badges:
 *   post:
 *     summary: Créer un nouveau badge
 *     tags: [Badges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitId
 *             properties:
 *               visitId:
 *                 type: string
 *               qrCode:
 *                 type: string
 *               etat:
 *                 type: string
 *                 enum: [ACTIF, INACTIF, EXPIRE]
 *               dateCreation:
 *                 type: string
 *                 format: date-time
 *               dateExpiration:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Badge créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authRateLimit, ...badgeValidations.create, badgeController.createBadge);

/**
 * @swagger
 * /api/badges:
 *   get:
 *     summary: Obtenir tous les badges avec pagination
 *     tags: [Badges]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Liste des badges récupérée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/', badgeController.getAllBadges);

/**
 * @swagger
 * /api/badges/active:
 *   get:
 *     summary: Obtenir les badges actifs
 *     tags: [Badges]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Badges actifs récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/active', badgeController.getActiveBadges);

/**
 * @swagger
 * /api/badges/scan:
 *   post:
 *     summary: Scanner un badge (lecture QR)
 *     tags: [Badges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrCode
 *             properties:
 *               qrCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Badge scanné avec succès
 *       404:
 *         description: Badge non trouvé ou QR code invalide
 *       500:
 *         description: Erreur serveur
 */
router.post('/scan', badgeController.scanBadge);

/**
 * @swagger
 * /api/badges/{id}:
 *   get:
 *     summary: Obtenir un badge par ID
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge récupéré avec succès
 *       404:
 *         description: Badge non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', badgeController.getBadgeById);

/**
 * @swagger
 * /api/badges/{id}:
 *   put:
 *     summary: Mettre à jour un badge
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visitId:
 *                 type: string
 *               qrCode:
 *                 type: string
 *               etat:
 *                 type: string
 *                 enum: [ACTIF, INACTIF, EXPIRE]
 *               dateCreation:
 *                 type: string
 *                 format: date-time
 *               dateExpiration:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Badge mis à jour avec succès
 *       404:
 *         description: Badge non trouvé
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', ...badgeValidations.update, badgeController.updateBadge);

/**
 * @swagger
 * /api/badges/{id}:
 *   delete:
 *     summary: Supprimer un badge
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge supprimé avec succès
 *       404:
 *         description: Badge non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', badgeController.deleteBadge);

/**
 * @swagger
 * /api/badges/{id}/activate:
 *   patch:
 *     summary: Activer un badge
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge activé avec succès
 *       404:
 *         description: Badge non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/activate', badgeController.activateBadge);

/**
 * @swagger
 * /api/badges/{id}/deactivate:
 *   patch:
 *     summary: Désactiver un badge
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge désactivé avec succès
 *       404:
 *         description: Badge non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/deactivate', badgeController.deactivateBadge);

/**
 * @swagger
 * /api/badges/{id}/qr-code:
 *   get:
 *     summary: Générer un QR code pour un badge
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code généré avec succès
 *       404:
 *         description: Badge non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/qr-code', badgeController.generateQRCode);

export default router;
