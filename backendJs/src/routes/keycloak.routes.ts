import { Router } from 'express';
import { keycloakController } from '../controllers/keycloak.controller';
// import { protectRoute } from '../config/keycloak'; // Temporarily disabled

const router = Router();

// All Keycloak routes are temporarily disabled
// Comment out all routes that use protectRoute

/**
 * @swagger
 * /api/keycloak/me:
 *   get:
 *     summary: Obtenir les informations de l'utilisateur connecté
 *     tags: [Keycloak]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur récupérées avec succès
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
// router.get('/me', protectRoute(), keycloakController.getCurrentUser); // Temporarily disabled

/**
 * @swagger
 * /api/keycloak/users:
 *   get:
 *     summary: Obtenir tous les utilisateurs (Admin seulement)
 *     tags: [Keycloak]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */
// router.get('/users', protectRoute(['ADMIN']), keycloakController.getAllUsers); // Temporarily disabled

/**
 * @swagger
 * /api/keycloak/users/search:
 *   get:
 *     summary: Rechercher des utilisateurs
 *     tags: [Keycloak]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Recherche terminée avec succès
 *       400:
 *         description: Requête de recherche manquante
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
// router.get('/users/search', protectRoute(['ADMIN', 'MANAGER']), keycloakController.searchUsers);

/**
 * @swagger
 * /api/keycloak/users/{id}:
 *   get:
 *     summary: Obtenir un utilisateur par ID
 *     tags: [Keycloak]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
// router.get('/users/:id', protectRoute(['ADMIN', 'MANAGER']), keycloakController.getUserById);

/**
 * @swagger
 * /api/keycloak/users:
 *   post:
 *     summary: Créer un utilisateur avec rôle
 *     tags: [Keycloak]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - firstName
 *               - lastName
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, RECEPTIONNISTE]
 *               enabled:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */
// router.post('/users', protectRoute(['ADMIN']), keycloakController.createUser);

/**
 * @swagger
 * /api/keycloak/users/admin:
 *   post:
 *     summary: Créer un utilisateur administrateur
 *     tags: [Keycloak]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Administrateur créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */
// router.post('/users/admin', protectRoute(['ADMIN']), keycloakController.createAdmin);

/**
 * @swagger
 * /api/keycloak/users/receptionist:
 *   post:
 *     summary: Créer un utilisateur réceptionniste
 *     tags: [Keycloak]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Réceptionniste créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */
// router.post('/users/receptionist', protectRoute(['ADMIN']), keycloakController.createReceptionist);

/**
 * @swagger
 * /api/keycloak/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Keycloak]
 *     security:
 *       - bearerAuth: []
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
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */
// router.put('/users/:id', protectRoute(['ADMIN']), keycloakController.updateUser);

/**
 * @swagger
 * /api/keycloak/users/{id}/roles:
 *   post:
 *     summary: Assigner des rôles à un utilisateur
 *     tags: [Keycloak]
 *     security:
 *       - bearerAuth: []
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
 *               - roles
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Rôles assignés avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */
// router.post('/users/:id/roles', protectRoute(['ADMIN']), keycloakController.assignRoles);

/**
 * @swagger
 * /api/keycloak/users/{id}/disable:
 *   post:
 *     summary: Désactiver un utilisateur
 *     tags: [Keycloak]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur désactivé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */
// router.post('/users/:id/disable', protectRoute(['ADMIN']), keycloakController.disableUser);

/**
 * @swagger
 * /api/keycloak/users/{id}/enable:
 *   post:
 *     summary: Activer un utilisateur
 *     tags: [Keycloak]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur activé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */
// router.post('/users/:id/enable', protectRoute(['ADMIN']), keycloakController.enableUser);

/**
 * @swagger
 * /api/keycloak/health:
 *   get:
 *     summary: Vérifier la connexion Keycloak
 *     tags: [Keycloak]
 *     responses:
 *       200:
 *         description: Connexion Keycloak réussie
 *       503:
 *         description: Connexion Keycloak échouée
 */
// router.get('/health', keycloakController.checkConnection);

export default router;
