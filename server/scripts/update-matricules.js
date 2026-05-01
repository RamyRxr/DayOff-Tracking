const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateMatricules() {
  try {
    console.log('Updating matricules to new format (XXXXXU)...\n');

    // Get all employees
    const employees = await prisma.employee.findMany({
      select: { id: true, matricule: true, firstName: true, lastName: true }
    });

    console.log(`Found ${employees.length} employees to update\n`);

    // Update each employee's matricule
    for (const emp of employees) {
      // Extract the number from NAF-XXXX format
      const oldNumber = emp.matricule.replace('NAF-', '');

      // Generate new format: pad to 5 digits and add U
      const newMatricule = oldNumber.padStart(5, '0') + 'U';

      await prisma.employee.update({
        where: { id: emp.id },
        data: { matricule: newMatricule }
      });

      console.log(`  ${emp.matricule} -> ${newMatricule}  (${emp.firstName} ${emp.lastName})`);
    }

    console.log('\n✓ All matricules updated successfully');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateMatricules();
