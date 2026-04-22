import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.block.deleteMany()
  await prisma.dayOff.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.admin.deleteMany()

  console.log('✅ Cleared existing data')

  // Create admins with hashed PINs
  const admins = await Promise.all([
    prisma.admin.create({
      data: {
        name: 'Mohammed Saïd',
        email: 'mohammed.said@naftal.dz',
        role: 'RH Sénior',
        pinHash: await bcrypt.hash('1234', 10), // Default PIN: 1234
      },
    }),
    prisma.admin.create({
      data: {
        name: 'Amina Belkacem',
        email: 'amina.belkacem@naftal.dz',
        role: 'RH',
        pinHash: await bcrypt.hash('5678', 10), // PIN: 5678
      },
    }),
    prisma.admin.create({
      data: {
        name: 'Karim Mansouri',
        email: 'karim.mansouri@naftal.dz',
        role: 'Admin',
        pinHash: await bcrypt.hash('9999', 10), // PIN: 9999
      },
    }),
  ])

  console.log(`✅ Created ${admins.length} admins`)

  // Create employees with realistic Algerian names
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        matricule: 'NAF-2847',
        name: 'Ahmed Benali',
        department: 'Direction Commerciale',
        position: 'Chef de Projet',
        avatar: 'AB',
        status: 'actif',
        daysTotal: 30,
      },
    }),
    prisma.employee.create({
      data: {
        matricule: 'NAF-3102',
        name: 'Fatima Zerrouki',
        department: 'Ressources Humaines',
        position: 'Responsable RH',
        avatar: 'FZ',
        status: 'actif',
        daysTotal: 30,
      },
    }),
    prisma.employee.create({
      data: {
        matricule: 'NAF-2956',
        name: 'Karim Boudiaf',
        department: 'Logistique',
        position: 'Superviseur',
        avatar: 'KB',
        status: 'risque',
        daysTotal: 30,
      },
    }),
    prisma.employee.create({
      data: {
        matricule: 'NAF-3215',
        name: 'Leila Hamidi',
        department: 'Finance',
        position: 'Contrôleur',
        avatar: 'LH',
        status: 'bloqué',
        daysTotal: 30,
      },
    }),
    prisma.employee.create({
      data: {
        matricule: 'NAF-2741',
        name: 'Rachid Meziane',
        department: 'IT',
        position: 'Développeur',
        avatar: 'RM',
        status: 'actif',
        daysTotal: 30,
      },
    }),
    prisma.employee.create({
      data: {
        matricule: 'NAF-2889',
        name: 'Amina Boucher',
        department: 'Marketing',
        position: 'Chargée de Communication',
        avatar: 'AB',
        status: 'actif',
        daysTotal: 30,
      },
    }),
    prisma.employee.create({
      data: {
        matricule: 'NAF-3044',
        name: 'Yacine Larbi',
        department: 'Production',
        position: 'Technicien',
        avatar: 'YL',
        status: 'risque',
        daysTotal: 30,
      },
    }),
    prisma.employee.create({
      data: {
        matricule: 'NAF-2978',
        name: 'Nabil Khelifi',
        department: 'Production',
        position: 'Opérateur',
        avatar: 'NK',
        status: 'bloqué',
        daysTotal: 30,
      },
    }),
    prisma.employee.create({
      data: {
        matricule: 'NAF-3156',
        name: 'Sarah Boukhari',
        department: 'Finance',
        position: 'Comptable',
        avatar: 'SB',
        status: 'actif',
        daysTotal: 30,
      },
    }),
    prisma.employee.create({
      data: {
        matricule: 'NAF-2834',
        name: 'Omar Bendjelloul',
        department: 'Direction Commerciale',
        position: 'Analyste',
        avatar: 'OB',
        status: 'actif',
        daysTotal: 30,
      },
    }),
  ])

  console.log(`✅ Created ${employees.length} employees`)

  // Create day-off records (some in current period: April 20 - May 19, 2026)
  const daysOff = await Promise.all([
    // Ahmed Benali - 12 days used
    prisma.dayOff.create({
      data: {
        employeeId: employees[0].id,
        startDate: new Date('2026-03-22'),
        endDate: new Date('2026-03-26'),
        workingDays: 5,
        calendarDays: 5,
        isSandwich: false,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[0].id,
        startDate: new Date('2026-04-23'),
        endDate: new Date('2026-04-24'),
        workingDays: 2,
        calendarDays: 2,
        isSandwich: false,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[0].id,
        startDate: new Date('2026-04-10'),
        endDate: new Date('2026-04-14'),
        workingDays: 5,
        calendarDays: 5,
        isSandwich: false,
      },
    }),

    // Fatima Zerrouki - 8 days used
    prisma.dayOff.create({
      data: {
        employeeId: employees[1].id,
        startDate: new Date('2026-03-25'),
        endDate: new Date('2026-03-27'),
        workingDays: 3,
        calendarDays: 3,
        isSandwich: false,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[1].id,
        startDate: new Date('2026-04-25'),
        endDate: new Date('2026-04-25'),
        workingDays: 1,
        calendarDays: 1,
        isSandwich: false,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[1].id,
        startDate: new Date('2026-05-05'),
        endDate: new Date('2026-05-08'),
        workingDays: 4,
        calendarDays: 4,
        isSandwich: false,
      },
    }),

    // Karim Boudiaf - 18 days used (at risk)
    prisma.dayOff.create({
      data: {
        employeeId: employees[2].id,
        startDate: new Date('2026-03-15'),
        endDate: new Date('2026-03-21'),
        workingDays: 5,
        calendarDays: 7,
        isSandwich: true, // Weekend included
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[2].id,
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-10'),
        workingDays: 8,
        calendarDays: 10,
        isSandwich: true,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[2].id,
        startDate: new Date('2026-04-28'),
        endDate: new Date('2026-05-01'),
        workingDays: 3,
        calendarDays: 4,
        isSandwich: false,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[2].id,
        startDate: new Date('2026-05-08'),
        endDate: new Date('2026-05-09'),
        workingDays: 2,
        calendarDays: 2,
        isSandwich: false,
      },
    }),

    // Leila Hamidi - 22 days used (blocked)
    prisma.dayOff.create({
      data: {
        employeeId: employees[3].id,
        startDate: new Date('2026-03-10'),
        endDate: new Date('2026-03-21'),
        workingDays: 10,
        calendarDays: 12,
        isSandwich: true,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[3].id,
        startDate: new Date('2026-03-28'),
        endDate: new Date('2026-04-04'),
        workingDays: 6,
        calendarDays: 8,
        isSandwich: true,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[3].id,
        startDate: new Date('2026-04-15'),
        endDate: new Date('2026-04-21'),
        workingDays: 5,
        calendarDays: 7,
        isSandwich: true,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[3].id,
        startDate: new Date('2026-05-12'),
        endDate: new Date('2026-05-12'),
        workingDays: 1,
        calendarDays: 1,
        isSandwich: false,
      },
    }),

    // Rachid Meziane - 6 days used
    prisma.dayOff.create({
      data: {
        employeeId: employees[4].id,
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-03'),
        workingDays: 3,
        calendarDays: 3,
        isSandwich: false,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[4].id,
        startDate: new Date('2026-04-29'),
        endDate: new Date('2026-04-30'),
        workingDays: 2,
        calendarDays: 2,
        isSandwich: false,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[4].id,
        startDate: new Date('2026-05-15'),
        endDate: new Date('2026-05-15'),
        workingDays: 1,
        calendarDays: 1,
        isSandwich: false,
      },
    }),

    // Yacine Larbi - 19 days used (at risk)
    prisma.dayOff.create({
      data: {
        employeeId: employees[6].id,
        startDate: new Date('2026-03-08'),
        endDate: new Date('2026-03-20'),
        workingDays: 11,
        calendarDays: 13,
        isSandwich: true,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[6].id,
        startDate: new Date('2026-04-07'),
        endDate: new Date('2026-04-11'),
        workingDays: 5,
        calendarDays: 5,
        isSandwich: false,
      },
    }),
    prisma.dayOff.create({
      data: {
        employeeId: employees[6].id,
        startDate: new Date('2026-05-06'),
        endDate: new Date('2026-05-08'),
        workingDays: 3,
        calendarDays: 3,
        isSandwich: false,
      },
    }),
  ])

  console.log(`✅ Created ${daysOff.length} day-off records`)

  // Create block records for blocked employees
  const blocks = await Promise.all([
    prisma.block.create({
      data: {
        employeeId: employees[3].id, // Leila Hamidi
        reason: 'Jours ouvrables insuffisants - 8 jours restants sur 30',
        daysUsed: 22,
        daysRemaining: 8,
        blockedById: admins[0].id,
        blockedAt: new Date('2026-04-15'),
        isActive: true,
      },
    }),
    prisma.block.create({
      data: {
        employeeId: employees[7].id, // Nabil Khelifi
        reason: 'Dépassement du quota - 6 jours restants',
        daysUsed: 24,
        daysRemaining: 6,
        blockedById: admins[0].id,
        blockedAt: new Date('2026-04-18'),
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${blocks.length} block records`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
