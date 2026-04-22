import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Realistic Algerian names
const algerianNames = [
  'Ahmed Benali', 'Fatima Zerrouki', 'Karim Boudiaf', 'Leila Hamidi', 'Rachid Meziane',
  'Amina Boucher', 'Yacine Larbi', 'Nabil Khelifi', 'Sarah Boukhari', 'Omar Bendjelloul',
  'Hocine Brahim', 'Samia Kaddour', 'Mehdi Taleb', 'Nassima Ouali', 'Sofiane Hamdani',
  'Karima Belaidi', 'Fares Mansouri', 'Naima Hadj', 'Salim Cherif', 'Hafida Mokrani',
  'Abdelkader Zidane', 'Djamila Benabdallah', 'Mourad Belkacem', 'Zineb Bouarab', 'Tarek Bouras',
  'Malika Touati', 'Kamel Ghoul', 'Souad Benali', 'Redouane Ferhat', 'Wassila Amara',
  'Noureddine Kaci', 'Yamina Sahli', 'Bachir Slimani', 'Farida Benmoussa', 'Hicham Rahmani',
  'Sabrina Medjdoub', 'Mustapha Aouni', 'Houria Boumediene', 'Larbi Berkani', 'Soraya Hamdi',
  'Boualem Chergui', 'Nabila Mekki', 'Farid Derradji', 'Latifa Rezki', 'Azzedine Boukhari',
  'Khadija Saadi', 'Hamza Messaoudi', 'Selma Touil', 'Karim Brahimi', 'Zahra Benamara',
  'Mokhtar Zenati', 'Meriem Charef', 'Said Benabdellah', 'Imene Bencheikh', 'Rabah Mebarki',
  'Amel Badaoui', 'Djamel Allaoui', 'Fadila Meziane', 'Slimane Oukaci', 'Wafa Zouaoui'
]

const departments = [
  'Production',
  'Logistique',
  'Administration',
  'Maintenance',
  'Qualité',
  'Sécurité'
]

const positions = {
  Production: ['Opérateur', 'Chef d\'Équipe', 'Superviseur', 'Technicien', 'Ingénieur Production'],
  Logistique: ['Agent Logistique', 'Coordinateur', 'Responsable Transport', 'Magasinier', 'Chef de Quai'],
  Administration: ['Assistant RH', 'Comptable', 'Contrôleur de Gestion', 'Secrétaire', 'Chef de Service'],
  Maintenance: ['Technicien', 'Électricien', 'Mécanicien', 'Chef d\'Atelier', 'Ingénieur Maintenance'],
  Qualité: ['Contrôleur Qualité', 'Auditeur', 'Responsable QSE', 'Technicien Labo', 'Inspecteur'],
  Sécurité: ['Agent de Sécurité', 'Chef de Sécurité', 'Coordinateur HSE', 'Pompier', 'Responsable Sûreté']
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function generateMatricule() {
  return `NAF-${2500 + Math.floor(Math.random() * 1500)}`
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

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
        name: 'Fatima Zohra',
        email: 'fatima.zohra@naftal.dz',
        role: 'RH',
        pinHash: await bcrypt.hash('5678', 10), // PIN: 5678
      },
    }),
    prisma.admin.create({
      data: {
        name: 'Ahmed Bachir',
        email: 'ahmed.bachir@naftal.dz',
        role: 'Admin',
        pinHash: await bcrypt.hash('9999', 10), // PIN: 9999
      },
    }),
  ])

  console.log(`✅ Created ${admins.length} admins`)

  // Create 60 employees with varied status
  const employeeData = []
  const usedNames = new Set()

  for (let i = 0; i < 60; i++) {
    let name
    do {
      name = algerianNames[i % algerianNames.length]
      if (i >= algerianNames.length) {
        name = name.replace(/^(\w+)/, `$1 ${String.fromCharCode(65 + Math.floor(i / algerianNames.length))}`)
      }
    } while (usedNames.has(name))

    usedNames.add(name)

    const department = departments[i % departments.length]
    const position = getRandomElement(positions[department])

    // Status distribution: 70% actif, 20% risque, 10% bloqué
    let status
    const rand = Math.random()
    if (rand < 0.70) status = 'actif'
    else if (rand < 0.90) status = 'risque'
    else status = 'bloqué'

    employeeData.push({
      matricule: generateMatricule(),
      name,
      department,
      position,
      avatar: getInitials(name),
      status,
      daysTotal: 30,
    })
  }

  const employees = await Promise.all(
    employeeData.map(data => prisma.employee.create({ data }))
  )

  console.log(`✅ Created ${employees.length} employees`)

  // Create realistic day-off records (varied usage across employees)
  const daysOffData = []

  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i]

    // Generate random number of day-off periods (0-5 periods per employee)
    const numPeriods = Math.floor(Math.random() * 6)

    for (let j = 0; j < numPeriods; j++) {
      // Random date in past 60 days
      const daysAgo = Math.floor(Math.random() * 60)
      const startDate = new Date(2026, 2, 20) // March 20, 2026
      startDate.setDate(startDate.getDate() + daysAgo)

      // Random duration 1-7 working days
      const workingDays = Math.floor(Math.random() * 7) + 1
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + workingDays - 1)

      const calendarDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      const isSandwich = calendarDays > workingDays

      daysOffData.push({
        employeeId: employee.id,
        startDate,
        endDate,
        workingDays,
        calendarDays,
        isSandwich,
        reason: isSandwich ? 'Congé avec sandwich' : 'Congé ordinaire',
      })
    }
  }

  const daysOff = await Promise.all(
    daysOffData.map(data => prisma.dayOff.create({ data }))
  )

  console.log(`✅ Created ${daysOff.length} day-off records`)

  // Create block records for employees with status = 'bloqué'
  const blockedEmployees = employees.filter(e => e.status === 'bloqué')
  const blocks = await Promise.all(
    blockedEmployees.map(employee => {
      // Calculate days used from day-off records
      const employeeDaysOff = daysOffData.filter(d => d.employeeId === employee.id)
      const daysUsed = employeeDaysOff.reduce((sum, d) => sum + d.workingDays, 0)
      const daysRemaining = 30 - daysUsed

      return prisma.block.create({
        data: {
          employeeId: employee.id,
          reason: `Jours ouvrables insuffisants - ${daysRemaining} jours restants sur 30`,
          daysUsed,
          daysRemaining,
          blockedById: admins[0].id,
          blockedAt: new Date(2026, 3, 15 + Math.floor(Math.random() * 10)),
          isActive: true,
        },
      })
    })
  )

  console.log(`✅ Created ${blocks.length} block records`)

  // Summary
  console.log('\n📊 Seed Summary:')
  console.log(`   Admins: ${admins.length}`)
  console.log(`   Employees: ${employees.length}`)
  console.log(`   - Actifs: ${employees.filter(e => e.status === 'actif').length}`)
  console.log(`   - À risque: ${employees.filter(e => e.status === 'risque').length}`)
  console.log(`   - Bloqués: ${employees.filter(e => e.status === 'bloqué').length}`)
  console.log(`   Day-off records: ${daysOff.length}`)
  console.log(`   Active blocks: ${blocks.length}`)
  console.log('\n🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
