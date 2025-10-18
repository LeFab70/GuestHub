import { Router } from 'express';
import { param } from 'express-validator';
import { visitController } from '../controllers/visit.controller';
import { visitValidations, handleValidationErrors } from '../validators';
import { authRateLimit } from '../middlewares/security';
import { authenticateToken, requireReceptionistOrAdmin } from '../middlewares/auth';

// Custom validators
const isValidCUID = (value: string): boolean => {
  const cuidPattern = /^c[a-z0-9]{24}$/;
  return cuidPattern.test(value);
};

const router = Router();

// Route publique pour la création de visites (mobile)
router.post('/public', visitValidations.create, visitController.createVisitPublic);

// Route publique pour confirmer une visite par le visiteur (mobile)
router.patch('/:id/confirm', [
  param('id').custom(isValidCUID).withMessage('ID de visite invalide'),
  handleValidationErrors
], visitController.confirmVisitByVisitor);

// Route publique pour récupérer les visites planifiées d'un visiteur (mobile)
router.get('/scheduled/:visiteurId', [
  param('visiteurId').custom(isValidCUID).withMessage('ID de visiteur invalide'),
  handleValidationErrors
], visitController.getScheduledVisitsByVisitor);

/**
 * @swagger
 * /api/visits:
 *   post:
 *     summary: Créer une nouvelle visite
 *     tags: [Visits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitorId
 *               - employeeId
 *               - departmentId
 *               - dateVisite
 *             properties:
 *               visitorId:
 *                 type: string
 *               employeeId:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               dateVisite:
 *                 type: string
 *                 format: date
 *               heureArrivee:
 *                 type: string
 *                 format: date-time
 *               heureDepart:
 *                 type: string
 *                 format: date-time
 *               objetVisite:
 *                 type: string
 *               statut:
 *                 type: string
 *                 enum: [PLANIFIEE, EN_COURS, TERMINEE, ANNULEE]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Visite créée avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, requireReceptionistOrAdmin, authRateLimit, ...visitValidations.create, visitController.createVisit);

/**
 * @swagger
 * /api/visits:
 *   get:
 *     summary: Obtenir toutes les visites avec pagination
 *     tags: [Visits]
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
 *       - in: query
 *         name: visiteurId
 *         schema:
 *           type: string
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [PLANIFIEE, EN_COURS, TERMINEE, ANNULEE]
 *     responses:
 *       200:
 *         description: Liste des visites récupérée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, requireReceptionistOrAdmin, visitController.getAllVisits);

/**
 * @swagger
 * /api/visits/active:
 *   get:
 *     summary: Obtenir les visites en cours
 *     tags: [Visits]
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
 *         description: Visites actives récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/active', authenticateToken, requireReceptionistOrAdmin, visitController.getActiveVisits);

/**
 * @swagger
 * /api/visits/stats:
 *   get:
 *     summary: Obtenir les statistiques des visites
 *     tags: [Visits]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats', authenticateToken, requireReceptionistOrAdmin, visitController.getVisitStats);

/**
 * @swagger
 * /api/visits/recent:
 *   get:
 *     summary: Obtenir les visites récentes (pour les notifications)
 *     tags: [Visits]
 *     parameters:
 *       - in: query
 *         name: since
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date depuis laquelle récupérer les visites
 *     responses:
 *       200:
 *         description: Visites récentes récupérées avec succès
 *       400:
 *         description: Paramètre "since" manquant
 *       500:
 *         description: Erreur serveur
 */
router.get('/recent', authenticateToken, requireReceptionistOrAdmin, visitController.getRecentVisits);

/**
 * @swagger
 * /api/visits/{id}:
 *   get:
 *     summary: Obtenir une visite par ID
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visite récupérée avec succès
 *       404:
 *         description: Visite non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, requireReceptionistOrAdmin, param('id').custom(isValidCUID).withMessage('ID must be a valid CUID'), handleValidationErrors, visitController.getVisitById);

/**
 * @swagger
 * /api/visits/{id}:
 *   put:
 *     summary: Mettre à jour une visite
 *     tags: [Visits]
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
 *               visitorId:
 *                 type: string
 *               employeeId:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               dateVisite:
 *                 type: string
 *                 format: date
 *               heureArrivee:
 *                 type: string
 *                 format: date-time
 *               heureDepart:
 *                 type: string
 *                 format: date-time
 *               objetVisite:
 *                 type: string
 *               statut:
 *                 type: string
 *                 enum: [PLANIFIEE, EN_COURS, TERMINEE, ANNULEE]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visite mise à jour avec succès
 *       404:
 *         description: Visite non trouvée
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, requireReceptionistOrAdmin, param('id').custom(isValidCUID).withMessage('ID must be a valid CUID'), ...visitValidations.update, visitController.updateVisit);

/**
 * @swagger
 * /api/visits/{id}:
 *   delete:
 *     summary: Supprimer une visite
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visite supprimée avec succès
 *       404:
 *         description: Visite non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, requireReceptionistOrAdmin, param('id').custom(isValidCUID).withMessage('ID must be a valid CUID'), handleValidationErrors, visitController.deleteVisit);

/**
 * @swagger
 * /api/visits/{id}/check-in:
 *   patch:
 *     summary: Check-in d'une visite
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Check-in effectué avec succès
 *       404:
 *         description: Visite non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/check-in', authenticateToken, requireReceptionistOrAdmin, param('id').custom(isValidCUID).withMessage('ID must be a valid CUID'), handleValidationErrors, visitController.checkIn);

/**
 * @swagger
 * /api/visits/{id}/check-out:
 *   patch:
 *     summary: Check-out d'une visite
 *     tags: [Visits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Check-out effectué avec succès
 *       404:
 *         description: Visite non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/check-out', authenticateToken, requireReceptionistOrAdmin, param('id').custom(isValidCUID).withMessage('ID must be a valid CUID'), handleValidationErrors, visitController.checkOut);

export default router;
