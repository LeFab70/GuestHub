import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAuditLogs() {
  try {
    console.log('🔍 Vérification des logs d\'audit...');
    
    const logs = await prisma.auditLog.findMany({
      orderBy: { dateHeure: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    console.log(`📊 Nombre total de logs: ${logs.length}`);
    
    if (logs.length > 0) {
      console.log('\n📋 Derniers logs d\'audit:');
      logs.forEach((log, index) => {
        console.log(`${index + 1}. [${log.dateHeure.toISOString()}] ${log.action} - ${log.entityType}`);
        console.log(`   Utilisateur: ${log.user?.email || 'N/A'}`);
        console.log(`   Détails: ${log.details || 'N/A'}`);
        console.log('---');
      });
    } else {
      console.log('❌ Aucun log d\'audit trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des logs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAuditLogs();
