import { PrismaClient, VisitStatus, BadgeStatus } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

async function ensureBaseRefs() {
  // Ensure there are some employees and visitors to link
  const employees = await prisma.employee.findMany({ include: { department: true } });
  const visitors = await prisma.visitor.findMany();
  if (employees.length < 3 || visitors.length < 3) {
    throw new Error('Not enough employees/visitors for reseed. Run db:seed first.');
  }
  return { employees, visitors };
}

async function createVisitWithBadge(args: {
  visiteurId: string;
  employeId: string;
  dateDebut: Date;
  dateFin?: Date | null;
  statut: VisitStatus;
  motif: string;
}) {
  const visit = await prisma.visite.create({
    data: {
      visiteurId: args.visiteurId,
      employeId: args.employeId,
      dateDebut: args.dateDebut,
      dateFin: args.dateFin ?? null,
      motif: args.motif,
      statut: args.statut,
    }
  });

  let badgeStatus: BadgeStatus = BadgeStatus.GENERATED;
  if (args.statut === VisitStatus.EN_COURS) badgeStatus = BadgeStatus.PRINTED;
  if (args.statut === VisitStatus.TERMINEE || args.statut === VisitStatus.EXPIREE) badgeStatus = BadgeStatus.CLOSED;

  await prisma.badge.create({
    data: {
      visiteId: visit.id,
      qrCode: 'QR' + Math.random().toString(36).slice(2, 11).toUpperCase(),
      status: badgeStatus,
      // Pour CLOSED et PRINTED on doit avoir une date d'impression
      dateImpression: (badgeStatus === BadgeStatus.PRINTED || badgeStatus === BadgeStatus.CLOSED)
        ? (args.dateFin ?? new Date())
        : null,
    }
  });
}

async function main() {
  logger.info('Reseeding coherent visit/badge dataset...');

  const { employees, visitors } = await ensureBaseRefs();

  // 1) Wipe all badges then visits to avoid FK issues
  await prisma.badge.deleteMany({});
  await prisma.visite.deleteMany({});

  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(9, 0, 0, 0);
  const todayMid = new Date(now); todayMid.setHours(11, 0, 0, 0);
  const todayEnd = new Date(now); todayEnd.setHours(16, 0, 0, 0);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStart = new Date(yesterday); yesterdayStart.setHours(10, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday); yesterdayEnd.setHours(12, 0, 0, 0);

  // Helper to pick refs
  const pick = <T>(arr: T[], i: number) => arr[i % arr.length];

  // 2) Create PLANIFIEE (GENERATED) - future today
  for (let i = 0; i < 5; i++) {
    await createVisitWithBadge({
      visiteurId: pick(visitors, i).id,
      employeId: pick(employees, i).id,
      dateDebut: new Date(todayEnd.getTime() + (i + 1) * 15 * 60 * 1000),
      dateFin: new Date(todayEnd.getTime() + (i + 2) * 15 * 60 * 1000),
      statut: VisitStatus.PLANIFIEE,
      motif: 'Visite planifiée'
    });
  }

  // 3) EN_COURS (PRINTED) - started today
  for (let i = 0; i < 5; i++) {
    await createVisitWithBadge({
      visiteurId: pick(visitors, i + 1).id,
      employeId: pick(employees, i + 1).id,
      dateDebut: new Date(todayStart.getTime() + i * 20 * 60 * 1000),
      dateFin: null,
      statut: VisitStatus.EN_COURS,
      motif: 'Visite en cours'
    });
  }

  // 4) TERMINEE (CLOSED) - ended today
  for (let i = 0; i < 6; i++) {
    const start = new Date(todayStart.getTime() + i * 30 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    await createVisitWithBadge({
      visiteurId: pick(visitors, i + 2).id,
      employeId: pick(employees, i + 2).id,
      dateDebut: start,
      dateFin: end,
      statut: VisitStatus.TERMINEE,
      motif: 'Visite terminée'
    });
  }

  // 5) EXPIREE (CLOSED) - ended yesterday or started yesterday without finish
  for (let i = 0; i < 4; i++) {
    const start = new Date(yesterdayStart.getTime() + i * 30 * 60 * 1000);
    const end = new Date(yesterdayEnd.getTime() + i * 30 * 60 * 1000);
    await createVisitWithBadge({
      visiteurId: pick(visitors, i + 3).id,
      employeId: pick(employees, i + 3).id,
      dateDebut: start,
      dateFin: end,
      statut: VisitStatus.EXPIREE,
      motif: 'Visite expirée'
    });
  }

  logger.info('Coherent reseed completed.');
}

main()
  .catch((e) => {
    logger.error('Reseed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


