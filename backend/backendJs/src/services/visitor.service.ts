import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { CreateVisitorRequest, UpdateVisitorRequest, SearchQuery, PaginatedResponse } from '../types';
import { Visitor } from '@prisma/client';

export class VisitorService {
  // Create visitor
  async createVisitor(visitorData: CreateVisitorRequest): Promise<Visitor> {
    try {
      // Check if visitor with same email already exists
      if (visitorData.email) {
        const existingVisitor = await prisma.visitor.findUnique({
          where: { email: visitorData.email }
        });

        if (existingVisitor) {
          throw new Error('Visitor with this email already exists');
        }
      }

      const visitor = await prisma.visitor.create({
        data: visitorData
      });

      logger.info('Visitor created successfully', { visitorId: visitor.id, email: visitor.email });

      return visitor;
    } catch (error) {
      logger.error('Visitor creation failed:', error);
      throw error;
    }
  }

  // Get visitor by ID
  async getVisitorById(id: string): Promise<Visitor | null> {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { id }
      });

      return visitor;
    } catch (error) {
      logger.error('Get visitor by ID failed:', error);
      throw error;
    }
  }

  // Get all visitors with pagination and search
  async getVisitors(query: SearchQuery): Promise<PaginatedResponse<Visitor>> {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        filter = {}
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        ...filter
      };

      // Add search functionality
      if (search) {
        where.OR = [
          { nom: { contains: search, mode: 'insensitive' } },
          { prenom: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { entreprise: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count
      const total = await prisma.visitor.count({ where });

      // Get visitors
      const visitors = await prisma.visitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: visitors,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Get visitors failed:', error);
      throw error;
    }
  }

  // Update visitor
  async updateVisitor(id: string, updateData: UpdateVisitorRequest): Promise<Visitor> {
    try {
      // Check if visitor exists
      const existingVisitor = await prisma.visitor.findUnique({
        where: { id }
      });

      if (!existingVisitor) {
        throw new Error('Visitor not found');
      }

      // Check if email is being updated and if it already exists
      if (updateData.email && updateData.email !== existingVisitor.email) {
        const emailExists = await prisma.visitor.findUnique({
          where: { email: updateData.email }
        });

        if (emailExists) {
          throw new Error('Visitor with this email already exists');
        }
      }

      const visitor = await prisma.visitor.update({
        where: { id },
        data: updateData
      });

      logger.info('Visitor updated successfully', { visitorId: id });

      return visitor;
    } catch (error) {
      logger.error('Visitor update failed:', error);
      throw error;
    }
  }

  // Delete visitor
  async deleteVisitor(id: string): Promise<boolean> {
    try {
      // Check if visitor has active visits
      const activeVisits = await prisma.visite.findFirst({
        where: {
          visiteurId: id,
          statut: { in: ['PLANIFIEE', 'EN_COURS'] }
        }
      });

      if (activeVisits) {
        throw new Error('Cannot delete visitor with active visits');
      }

      await prisma.visitor.delete({
        where: { id }
      });

      logger.info('Visitor deleted successfully', { visitorId: id });
      return true;
    } catch (error) {
      logger.error('Visitor deletion failed:', error);
      throw error;
    }
  }

  // Blacklist visitor
  async blacklistVisitor(id: string): Promise<Visitor> {
    try {
      const visitor = await prisma.visitor.update({
        where: { id },
        data: { estBlackliste: true }
      });

      logger.info('Visitor blacklisted successfully', { visitorId: id });

      return visitor;
    } catch (error) {
      logger.error('Visitor blacklisting failed:', error);
      throw error;
    }
  }

  // Remove visitor from blacklist
  async unblacklistVisitor(id: string): Promise<Visitor> {
    try {
      const visitor = await prisma.visitor.update({
        where: { id },
        data: { estBlackliste: false }
      });

      logger.info('Visitor removed from blacklist successfully', { visitorId: id });

      return visitor;
    } catch (error) {
      logger.error('Visitor unblacklisting failed:', error);
      throw error;
    }
  }

  // Get blacklisted visitors
  async getBlacklistedVisitors(query: SearchQuery): Promise<PaginatedResponse<Visitor>> {
    try {
      const {
        page = 1,
        limit = 10,
        search = ''
      } = query;

      const skip = (page - 1) * limit;

      const where: any = {
        estBlackliste: true
      };

      if (search) {
        where.OR = [
          { nom: { contains: search, mode: 'insensitive' } },
          { prenom: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { entreprise: { contains: search, mode: 'insensitive' } }
        ];
      }

      const total = await prisma.visitor.count({ where });

      const visitors = await prisma.visitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: visitors,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Get blacklisted visitors failed:', error);
      throw error;
    }
  }

  // Get visitor statistics
  async getVisitorStats(): Promise<{
    total: number;
    blacklisted: number;
    active: number;
    recent: number;
  }> {
    try {
      const [total, blacklisted, active, recent] = await Promise.all([
        prisma.visitor.count(),
        prisma.visitor.count({ where: { estBlackliste: true } }),
        prisma.visitor.count({ where: { estBlackliste: false } }),
        prisma.visitor.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        })
      ]);

      return { total, blacklisted, active, recent };
    } catch (error) {
      logger.error('Get visitor statistics failed:', error);
      throw error;
    }
  }

  // Search visitors by name or email
  async searchVisitors(searchTerm: string, limit: number = 10): Promise<Visitor[]> {
    try {
      const visitors = await prisma.visitor.findMany({
        where: {
          OR: [
            { nom: { contains: searchTerm, mode: 'insensitive' } },
            { prenom: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        take: limit,
        orderBy: { nom: 'asc' }
      });

      return visitors;
    } catch (error) {
      logger.error('Search visitors failed:', error);
      throw error;
    }
  }

  // Get visitor by email
  async getVisitorByEmail(email: string): Promise<Visitor | null> {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { email }
      });

      return visitor;
    } catch (error) {
      logger.error('Get visitor by email failed:', error);
      throw error;
    }
  }

  // Check if visitor is blacklisted
  async isVisitorBlacklisted(email: string): Promise<boolean> {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { email },
        select: { estBlackliste: true }
      });

      return visitor?.estBlackliste || false;
    } catch (error) {
      logger.error('Check visitor blacklist status failed:', error);
      throw error;
    }
  }
}

export const visitorService = new VisitorService();
