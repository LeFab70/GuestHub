import { PrismaClient, BadgeStatus, VisitStatus } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('Starting cleanup of inconsistent data...');

  // 1) Delete badges without a linked visit (orphans)
  const orphanBadges = await prisma.badge.findMany({
    where: { visiteId: { equals: undefined as any } }
  });
  if (orphanBadges.length > 0) {
    await prisma.badge.deleteMany({ where: { id: { in: orphanBadges.map(b => b.id) } } });
    logger.info(`Deleted ${orphanBadges.length} orphan badge(s)`);
  }

  // 2) Fix duplicate badges per visit: keep the most recent, delete others
  const badgesByVisit = await prisma.badge.findMany({ orderBy: { createdAt: 'desc' } });
  const seenVisitIds = new Set<string>();
  const duplicateBadgeIds: string[] = [];
  for (const b of badgesByVisit) {
    if (!b.visiteId) continue;
    if (seenVisitIds.has(b.visiteId)) duplicateBadgeIds.push(b.id);
    else seenVisitIds.add(b.visiteId);
  }
  if (duplicateBadgeIds.length > 0) {
    await prisma.badge.deleteMany({ where: { id: { in: duplicateBadgeIds } } });
    logger.info(`Deleted ${duplicateBadgeIds.length} duplicate badge(s)`);
  }

  // 3) Delete visits missing required associations (visiteur or employe)
  const invalidVisits = await prisma.visite.findMany({
    where: { OR: [{ visiteurId: undefined as any }, { employeId: undefined as any }] }
  });
  if (invalidVisits.length > 0) {
    const invalidVisitIds = invalidVisits.map(v => v.id);
    await prisma.badge.deleteMany({ where: { visiteId: { in: invalidVisitIds } } });
    await prisma.visite.deleteMany({ where: { id: { in: invalidVisitIds } } });
    logger.info(`Deleted ${invalidVisitIds.length} invalid visit(s) (missing associations) and their badges`);
  }

  // 4) Delete planified visits without badge (inconsistent old data)
  const planifiedWithoutBadge = await prisma.visite.findMany({
    where: { statut: VisitStatus.PLANIFIEE, badge: { is: null } }
  });
  if (planifiedWithoutBadge.length > 0) {
    await prisma.visite.deleteMany({ where: { id: { in: planifiedWithoutBadge.map(v => v.id) } } });
    logger.info(`Deleted ${planifiedWithoutBadge.length} planified visit(s) without badge`);
  }

  // 5) Ensure status coherence: remove badges whose status contradicts visit terminal state (rare edge: CLOSED with EN_COURS)
  // We choose to delete badges inconsistent with terminal rules only if visit is missing (already handled) or duplicated (already handled).

  logger.info('Cleanup completed.');
}

main()
  .catch((e) => {
    logger.error('Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


