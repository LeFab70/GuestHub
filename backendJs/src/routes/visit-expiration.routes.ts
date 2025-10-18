import { Router } from 'express';
import { VisitExpirationController } from '../controllers/visit-expiration.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { dashboardRateLimit } from '../middlewares/security';

const router = Router();
const visitExpirationController = new VisitExpirationController();

// Routes protégées - nécessitent une authentification
router.use(authenticateToken);

// Appliquer le rate limiter dashboard pour tous les endpoints
router.use(dashboardRateLimit);

// Expirer manuellement une visite (admin seulement)
router.post('/expire/:visitId', requireAdmin, visitExpirationController.expireVisit);

// Déclencher manuellement la vérification d'expiration (admin et réceptionniste)
router.post('/check', visitExpirationController.triggerExpirationCheck);

// Obtenir le statut du service d'expiration (admin seulement)
router.get('/status', requireAdmin, visitExpirationController.getExpirationStatus);

// Compter les visites à expirer (admin et réceptionniste)
router.get('/count', visitExpirationController.countVisitsToExpire);

export default router;
