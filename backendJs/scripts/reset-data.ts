import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetData() {
  try {
    console.log('🗑️  Suppression des données de test...');
    
    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
    await prisma.visite.deleteMany({});
    console.log('✅ Visites supprimées');
    
    await prisma.badge.deleteMany({});
    console.log('✅ Badges supprimés');
    
    await prisma.visitor.deleteMany({});
    console.log('✅ Visiteurs supprimés');
    
    await prisma.employee.deleteMany({});
    console.log('✅ Employés supprimés');
    
    await prisma.department.deleteMany({});
    console.log('✅ Départements supprimés');
    
    await prisma.user.deleteMany({});
    console.log('✅ Utilisateurs supprimés');
    
    console.log('🎉 Toutes les données de test ont été supprimées !');
    console.log('📝 L\'application est maintenant prête pour l\'initialisation');
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetData();
