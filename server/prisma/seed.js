const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const departments = [
  'Production',
  'Logistique',
  'Administration',
  'Maintenance',
  'Qualité',
  'Sécurité'
]

const positionsByDepartment = {
  Production: ['Opérateur', 'Chef d\'équipe', 'Technicien process', 'Superviseur ligne'],
  Logistique: ['Agent logistique', 'Magasinier', 'Coordinateur transport', 'Chef de quai'],
  Administration: ['Assistant RH', 'Comptable', 'Contrôleur de gestion', 'Secrétaire'],
  Maintenance: ['Technicien maintenance', 'Électricien', 'Mécanicien', 'Chef d\'atelier'],
  Qualité: ['Contrôleur qualité', 'Auditeur interne', 'Technicien labo', 'Responsable QHSE'],
  Sécurité: ['Agent de sécurité', 'Coordinateur HSE', 'Chef sécurité site', 'Pompier industriel'],
}

const dayOffTypes = ['Congé annuel', 'Congé maladie', 'Congé sans solde', 'Autre']

const firstNames = [
  'Yacine', 'Samira', 'Karim', 'Nassima', 'Sofiane', 'Leila', 'Mehdi', 'Amel', 'Rachid', 'Meriem',
  'Nabil', 'Sabrina', 'Fares', 'Khadidja', 'Hocine', 'Fatima', 'Aymen', 'Imene', 'Hamza', 'Souad',
  'Redouane', 'Wafa', 'Djamel', 'Zineb', 'Mustapha', 'Selma', 'Azzedine', 'Lamia', 'Rabah', 'Houria',
]

const lastNames = [
  'Benali', 'Boudiaf', 'Touati', 'Hamdani', 'Meziane', 'Khelifi', 'Belaidi', 'Mokhtari', 'Saadi', 'Rahmani',
  'Kaci', 'Mansouri', 'Benkhelil', 'Cherif', 'Oukaci', 'Bendjelloul', 'Boukhari', 'Ferhat', 'Slimani', 'Amara',
  'Mebarki', 'Haddad', 'Benkaddour', 'Zenati', 'Brahimi', 'Larbi', 'Taleb', 'Ghouli', 'Sahli', 'Rezki',
]

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function normalizeForEmail(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
}

function randomHireDate() {
  const start = new Date(2015, 0, 1).getTime()
  const end = new Date(2022, 11, 31).getTime()
  return new Date(randomInt(start, end))
}

function randomPhone() {
  return `+213 ${randomInt(50, 79)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`
}

function randomSSN() {
  // Algerian NSS format: YY MM WW DDD NNN KK (15 digits)
  const year = randomInt(60, 99)
  const month = String(randomInt(1, 12)).padStart(2, '0')
  const wilaya = String(randomInt(1, 58)).padStart(2, '0')
  const day = String(randomInt(1, 999)).padStart(3, '0')
  const seq = String(randomInt(1, 999)).padStart(3, '0')
  const key = String(randomInt(10, 99))
  return `${year}${month}${wilaya}${day}${seq}${key}`
}

function getCurrentWorkPeriodForSeed() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const start = new Date(year, month - 1, 20)
  const end = new Date(year, month, 19)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function buildNonOverlappingRanges(periodStart, periodEnd, wantedCount) {
  const ranges = []
  const occupied = new Set()
  const dayMs = 24 * 60 * 60 * 1000
  const totalDays = Math.floor((periodEnd - periodStart) / dayMs) + 1
  let attempts = 0

  while (ranges.length < wantedCount && attempts < 1200) {
    attempts += 1
    const duration = randomInt(1, 2)
    const startOffset = randomInt(0, Math.max(0, totalDays - duration))
    const indexes = []

    for (let i = 0; i < duration; i += 1) {
      indexes.push(startOffset + i)
    }

    const conflict = indexes.some((idx) => occupied.has(idx))
    if (conflict) continue

    indexes.forEach((idx) => occupied.add(idx))
    const startDate = new Date(periodStart)
    startDate.setDate(periodStart.getDate() + startOffset)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + duration - 1)
    ranges.push({ startDate, endDate })
  }

  // Fallback to guarantee at least wantedCount single-day ranges when possible.
  if (ranges.length < wantedCount) {
    for (let idx = 0; idx < totalDays && ranges.length < wantedCount; idx += 1) {
      if (occupied.has(idx)) continue
      occupied.add(idx)
      const date = new Date(periodStart)
      date.setDate(periodStart.getDate() + idx)
      ranges.push({ startDate: date, endDate: new Date(date) })
    }
  }

  return ranges.slice(0, wantedCount)
}

async function main() {
  console.log('🌱 Seeding PostgreSQL data...')

  // Clear existing data (respect FK order)
  await prisma.block.deleteMany()
  await prisma.dayOff.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.admin.deleteMany()

  console.log('✅ Existing data cleared')

  // 1) Create required admins with hashed PINs.
  const admins = await Promise.all([
    prisma.admin.create({
      data: {
        name: 'Mohammed Saïd',
        role: 'Directeur RH',
        pinHash: await bcrypt.hash('1234', 10),
      },
    }),
    prisma.admin.create({
      data: {
        name: 'Fatima Zohra',
        role: 'RH Sénior',
        pinHash: await bcrypt.hash('5678', 10),
      },
    }),
    prisma.admin.create({
      data: {
        name: 'Ahmed Bachir',
        role: 'RH Junior',
        pinHash: await bcrypt.hash('9999', 10),
      },
    }),
  ])

  console.log(`✅ ${admins.length} admins created`)

  // 2) Create 60 employees (10 per department), all active.
  const createdEmployees = []
  const usedEmails = new Set()
  let globalIndex = 0

  for (const department of departments) {
    for (let localIdx = 0; localIdx < 10; localIdx += 1) {
      const firstName = firstNames[globalIndex % firstNames.length]
      const baseLastIndex = (globalIndex * 3) % lastNames.length
      let lastName = lastNames[baseLastIndex]
      let email = `${normalizeForEmail(firstName)}.${normalizeForEmail(lastName)}@naftal.dz`
      let attempt = 1

      while (usedEmails.has(email) && attempt < lastNames.length) {
        lastName = lastNames[(baseLastIndex + attempt) % lastNames.length]
        email = `${normalizeForEmail(firstName)}.${normalizeForEmail(lastName)}@naftal.dz`
        attempt += 1
      }

      usedEmails.add(email)
      const matricule = `NAF-${String(1001 + globalIndex).padStart(4, '0')}`
      const position = randomFrom(positionsByDepartment[department])
      const status = 'actif'

      const employee = await prisma.employee.create({
        data: {
          matricule,
          firstName,
          lastName,
          email,
          phone: randomPhone(),
          ssn: randomSSN(),
          department,
          position,
          status,
          hireDate: randomHireDate(),
        },
      })

      createdEmployees.push(employee)
      globalIndex += 1
    }
  }

  console.log(`✅ ${createdEmployees.length} employees created`)

  // 3) NO day-off records for testing
  const allDayOffRecords = []
  console.log(`✅ ${allDayOffRecords.length} day-off records created (none for testing)`)

  // 4) NO blocks for testing
  const blocks = []
  console.log(`✅ ${blocks.length} active block records created (none for testing)`)

  console.log('\n📊 Seed summary')
  console.log(`- Admins: ${admins.length}`)
  console.log(`- Employees: ${createdEmployees.length}`)
  console.log(`- DayOff records: ${allDayOffRecords.length}`)
  console.log(`- Blocks (active): ${blocks.length}`)
  console.log('\n🎉 Seed completed successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
