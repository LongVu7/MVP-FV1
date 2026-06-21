require('dotenv').config();
const prisma = require('../config/db.js');

async function main() {
  console.log('Starting SourceData seed...');

  // Helper to create or find a source data node
  async function upsertSourceNode(name, level, parentId = null, sortOrder = 0) {
    let node = await prisma.sourceData.findFirst({
      where: { name, parentId }
    });

    if (!node) {
      node = await prisma.sourceData.create({
        data: {
          name,
          level,
          parentId,
          sortOrder
        }
      });
      console.log(`Created [${level}] node: ${name}`);
    } else {
      console.log(`Node already exists: ${name}`);
    }
    return node;
  }

  try {
    // 1. Root Level (source)
    const online = await upsertSourceNode('Online', 'source', null, 1);
    const offline = await upsertSourceNode('Offline', 'source', null, 2);

    // 2. Children of Online (sourceDetail)
    const google = await upsertSourceNode('Google', 'sourceDetail', online.id, 1);
    const facebook = await upsertSourceNode('Facebook', 'sourceDetail', online.id, 2);
    const tiktok = await upsertSourceNode('TikTok', 'sourceDetail', online.id, 3);
    const website = await upsertSourceNode('Website', 'sourceDetail', online.id, 4);

    // 3. Children of Google (approachMethod)
    await upsertSourceNode('Search Brand FPT', 'approachMethod', google.id, 1);
    await upsertSourceNode('Search Xet Tuyen', 'approachMethod', google.id, 2);
    await upsertSourceNode('Search Hoc Ba', 'approachMethod', google.id, 3);

    // 4. Children of Facebook (approachMethod)
    await upsertSourceNode('Fanpage', 'approachMethod', facebook.id, 1);
    await upsertSourceNode('Advertisement', 'approachMethod', facebook.id, 2);

    console.log('SourceData seeding completed successfully.');
  } catch (error) {
    console.error('Error during SourceData seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Fatal error seeding the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
