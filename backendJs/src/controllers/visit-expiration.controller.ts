import { Request, Response } from 'express';
import { VisitExpirationService } from '../services/visit-expiration.service';
import { logger } from '../config/logger';

export class VisitExpirationController {
  private expirationService = VisitExpirationService.getInstance();

  // Expirer manuellement une visite
  public expireVisit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { visitId } = req.params;

      if (!visitId) {
        res.status(400).json({
          success: false,
          message: 'Visit ID is required'
        });
        return;
      }

      const success = await this.expirationService.expireVisitById(visitId);

      if (success) {
        res.json({
          success: true,
          message: 'Visit expired successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Visit not found or not in EN_COURS status'
        });
      }
    } catch (error) {
      logger.error('Error expiring visit:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Obtenir le statut du service d'expiration
  public getExpirationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({
        success: true,
        data: {
          service: 'Visit Expiration Service',
          status: 'running',
          checkInterval: '5 minutes'
        }
      });
    } catch (error) {
      logger.error('Error getting expiration status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Déclencher manuellement la vérification d'expiration
  public triggerExpirationCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.expirationService.triggerManualCheck();
      res.json({
        success: true,
        message: 'Expiration check triggered',
        data: result
      });
    } catch (error) {
      logger.error('Error triggering expiration check:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Compter les visites à expirer sans les expirer
  public countVisitsToExpire = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.expirationService.countVisitsToExpire();
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error counting visits to expire:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}
