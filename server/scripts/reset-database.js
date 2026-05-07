const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
    try {
        console.log('🔄 Resetting database...\n');

        // Delete all blocks first (has foreign keys)
        const deletedBlocks = await prisma.block.deleteMany({});
        console.log(`✓ Deleted ${deletedBlocks.count} blocks`);

        // Delete all day-offs
        const deletedDaysOff = await prisma.dayOff.deleteMany({});
        console.log(`✓ Deleted ${deletedDaysOff.count} day-off records`);

        // Delete all employees
        const deletedEmployees = await prisma.employee.deleteMany({});
        console.log(`✓ Deleted ${deletedEmployees.count} employees`);

        console.log('\n✨ Database cleaned!\n');

        // Create fresh employees with clean records
        console.log('👥 Creating fresh employee data...\n');

        const employees = [
            { firstName: 'Ahmed', lastName: 'Benali', department: 'Production', position: 'Technicien de production', email: 'ahmed.benali@naftal.dz' },
            { firstName: 'Fatima', lastName: 'Kaddour', department: 'Logistique', position: 'Responsable logistique', email: 'fatima.kaddour@naftal.dz' },
            { firstName: 'Karim', lastName: 'Bouzid', department: 'Maintenance', position: 'Ingénieur maintenance', email: 'karim.bouzid@naftal.dz' },
            { firstName: 'Samira', lastName: 'Hamdani', department: 'Administration', position: 'Assistante administrative', email: 'samira.hamdani@naftal.dz' },
            { firstName: 'Yacine', lastName: 'Meziane', department: 'Production', position: 'Chef d\'équipe', email: 'yacine.meziane@naftal.dz' },
            { firstName: 'Nadia', lastName: 'Cherif', department: 'Qualité', position: 'Contrôleur qualité', email: 'nadia.cherif@naftal.dz' },
            { firstName: 'Rachid', lastName: 'Boudiaf', department: 'Sécurité', position: 'Agent de sécurité', email: 'rachid.boudiaf@naftal.dz' },
            { firstName: 'Leila', lastName: 'Amara', department: 'Administration', position: 'Responsable RH', email: 'leila.amara@naftal.dz' },
            { firstName: 'Sofiane', lastName: 'Belaidi', department: 'Maintenance', position: 'Technicien électrique', email: 'sofiane.belaidi@naftal.dz' },
            { firstName: 'Amina', lastName: 'Rahmani', department: 'Logistique', position: 'Agent logistique', email: 'amina.rahmani@naftal.dz' },
            { firstName: 'Mohamed', lastName: 'Larbi', department: 'Production', position: 'Opérateur production', email: 'mohamed.larbi@naftal.dz' },
            { firstName: 'Houria', lastName: 'Ghouli', department: 'Qualité', position: 'Responsable qualité', email: 'houria.ghouli@naftal.dz' },
            { firstName: 'Mehdi', lastName: 'Slimani', department: 'Sécurité', position: 'Chef de sécurité', email: 'mehdi.slimani@naftal.dz' },
            { firstName: 'Djamila', lastName: 'Benkhelil', department: 'Administration', position: 'Comptable', email: 'djamila.benkhelil@naftal.dz' },
            { firstName: 'Hicham', lastName: 'Mokhtari', department: 'Maintenance', position: 'Chef maintenance', email: 'hicham.mokhtari@naftal.dz' },
            { firstName: 'Nassima', lastName: 'Boukhari', department: 'Production', position: 'Superviseur production', email: 'nassima.boukhari@naftal.dz' },
            { firstName: 'Bilal', lastName: 'Brahimi', department: 'Logistique', position: 'Chauffeur', email: 'bilal.brahimi@naftal.dz' },
            { firstName: 'Karima', lastName: 'Sahli', department: 'Qualité', position: 'Technicien qualité', email: 'karima.sahli@naftal.dz' },
            { firstName: 'Tarek', lastName: 'Benkaddour', department: 'Sécurité', position: 'Agent de sécurité', email: 'tarek.benkaddour@naftal.dz' },
            { firstName: 'Malika', lastName: 'Kaci', department: 'Administration', position: 'Secrétaire', email: 'malika.kaci@naftal.dz' },
        ];

        let matriculeCounter = 10001;

        for (const emp of employees) {
            const employee = await prisma.employee.create({
                data: {
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    matricule: `${matriculeCounter}U`,
                    email: emp.email,
                    department: emp.department,
                    position: emp.position,
                    status: 'actif',
                    hireDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), 1),
                    phone: `0${5 + Math.floor(Math.random() * 4)}${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
                    ssn: `${Math.floor(Math.random() * 100000000000000).toString().padStart(15, '0')}`,
                },
            });

            console.log(`  ✓ Created: ${employee.firstName} ${employee.lastName} (${employee.matricule})`);
            matriculeCounter++;
        }

        console.log(`\n✅ Created ${employees.length} employees with clean records`);
        console.log('📊 All employees: 0 days off, status "actif", no blocks\n');

        // Show admin count
        const adminCount = await prisma.admin.count();
        console.log(`👮 Admins preserved: ${adminCount}`);

        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

resetDatabase();
