/**
 * Quick script to create a test admin
 * Usage: node create-test-admin.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestAdmin() {
  try {
    // Create admin with PIN 1234
    const admin = await prisma.admin.create({
      data: {
        name: 'Test Admin',
        role: 'Admin Test',
        pinHash: await bcrypt.hash('1234', 10),
      },
    })

    console.log('✅ Test admin created successfully!')
    console.log('📋 Details:')
    console.log(`   Name: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   PIN: 1234`)
    console.log(`   ID: ${admin.id}`)
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createTestAdmin()
