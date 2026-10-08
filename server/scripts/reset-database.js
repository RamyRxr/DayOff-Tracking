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
            { firstName: 'Lucas', lastName: 'Martin', department: 'Production', position: 'Technicien de production', email: 'lucas.martin@daystrack.eu' },
            { firstName: 'Emma', lastName: 'Dubois', department: 'Logistique', position: 'Responsable logistique', email: 'emma.dubois@daystrack.eu' },
            { firstName: 'Noah', lastName: 'Bernard', department: 'Maintenance', position: 'Ingénieur maintenance', email: 'noah.bernard@daystrack.eu' },
            { firstName: 'Olivia', lastName: 'Thomas', department: 'Administration', position: 'Assistante administrative', email: 'olivia.thomas@daystrack.eu' },
            { firstName: 'Liam', lastName: 'Robert', department: 'Production', position: "Chef d'équipe", email: 'liam.robert@daystrack.eu' },
            { firstName: 'Ava', lastName: 'Richard', department: 'Qualité', position: 'Contrôleur qualité', email: 'ava.richard@daystrack.eu' },
            { firstName: 'Ethan', lastName: 'Petit', department: 'Sécurité', position: 'Agent de sécurité', email: 'ethan.petit@daystrack.eu' },
            { firstName: 'Mia', lastName: 'Durand', department: 'Administration', position: 'Responsable RH', email: 'mia.durand@daystrack.eu' },
            { firstName: 'Elias', lastName: 'Leroy', department: 'Maintenance', position: 'Technicien électrique', email: 'elias.leroy@daystrack.eu' },
            { firstName: 'Sofia', lastName: 'Moreau', department: 'Logistique', position: 'Agent logistique', email: 'sofia.moreau@daystrack.eu' },
            { firstName: 'Paul', lastName: 'Simon', department: 'Production', position: 'Opérateur production', email: 'paul.simon@daystrack.eu' },
            { firstName: 'Chloé', lastName: 'Laurent', department: 'Qualité', position: 'Responsable qualité', email: 'chloe.laurent@daystrack.eu' },
            { firstName: 'Louis', lastName: 'Lefebvre', department: 'Sécurité', position: 'Chef de sécurité', email: 'louis.lefebvre@daystrack.eu' },
            { firstName: 'Léa', lastName: 'Michel', department: 'Administration', position: 'Comptable', email: 'lea.michel@daystrack.eu' },
            { firstName: 'Hugo', lastName: 'Garcia', department: 'Maintenance', position: 'Chef maintenance', email: 'hugo.garcia@daystrack.eu' },
            { firstName: 'Camille', lastName: 'David', department: 'Production', position: 'Superviseur production', email: 'camille.david@daystrack.eu' },
            { firstName: 'Nathan', lastName: 'Bertrand', department: 'Logistique', position: 'Chauffeur', email: 'nathan.bertrand@daystrack.eu' },
            { firstName: 'Manon', lastName: 'Roux', department: 'Qualité', position: 'Technicien qualité', email: 'manon.roux@daystrack.eu' },
            { firstName: 'Théo', lastName: 'Vincent', department: 'Sécurité', position: 'Agent de sécurité', email: 'theo.vincent@daystrack.eu' },
            { firstName: 'Inès', lastName: 'Fournier', department: 'Administration', position: 'Secrétaire', email: 'ines.fournier@daystrack.eu' },
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
                    phone: `+33 ${6 + Math.floor(Math.random() * 2)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
                    ssn: `${Math.floor(Math.random() * 2) + 1}${Math.floor(Math.random() * 90 + 10)}${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 95) + 1).padStart(2, '0')}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 90 + 10)}`,
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
