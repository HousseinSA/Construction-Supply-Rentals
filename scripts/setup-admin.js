const { MongoClient } = require('mongodb')
const fs = require('fs')

function loadEnv() {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  const lines = envContent.split('\n')
  for (const line of lines) {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim()
    }
  }
}

async function setupAdmin() {
  loadEnv()
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('construction_rental')
    const users = db.collection('users')
    
    // Clear all existing users
    await users.deleteMany({})
    console.log('✓ Cleared all existing users')
    
    // Create admin user
    const adminUser = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gmail.com',
      phone: '22345678',
      password: '12345678',
      role: 'admin',
      userType: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await users.insertOne(adminUser)
    console.log('✓ Created admin user')
    console.log('  Email: admin@gmail.com')
    console.log('  Phone: 22345678')
    console.log('  Password: 12345678')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

setupAdmin()
