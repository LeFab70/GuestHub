import { Router } from 'express';
import { param } from 'express-validator';
import { visitorController } from '../controllers/visitor.controller';
import { visitorValidations, handleValidationErrors } from '../validators';
import { authRateLimit } from '../middlewares/security';
import { authenticateToken, requireReceptionistOrAdmin } from '../middlewares/auth';

// Custom validators
const isValidCUID = (value: string): boolean => {
  const cuidPattern = /^c[a-z0-9]{24}$/;
  return cuidPattern.test(value);
};

const router = Router();

/**
 * @swagger
 * /api/visitors:
 *   post:
 *     summary: Créer un nouveau visiteur
 *     tags: [Visitors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               entreprise:
 *                 type: string
 *               estBlackliste:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Visiteur créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, requireReceptionistOrAdmin, authRateLimit, ...visitorValidations.create, visitorController.createVisitor);

/**
 * @swagger
 * /api/visitors:
 *   get:
 *     summary: Obtenir tous les visiteurs avec pagination
 *     tags: [Visitors]
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
 *         description: Liste des visiteurs récupérée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, requireReceptionistOrAdmin, visitorController.getAllVisitors);

/**
 * @swagger
 * /api/visitors/public/search:
 *   get:
 *     summary: Rechercher des visiteurs (endpoint public pour mobile)
 *     tags: [Visitors]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Résultats de recherche récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/public/search', visitorController.searchVisitorsPublic);

/**
 * @swagger
 * /api/visitors/public:
 *   post:
 *     summary: Créer un nouveau visiteur (endpoint public pour mobile)
 *     tags: [Visitors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *               - email
 *               - telephone
 *               - entreprise
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               entreprise:
 *                 type: string
 *     responses:
 *       201:
 *         description: Visiteur créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/public', authRateLimit, ...visitorValidations.create, visitorController.createVisitorPublic);

/**
 * @swagger
 * /api/visitors/search:
 *   get:
 *     summary: Rechercher des visiteurs
 *     tags: [Visitors]
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
 *         description: Résultats de recherche récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/search', authenticateToken, requireReceptionistOrAdmin, visitorController.searchVisitors);

/**
 * @swagger
 * /api/visitors/{id}:
 *   get:
 *     summary: Obtenir un visiteur par ID
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visiteur récupéré avec succès
 *       404:
 *         description: Visiteur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, requireReceptionistOrAdmin, param('id').custom(isValidCUID).withMessage('ID must be a valid CUID'), handleValidationErrors, visitorController.getVisitorById);

/**
 * @swagger
 * /api/visitors/{id}:
 *   put:
 *     summary: Mettre à jour un visiteur
 *     tags: [Visitors]
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
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               entreprise:
 *                 type: string
 *               estBlackliste:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Visiteur mis à jour avec succès
 *       404:
 *         description: Visiteur non trouvé
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, requireReceptionistOrAdmin, param('id').custom(isValidCUID).withMessage('ID must be a valid CUID'), ...visitorValidations.update, visitorController.updateVisitor);

/**
 * @swagger
 * /api/visitors/{id}:
 *   delete:
 *     summary: Supprimer un visiteur
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visiteur supprimé avec succès
 *       404:
 *         description: Visiteur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, requireReceptionistOrAdmin, param('id').custom(isValidCUID).withMessage('ID must be a valid CUID'), handleValidationErrors, visitorController.deleteVisitor);

/**
 * @swagger
 * /api/visitors/{id}/toggle-blacklist:
 *   patch:
 *     summary: Blacklister/déblacklister un visiteur
 *     tags: [Visitors]
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
 *             required:
 *               - estBlackliste
 *             properties:
 *               estBlackliste:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Statut de blacklist mis à jour avec succès
 *       404:
 *         description: Visiteur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/toggle-blacklist', authenticateToken, requireReceptionistOrAdmin, param('id').custom(isValidCUID).withMessage('ID must be a valid CUID'), handleValidationErrors, visitorController.toggleBlacklist);

export default router;
