import { Router } from 'express';
import { VisitStatisticsController } from '../controllers/visit-statistics.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const visitStatisticsController = new VisitStatisticsController();

// Routes protégées - nécessitent une authentification
router.use(authenticateToken);

// Obtenir les statistiques des visites
router.get('/statistics', visitStatisticsController.getVisitStatistics);

export default router;


