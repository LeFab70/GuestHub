import { PrismaClient, BadgeStatus, VisitStatus } from '@prisma/client';
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
      }),
      prisma.department.upsert({
        where: { nom_isActive: { nom: 'Ventes', isActive: true } },
        update: {},
        create: {
          nom: 'Ventes',
          description: 'Département commercial et ventes'
        }
      }),
      prisma.department.upsert({
        where: { nom_isActive: { nom: 'Production', isActive: true } },
        update: {},
        create: {
          nom: 'Production',
          description: 'Département de production'
        }
      }),
      prisma.department.upsert({
        where: { nom_isActive: { nom: 'Qualité', isActive: true } },
        update: {},
        create: {
          nom: 'Qualité',
          description: 'Contrôle qualité et assurance'
        }
      }),
      prisma.department.upsert({
        where: { nom_isActive: { nom: 'Logistique', isActive: true } },
        update: {},
        create: {
          nom: 'Logistique',
          description: 'Gestion logistique et approvisionnement'
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
      }),
      prisma.employee.upsert({
        where: { email: 'alex.moreau@guesthub.com' },
        update: {},
        create: {
          nom: 'Moreau',
          prenom: 'Alex',
          email: 'alex.moreau@guesthub.com',
          telephone: '+33123456794',
          poste: 'Comptable',
          departmentId: departments[4].id
        }
      }),
      prisma.employee.upsert({
        where: { email: 'lisa.roux@guesthub.com' },
        update: {},
        create: {
          nom: 'Roux',
          prenom: 'Lisa',
          email: 'lisa.roux@guesthub.com',
          telephone: '+33123456795',
          poste: 'Commercial',
          departmentId: departments[5].id
        }
      }),
      prisma.employee.upsert({
        where: { email: 'thomas.leblanc@guesthub.com' },
        update: {},
        create: {
          nom: 'Leblanc',
          prenom: 'Thomas',
          email: 'thomas.leblanc@guesthub.com',
          telephone: '+33123456796',
          poste: 'Chef de Production',
          departmentId: departments[6].id
        }
      }),
      prisma.employee.upsert({
        where: { email: 'emma.petit@guesthub.com' },
        update: {},
        create: {
          nom: 'Petit',
          prenom: 'Emma',
          email: 'emma.petit@guesthub.com',
          telephone: '+33123456797',
          poste: 'Contrôleur Qualité',
          departmentId: departments[7].id
        }
      }),
      prisma.employee.upsert({
        where: { email: 'david.simon@guesthub.com' },
        update: {},
        create: {
          nom: 'Simon',
          prenom: 'David',
          email: 'david.simon@guesthub.com',
          telephone: '+33123456798',
          poste: 'Responsable Logistique',
          departmentId: departments[8].id
        }
      })
    ]);

    logger.info('Employees created:', employees.length);

    // Create sample visitors
    const visitors = await Promise.all([
      prisma.visitor.upsert({
        where: { email: 'john.smith@example.com' },
        update: {},
        create: {
          nom: 'Smith',
          prenom: 'John',
          email: 'john.smith@example.com',
          telephone: '+33123456793',
          entreprise: 'TechCorp',
          estBlackliste: false
        }
      }),
      prisma.visitor.upsert({
        where: { email: 'sarah.johnson@example.com' },
        update: {},
        create: {
          nom: 'Johnson',
          prenom: 'Sarah',
          email: 'sarah.johnson@example.com',
          telephone: '+33123456794',
          entreprise: 'InnovateLab',
          estBlackliste: false
        }
      }),
      prisma.visitor.upsert({
        where: { email: 'michael.brown@example.com' },
        update: {},
        create: {
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

    // Create additional visitors for more realistic data
    const additionalVisitors = await Promise.all([
      prisma.visitor.upsert({
        where: { email: 'emma.wilson@example.com' },
        update: {},
        create: {
          nom: 'Wilson',
          prenom: 'Emma',
          email: 'emma.wilson@example.com',
          telephone: '+33123456796',
          entreprise: 'DesignStudio',
          estBlackliste: false
        }
      }),
      prisma.visitor.upsert({
        where: { email: 'carlos.garcia@example.com' },
        update: {},
        create: {
          nom: 'Garcia',
          prenom: 'Carlos',
          email: 'carlos.garcia@example.com',
          telephone: '+33123456797',
          entreprise: 'ConsultingPro',
          estBlackliste: false
        }
      }),
      prisma.visitor.upsert({
        where: { email: 'jennifer.lee@example.com' },
        update: {},
        create: {
          nom: 'Lee',
          prenom: 'Jennifer',
          email: 'jennifer.lee@example.com',
          telephone: '+33123456798',
          entreprise: 'TechStartup',
          estBlackliste: false
        }
      })
    ]);

    // Create sample visits with different statuses
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const visits = await Promise.all([
      // Visite planifiée pour demain
      prisma.visite.create({
        data: {
          dateDebut: tomorrow,
          dateFin: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), // +4 hours
          motif: 'Réunion de projet',
          statut: VisitStatus.PLANIFIEE,
          visiteurId: visitors[0].id,
          employeId: employees[2].id
        }
      }),
      // Visite en cours (commencée il y a 1 heure)
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
          dateFin: new Date(now.getTime() + 4 * 60 * 60 * 1000), // fin dans 4 heures
          motif: 'Entretien technique',
          statut: VisitStatus.EN_COURS,
          visiteurId: additionalVisitors[0].id,
          employeId: employees[2].id
        }
      }),
      // Visite terminée hier
      prisma.visite.create({
        data: {
          dateDebut: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000), // 9h hier
          dateFin: new Date(yesterday.getTime() + 11 * 60 * 60 * 1000), // 11h hier
          motif: 'Présentation commerciale',
          statut: VisitStatus.TERMINEE,
          visiteurId: visitors[1].id,
          employeId: employees[3].id
        }
      }),
      // Visite planifiée pour la semaine prochaine
      prisma.visite.create({
        data: {
          dateDebut: nextWeek,
          dateFin: new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000), // +4 hours
          motif: 'Formation',
          statut: VisitStatus.PLANIFIEE,
          visiteurId: additionalVisitors[1].id,
          employeId: employees[1].id
        }
      }),
      // Visite en cours (commencée il y a 30 minutes)
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
          dateFin: new Date(now.getTime() + 4 * 60 * 60 * 1000), // fin dans 4 heures
          motif: 'Réunion client',
          statut: VisitStatus.EN_COURS,
          visiteurId: additionalVisitors[2].id,
          employeId: employees[0].id
        }
      }),
      // Visite terminée ce matin
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
          dateFin: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          motif: 'Audit qualité',
          statut: VisitStatus.TERMINEE,
          visiteurId: visitors[2].id,
          employeId: employees[1].id
        }
      }),
      // Plus de visites pour enrichir les données par département
      // Direction Générale - 3 visites
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 2 * 60 * 60 * 1000),
          motif: 'Réunion stratégique',
          statut: VisitStatus.EN_COURS,
          visiteurId: visitors[0].id,
          employeId: employees[0].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 6 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          motif: 'Présentation annuelle',
          statut: VisitStatus.TERMINEE,
          visiteurId: additionalVisitors[0].id,
          employeId: employees[0].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          motif: 'Conseil d\'administration',
          statut: VisitStatus.PLANIFIEE,
          visiteurId: additionalVisitors[1].id,
          employeId: employees[0].id
        }
      }),
      // Informatique - 5 visites
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 3 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 1 * 60 * 60 * 1000),
          motif: 'Développement logiciel',
          statut: VisitStatus.EN_COURS,
          visiteurId: visitors[1].id,
          employeId: employees[2].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 8 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() - 6 * 60 * 60 * 1000),
          motif: 'Formation technique',
          statut: VisitStatus.TERMINEE,
          visiteurId: additionalVisitors[2].id,
          employeId: employees[2].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          motif: 'Audit sécurité',
          statut: VisitStatus.PLANIFIEE,
          visiteurId: visitors[2].id,
          employeId: employees[2].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 5 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() - 3 * 60 * 60 * 1000),
          motif: 'Maintenance système',
          statut: VisitStatus.TERMINEE,
          visiteurId: additionalVisitors[0].id,
          employeId: employees[2].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
          motif: 'Migration données',
          statut: VisitStatus.PLANIFIEE,
          visiteurId: additionalVisitors[1].id,
          employeId: employees[2].id
        }
      }),
      // Marketing - 4 visites
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 3 * 60 * 60 * 1000),
          motif: 'Campagne publicitaire',
          statut: VisitStatus.EN_COURS,
          visiteurId: visitors[0].id,
          employeId: employees[3].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 7 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() - 5 * 60 * 60 * 1000),
          motif: 'Étude de marché',
          statut: VisitStatus.TERMINEE,
          visiteurId: additionalVisitors[2].id,
          employeId: employees[3].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          motif: 'Lancement produit',
          statut: VisitStatus.PLANIFIEE,
          visiteurId: visitors[1].id,
          employeId: employees[3].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 9 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() - 7 * 60 * 60 * 1000),
          motif: 'Analyse concurrentielle',
          statut: VisitStatus.TERMINEE,
          visiteurId: additionalVisitors[0].id,
          employeId: employees[3].id
        }
      }),
      // Ventes - 6 visites
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 2.5 * 60 * 60 * 1000),
          motif: 'Négociation contrat',
          statut: VisitStatus.EN_COURS,
          visiteurId: visitors[2].id,
          employeId: employees[4].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 5.5 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() - 3.5 * 60 * 60 * 1000),
          motif: 'Présentation commerciale',
          statut: VisitStatus.TERMINEE,
          visiteurId: additionalVisitors[1].id,
          employeId: employees[4].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          motif: 'Formation équipe',
          statut: VisitStatus.PLANIFIEE,
          visiteurId: additionalVisitors[2].id,
          employeId: employees[4].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 10 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() - 8 * 60 * 60 * 1000),
          motif: 'Suivi client',
          statut: VisitStatus.TERMINEE,
          visiteurId: visitors[0].id,
          employeId: employees[4].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          motif: 'Réunion équipe',
          statut: VisitStatus.PLANIFIEE,
          visiteurId: visitors[1].id,
          employeId: employees[4].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 12 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() - 10 * 60 * 60 * 1000),
          motif: 'Analyse performance',
          statut: VisitStatus.TERMINEE,
          visiteurId: additionalVisitors[0].id,
          employeId: employees[4].id
        }
      }),
      // Production - 2 visites
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 2.5 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 1.5 * 60 * 60 * 1000),
          motif: 'Contrôle production',
          statut: VisitStatus.EN_COURS,
          visiteurId: additionalVisitors[1].id,
          employeId: employees[5].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 11 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() - 9 * 60 * 60 * 1000),
          motif: 'Optimisation processus',
          statut: VisitStatus.TERMINEE,
          visiteurId: additionalVisitors[2].id,
          employeId: employees[5].id
        }
      }),
      // Qualité - 3 visites
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 3.5 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 0.5 * 60 * 60 * 1000),
          motif: 'Audit qualité',
          statut: VisitStatus.EN_COURS,
          visiteurId: visitors[0].id,
          employeId: employees[6].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 13 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() - 11 * 60 * 60 * 1000),
          motif: 'Certification ISO',
          statut: VisitStatus.TERMINEE,
          visiteurId: visitors[1].id,
          employeId: employees[6].id
        }
      }),
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          motif: 'Formation qualité',
          statut: VisitStatus.PLANIFIEE,
          visiteurId: visitors[2].id,
          employeId: employees[6].id
        }
      }),
      // Logistique - 1 visite
      prisma.visite.create({
        data: {
          dateDebut: new Date(now.getTime() - 4.5 * 60 * 60 * 1000),
          dateFin: new Date(now.getTime() - 2.5 * 60 * 60 * 1000),
          motif: 'Optimisation stock',
          statut: VisitStatus.TERMINEE,
          visiteurId: additionalVisitors[0].id,
          employeId: employees[7].id
        }
      })
    ]);

    logger.info('Visits created:', visits.length);

    // Create exactly one badge per visit according to visit status
    const receptionistUser = users[1];
    await Promise.all(
      visits.map(async (v) => {
        const base = {
          visiteId: v.id,
          qrCode: 'QR' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };
        if (v.statut === VisitStatus.PLANIFIEE) {
          await prisma.badge.create({ data: { ...base, status: BadgeStatus.GENERATED } });
        } else if (v.statut === VisitStatus.EN_COURS) {
          await prisma.badge.create({ data: { ...base, status: BadgeStatus.PRINTED, dateImpression: new Date(), printById: receptionistUser.id } });
        } else if (v.statut === VisitStatus.TERMINEE || v.statut === VisitStatus.EXPIREE) {
          await prisma.badge.create({ data: { ...base, status: BadgeStatus.CLOSED } });
        } else {
          await prisma.badge.create({ data: { ...base, status: BadgeStatus.GENERATED } });
        }
      })
    );

    logger.info('Badges created for visits:', visits.length);

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
