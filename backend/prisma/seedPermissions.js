/**
 * Seed script for permissions and role-permission mappings.
 * Idempotent — safe to run multiple times.
 *
 * Usage: node prisma/seedPermissions.js
 */
require('dotenv').config();
const prisma = require('../config/db');

const permissions = [
  // Inquiry
  { resource: 'inquiry', action: 'read', code: 'inquiry.read', description: 'View inquiries' },
  { resource: 'inquiry', action: 'create', code: 'inquiry.create', description: 'Create new inquiries' },
  { resource: 'inquiry', action: 'update', code: 'inquiry.update', description: 'Update inquiry details' },
  { resource: 'inquiry', action: 'delete', code: 'inquiry.delete', description: 'Delete inquiries' },
  { resource: 'inquiry', action: 'assign', code: 'inquiry.assign', description: 'Assign/reassign staff to inquiries' },

  // Account
  { resource: 'account', action: 'read', code: 'account.read', description: 'View accounts' },
  { resource: 'account', action: 'create', code: 'account.create', description: 'Create accounts' },
  { resource: 'account', action: 'update', code: 'account.update', description: 'Update accounts' },
  { resource: 'account', action: 'delete', code: 'account.delete', description: 'Delete accounts' },
  { resource: 'account', action: 'assign_role', code: 'account.assign_role', description: 'Assign roles to accounts' },

  // Student
  { resource: 'student', action: 'read', code: 'student.read', description: 'View students' },
  { resource: 'student', action: 'create', code: 'student.create', description: 'Create students' },
  { resource: 'student', action: 'update', code: 'student.update', description: 'Update students' },
  { resource: 'student', action: 'delete', code: 'student.delete', description: 'Delete students' },

  // Role
  { resource: 'role', action: 'read', code: 'role.read', description: 'View roles' },

  // Group
  { resource: 'group', action: 'read', code: 'group.read', description: 'View groups' },
  { resource: 'group', action: 'create', code: 'group.create', description: 'Create groups' },
  { resource: 'group', action: 'update', code: 'group.update', description: 'Update groups' },
  { resource: 'group', action: 'delete', code: 'group.delete', description: 'Delete groups' },

  // School
  { resource: 'school', action: 'read', code: 'school.read', description: 'View schools' },
  { resource: 'school', action: 'create', code: 'school.create', description: 'Create schools' },
  { resource: 'school', action: 'update', code: 'school.update', description: 'Update schools' },
  { resource: 'school', action: 'delete', code: 'school.delete', description: 'Delete schools' },

  // City
  { resource: 'city', action: 'read', code: 'city.read', description: 'View cities' },

  // Source Data
  { resource: 'source_data', action: 'read', code: 'source_data.read', description: 'View source data' },

  // Major Data
  { resource: 'major_data', action: 'read', code: 'major_data.read', description: 'View major data' },

  // Campaign
  { resource: 'campaign', action: 'read', code: 'campaign.read', description: 'View campaigns' },
  { resource: 'campaign', action: 'create', code: 'campaign.create', description: 'Create campaigns' },
  { resource: 'campaign', action: 'update', code: 'campaign.update', description: 'Update campaigns' },
  { resource: 'campaign', action: 'delete', code: 'campaign.delete', description: 'Delete campaigns' },

  // Error Report
  { resource: 'error_report', action: 'read', code: 'error_report.read', description: 'View error reports' },
  { resource: 'error_report', action: 'create', code: 'error_report.create', description: 'Create error reports' },
  { resource: 'error_report', action: 'update', code: 'error_report.update', description: 'Update error report status' },
];

// Role → permission codes mapping
const rolePermissions = {
  admin: permissions.map(p => p.code), // admin gets everything

  manager: [
    'inquiry.read', 'inquiry.create', 'inquiry.update', 'inquiry.delete', 'inquiry.assign',
    'student.read', 'student.create', 'student.update',
    'school.read',
    'city.read',
    'source_data.read',
    'major_data.read',
    'campaign.read', 'campaign.create', 'campaign.update', 'campaign.delete',
    'error_report.read', 'error_report.create',
    'group.read', 'group.create', 'group.update', 'group.delete',
    'account.read'
  ],

  staff: [
    'inquiry.read', 'inquiry.create', 'inquiry.update',
    'student.read', 'student.create', 'student.update',
    'school.read',
    'city.read',
    'source_data.read',
    'major_data.read',
    'error_report.read', 'error_report.create',
    'group.read', 
  ],
};

async function seed() {
  console.log('Seeding permissions...');

  // 1. Upsert all permissions
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { resource: perm.resource, action: perm.action, description: perm.description },
      create: perm,
    });
  }
  console.log(`  ✓ ${permissions.length} permissions upserted`);

  // 2. Ensure roles exist
  for (const roleName of Object.keys(rolePermissions)) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `${roleName} role` },
    });
  }
  console.log(`  ✓ ${Object.keys(rolePermissions).length} roles ensured`);

  // 3. Link permissions to roles
  for (const [roleName, codes] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });

    // Clear existing mappings for this role
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    // Fetch permission IDs
    const perms = await prisma.permission.findMany({
      where: { code: { in: codes } },
      select: { id: true },
    });

    // Create new mappings
    await prisma.rolePermission.createMany({
      data: perms.map(p => ({ roleId: role.id, permissionId: p.id })),
    });

    console.log(`  ✓ ${roleName}: ${perms.length} permissions linked`);
  }

  console.log('Seeding complete.');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
