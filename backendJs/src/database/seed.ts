import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../config/logger';
import config from '../config/env';

const prisma = new PrismaClient();

async function main() {
  logger.info('Starting database seeding...');

  try {
    // Create departments
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { nom_isActive: { nom: 'Direction Générale', isActive: true } },
        update: {},
        create: {
          nom: 'Direction Générale',
          description: 'Direction générale de l\'entreprise'
        }
      }),
      prisma.department.upsert({
        where: { nom_isActive: { nom: 'Ressources Humaines', isActive: true } },
        update: {},
        create: {
          nom: 'Ressources Humaines',
          description: 'Gestion des ressources humaines'
        }
      }),
      prisma.department.upsert({
        where: { nom_isActive: { nom: 'Informatique', isActive: true } },
        update: {},
        create: {
          nom: 'Informatique',
          description: 'Département informatique et systèmes'
        }
      }),
      prisma.department.upsert({
        where: { nom_isActive: { nom: 'Marketing', isActive: true } },
        update: {},
        create: {
          nom: 'Marketing',
          description: 'Marketing et communication'
        }
      }),
      prisma.department.upsert({
        where: { nom_isActive: { nom: 'Comptabilité', isActive: true } },
        update: {},
        create: {
          nom: 'Comptabilité',
          description: 'Gestion comptable et financière'
        }
      })
    ]);

    logger.info('Departments created:', departments.length);

    // Create users
    const hashedPassword = await bcrypt.hash('admin123', config.BCRYPT_ROUNDS);
    const receptionPassword = await bcrypt.hash('reception123', config.BCRYPT_ROUNDS);

    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@guesthub.com' },
        update: {},
        create: {
          login: 'admin',
          email: 'admin@guesthub.com',
          password: hashedPassword,
          nom: 'Administrateur',
          prenom: 'Système',
          role: 'ADMIN'
        }
      }),
      prisma.user.upsert({
        where: { email: 'reception@guesthub.com' },
        update: {},
        create: {
          login: 'reception',
          email: 'reception@guesthub.com',
          password: receptionPassword,
          nom: 'Réceptionniste',
          prenom: 'Principal',
          role: 'RECEPTIONNISTE'
        }
      })
    ]);

    logger.info('Users created:', users.length);

    // Create employees
    const employees = await Promise.all([
      prisma.employee.upsert({
        where: { email: 'jean.dupont@guesthub.com' },
        update: {},
        create: {
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@guesthub.com',
          telephone: '+33123456789',
          poste: 'Directeur Général',
          departmentId: departments[0].id
        }
      }),
      prisma.employee.upsert({
        where: { email: 'marie.martin@guesthub.com' },
        update: {},
        create: {
          nom: 'Martin',
          prenom: 'Marie',
          email: 'marie.martin@guesthub.com',
          telephone: '+33123456790',
          poste: 'Responsable RH',
          departmentId: departments[1].id
        }
      }),
      prisma.employee.upsert({
        where: { email: 'pierre.durand@guesthub.com' },
        update: {},
        create: {
          nom: 'Durand',
          prenom: 'Pierre',
          email: 'pierre.durand@guesthub.com',
          telephone: '+33123456791',
          poste: 'Développeur Senior',
          departmentId: departments[2].id
        }
      }),
      prisma.employee.upsert({
        where: { email: 'sophie.bernard@guesthub.com' },
        update: {},
        create: {
          nom: 'Bernard',
          prenom: 'Sophie',
          email: 'sophie.bernard@guesthub.com',
          telephone: '+33123456792',
          poste: 'Chef de Projet Marketing',
          departmentId: departments[3].id
        }
      })
    ]);

    logger.info('Employees created:', employees.length);

    // Create sample visitors
    const visitors = await Promise.all([
      prisma.visitor.create({
        data: {
          nom: 'Smith',
          prenom: 'John',
          email: 'john.smith@example.com',
          telephone: '+33123456793',
          entreprise: 'TechCorp',
          estBlackliste: false
        }
      }),
      prisma.visitor.create({
        data: {
          nom: 'Johnson',
          prenom: 'Sarah',
          email: 'sarah.johnson@example.com',
          telephone: '+33123456794',
          entreprise: 'InnovateLab',
          estBlackliste: false
        }
      }),
      prisma.visitor.create({
        data: {
          nom: 'Brown',
          prenom: 'Michael',
          email: 'michael.brown@example.com',
          telephone: '+33123456795',
          entreprise: 'FutureSoft',
          estBlackliste: true
        }
      })
    ]);

    logger.info('Visitors created:', visitors.length);

    // Create sample visits
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const visits = await Promise.all([
      prisma.visite.create({
        data: {
          dateDebut: tomorrow,
          dateFin: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // +2 hours
          motif: 'Réunion de projet',
          statut: 'PLANIFIEE',
          visiteurId: visitors[0].id,
          employeId: employees[2].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: nextWeek,
          motif: 'Entretien d\'embauche',
          statut: 'PLANIFIEE',
          visiteurId: visitors[1].id,
          employeId: employees[1].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          dateFin: now,
          motif: 'Présentation commerciale',
          statut: 'TERMINEE',
          visiteurId: visitors[0].id,
          employeId: employees[3].id
        }
      })
    ]);

    logger.info('Visits created:', visits.length);

    // Create sample badges
    const badges = await Promise.all([
      prisma.badge.create({
        data: {
          qrCode: 'QR' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          etat: 'GENERE',
          visiteId: visits[0].id
        }
      }),
      prisma.badge.create({
        data: {
          qrCode: 'QR' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          etat: 'IMPRIME',
          visiteId: visits[2].id
        }
      })
    ]);

    logger.info('Badges created:', badges.length);

    // Create sample audit logs
    const auditLogs = await Promise.all([
      prisma.auditLog.create({
        data: {
          action: 'Création utilisateur',
          entityType: 'User',
          entityId: users[0].id,
          details: 'Utilisateur administrateur créé',
          userId: users[0].id
        }
      }),
      prisma.auditLog.create({
        data: {
          action: 'Création visiteur',
          entityType: 'Visitor',
          entityId: visitors[0].id,
          details: 'Nouveau visiteur enregistré',
          userId: users[1].id
        }
      }),
      prisma.auditLog.create({
        data: {
          action: 'Planification visite',
          entityType: 'Visit',
          entityId: visits[0].id,
          details: 'Visite planifiée pour demain',
          userId: users[1].id
        }
      })
    ]);

    logger.info('Audit logs created:', auditLogs.length);

    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    logger.error('Seeding process failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
