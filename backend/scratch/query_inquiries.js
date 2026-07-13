require('dotenv').config();
const prisma = require('../config/db');

async function testUpdate(sourceDataIdVal) {
  try {
    const id = 5;
    const updateData = { sourceDataId: sourceDataIdVal };
    const { sourceDataId, assignedToId, ...rest } = updateData;

    const data = {
      ...rest,
      updatedAt: new Date()
    };

    if (sourceDataId !== undefined) {
      data.sourceData = sourceDataId
        ? { connect: { id: parseInt(sourceDataId, 10) } }
        : { disconnect: true };
    }

    console.log('Sending Prisma Update Data:', JSON.stringify(data, null, 2));

    const result = await prisma.inquiry.update({
      where: { id: parseInt(id, 10) },
      data,
      include: {
        sourceData: true
      }
    });

    console.log('Update Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Update Error:', error);
  }
}

async function main() {
  // Test 1: Update sourceDataId to 13 (Online)
  console.log('--- Test 1: Set to 13 ---');
  await testUpdate(13);

  // Test 2: Set sourceDataId to null
  console.log('--- Test 2: Set to null ---');
  await testUpdate(null);

  await prisma.$disconnect();
}

main();
