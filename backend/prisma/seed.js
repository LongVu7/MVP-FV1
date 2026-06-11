require('dotenv').config();
const prisma = require('../config/db.js');
const bcrypt = require('bcrypt');

async function main() {
  console.log('Starting database seed...');

  // 1. Ensure Admin role exists
  let adminRole = await prisma.role.findUnique({
    where: { name: 'admin' }
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        description: 'test',
      }
    });
    console.log(`Created Admin role with ID: ${adminRole.id}`);
  } else {
    console.log(`Admin role already exists with ID: ${adminRole.id}`);
  }

  // 2. Create the initial admin account
  const adminEmail = 'crm@admin.com';
  const adminPassword = '123123';
  
  let adminAccount = await prisma.account.findFirst({
    where: { email: adminEmail }
  });

  if (!adminAccount) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    adminAccount = await prisma.account.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        fullName: 'System Administrator',
        roleId: adminRole.id,
        isActive: true,
      }
    });
    console.log(`Created admin account: ${adminAccount.email}`);
    console.log(`Default password: ${adminPassword}`);
    console.log(`Please change this password after your first login.`);
  } else {
    console.log(`Admin account with email ${adminEmail} already exists.`);
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
