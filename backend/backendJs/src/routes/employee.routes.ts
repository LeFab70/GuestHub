import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller';
import { employeeValidations } from '../validators';
import { authRateLimit } from '../middlewares/security';

const router = Router();

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Créer un nouvel employé
 *     tags: [Employees]
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
 *               - poste
 *               - departmentId
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               poste:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Employé créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authRateLimit, ...employeeValidations.create, employeeController.createEmployee);

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Obtenir tous les employés avec pagination
 *     tags: [Employees]
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
 *         description: Liste des employés récupérée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/', employeeController.getAllEmployees);

/**
 * @swagger
 * /api/employees/search:
 *   get:
 *     summary: Rechercher des employés
 *     tags: [Employees]
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
router.get('/search', employeeController.searchEmployees);

/**
 * @swagger
 * /api/employees/stats:
 *   get:
 *     summary: Obtenir les statistiques des employés
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats', employeeController.getEmployeeStats);

/**
 * @swagger
 * /api/employees/department/{departmentId}:
 *   get:
 *     summary: Obtenir les employés par département
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Employés par département récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/department/:departmentId', employeeController.getEmployeesByDepartment);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Obtenir un employé par ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employé récupéré avec succès
 *       404:
 *         description: Employé non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', employeeController.getEmployeeById);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Mettre à jour un employé
 *     tags: [Employees]
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
 *               poste:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Employé mis à jour avec succès
 *       404:
 *         description: Employé non trouvé
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', ...employeeValidations.update, employeeController.updateEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Supprimer un employé
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employé supprimé avec succès
 *       404:
 *         description: Employé non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', employeeController.deleteEmployee);

export default router;
