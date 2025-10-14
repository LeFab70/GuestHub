import { Router } from 'express';
import { departmentController } from '../controllers/department.controller';
import { departmentValidations } from '../validators';
import { authRateLimit } from '../middlewares/security';
import { authenticateToken, requireAdmin, requireReceptionistOrAdmin, logAccess } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Créer un nouveau département
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Département créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authRateLimit, authenticateToken, requireAdmin, logAccess, ...departmentValidations.create, departmentController.createDepartment);

/**
 * @swagger
 * /api/departments/with-suggestion:
 *   post:
 *     summary: Créer un nouveau département avec suggestion automatique en cas de doublon
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Département créé avec succès (nom automatiquement ajusté si nécessaire)
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/with-suggestion', authRateLimit, authenticateToken, requireAdmin, logAccess, ...departmentValidations.create, departmentController.createDepartmentWithSuggestion);

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Obtenir tous les départements avec pagination
 *     tags: [Departments]
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
 *         description: Liste des départements récupérée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, requireReceptionistOrAdmin, logAccess, departmentController.getAllDepartments);

/**
 * @swagger
 * /api/departments/search:
 *   get:
 *     summary: Rechercher des départements
 *     tags: [Departments]
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
router.get('/search', departmentController.searchDepartments);

/**
 * @swagger
 * /api/departments/stats:
 *   get:
 *     summary: Obtenir les statistiques des départements
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats', departmentController.getDepartmentStats);

/**
 * @swagger
 * /api/departments/with-employee-count:
 *   get:
 *     summary: Obtenir les départements avec le nombre d'employés
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: Départements avec nombre d'employés récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/with-employee-count', departmentController.getDepartmentsWithEmployeeCount);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Obtenir un département par ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Département récupéré avec succès
 *       404:
 *         description: Département non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', departmentController.getDepartmentById);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Mettre à jour un département
 *     tags: [Departments]
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
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Département mis à jour avec succès
 *       404:
 *         description: Département non trouvé
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, requireAdmin, logAccess, ...departmentValidations.update, departmentController.updateDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Supprimer un département
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Département supprimé avec succès
 *       404:
 *         description: Département non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, requireAdmin, logAccess, departmentController.deleteDepartment);

export default router;
