import { Router } from 'express';
import { visitorController } from '../controllers/visitor.controller';
import { visitorValidations } from '../validators';
import { authRateLimit } from '../middlewares/security';

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
router.post('/', authRateLimit, ...visitorValidations.create, visitorController.createVisitor);

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
router.get('/', visitorController.getAllVisitors);

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
router.get('/search', visitorController.searchVisitors);

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
router.get('/:id', visitorController.getVisitorById);

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
router.put('/:id', ...visitorValidations.update, visitorController.updateVisitor);

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
router.delete('/:id', visitorController.deleteVisitor);

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
router.patch('/:id/toggle-blacklist', visitorController.toggleBlacklist);

export default router;
