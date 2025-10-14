import { Router } from 'express';
import { visitController } from '../controllers/visit.controller';
import { visitValidations } from '../validators';
import { authRateLimit } from '../middlewares/security';

const router = Router();

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
router.post('/', authRateLimit, ...visitValidations.create, visitController.createVisit);

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
 *     responses:
 *       200:
 *         description: Liste des visites récupérée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/', visitController.getAllVisits);

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
router.get('/active', visitController.getActiveVisits);

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
router.get('/stats', visitController.getVisitStats);

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
router.get('/:id', visitController.getVisitById);

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
router.put('/:id', ...visitValidations.update, visitController.updateVisit);

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
router.delete('/:id', visitController.deleteVisit);

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
router.patch('/:id/check-in', visitController.checkIn);

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
router.patch('/:id/check-out', visitController.checkOut);

export default router;
