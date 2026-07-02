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
    // Sort Order Online
    const google = await upsertSourceNode('Google', 'sourceDetail', online.id, 1);
    const facebook = await upsertSourceNode('Facebook', 'sourceDetail', online.id, 2);
    const tiktok = await upsertSourceNode('TikTok', 'sourceDetail', online.id, 3);
    const website = await upsertSourceNode('Website', 'sourceDetail', online.id, 4);
    const coccoc = await upsertSourceNode('Coccoc', 'sourceDetail', online.id, 5);
    const email = await upsertSourceNode('Email', 'sourceDetail', online.id, 6);
    const zalo = await upsertSourceNode('Zalo', 'sourceDetail', online.id, 7);
    const tawkto = await upsertSourceNode('Tawk.to', 'sourceDetail', online.id, 8);
    const fanpage = await upsertSourceNode('Fanpage', 'sourceDetail', online.id, 9);
    const othersOnline = await upsertSourceNode('Others', 'sourceDetail', online.id, 10);

    // Sort Order Offline
    const friendAndRelative = await upsertSourceNode('Friend & Relative', 'sourceDetail', offline.id, 1);
    const roadshowTP = await upsertSourceNode('Roadshow TP', 'sourceDetail', offline.id, 2);
    const roadshowProvince = await upsertSourceNode('Roadshow Tỉnh', 'sourceDetail', offline.id, 3);
    const database = await upsertSourceNode('Database', 'sourceDetail', offline.id, 4);
    const holland = await upsertSourceNode('Holland', 'sourceDetail', offline.id, 5);
    const othersOffline = await upsertSourceNode('Others', 'sourceDetail', offline.id, 6);


    // 4. Children of Google (approachMethod)
    await upsertSourceNode('search brand_fpt', 'approachMethod', google.id, 1);
    await upsertSourceNode('search brand_greenwich', 'approachMethod', google.id, 2);
    await upsertSourceNode('search mh2_cpa', 'approachMethod', google.id, 3);
    await upsertSourceNode('search sitelink_extension', 'approachMethod', google.id, 4);
    await upsertSourceNode('search xet_hoc_ba', 'approachMethod', google.id, 5);
    await upsertSourceNode('search xet_tuyen', 'approachMethod', google.id, 6);
    await upsertSourceNode('none', 'approachMethod', google.id, 7);


    // 4. Children of Facebook (approachMethod)
    await upsertSourceNode('CTW', 'approachMethod', facebook.id, 1);
    await upsertSourceNode('lead', 'approachMethod', facebook.id, 2);
    //Tiktok
    await upsertSourceNode('CPC', 'approachMethod', tiktok.id, 1);
    await upsertSourceNode('lead', 'approachMethod', tiktok.id, 2);
    //Website
    await upsertSourceNode('banner', 'approachMethod', website.id, 1);
    await upsertSourceNode('CTA course_cntt', 'approachMethod', website.id, 2);
    await upsertSourceNode('CTA coure_dkqt', 'approachMethod', website.id, 3);
    await upsertSourceNode('CTA floating_button', 'approachMethod', website.id, 4);
    await upsertSourceNode('CTA thong_bao_tuyen_sinh', 'approachMethod', website.id, 5);
    await upsertSourceNode('menu trac_nghiem_nghe_nghiep', 'approachMethod', website.id, 6);
    await upsertSourceNode('none', 'approachMethod', website.id, 7);
    //Coccoc
    await upsertSourceNode('CPC', 'approachMethod', coccoc.id, 1);
    //Email
    await upsertSourceNode('newsletter', 'approachMethod', email.id, 1);
    //Zalo
    await upsertSourceNode('menu tuyen_sinh', 'approachMethod', zalo.id, 1);
    await upsertSourceNode('zns', 'approachMethod', zalo.id, 2);
    await upsertSourceNode('zalo', 'approachMethod', zalo.id, 3);
    await upsertSourceNode('none', 'approachMethod', zalo.id, 4);

    //Offline
    await upsertSourceNode('Đối tác/ Thầy cô', 'approachMethod', friendAndRelative.id, 1);
    await upsertSourceNode('Khách hàng NE/ NB/ PH', 'approachMethod', friendAndRelative.id, 2);
    await upsertSourceNode('Nội bộ CTV/ CBNV', 'approachMethod', friendAndRelative.id, 3);
    await upsertSourceNode('other', 'approachMethod', friendAndRelative.id, 4);


    await upsertSourceNode('Tư vấn tại lớp', 'approachMethod', roadshowTP.id, 1);
    await upsertSourceNode('Tư vấn dưới cờ', 'approachMethod', roadshowTP.id, 2);
    await upsertSourceNode('Kỹ năng mềm/ Chuyên đề', 'approachMethod', roadshowTP.id, 3);
    await upsertSourceNode('Gửi tài liệu', 'approachMethod', roadshowTP.id, 4);
    await upsertSourceNode('Trao học bổng', 'approachMethod', roadshowTP.id, 5);
    await upsertSourceNode('Đặt bàn tư vấn', 'approachMethod', roadshowTP.id, 6);
    await upsertSourceNode('Ngày hội do trường THPT tổ chức', 'approachMethod', roadshowTP.id, 7);
    await upsertSourceNode('Triển lãm tư vấn', 'approachMethod', roadshowTP.id, 8);
    await upsertSourceNode('Báo Giáo Dục', 'approachMethod', roadshowTP.id, 9);
    await upsertSourceNode('Báo Văn Hóa Việt', 'approachMethod', roadshowTP.id, 10);
    await upsertSourceNode('Báo Thế Giới Trẻ', 'approachMethod', roadshowTP.id, 11);
    await upsertSourceNode('Báo Huỳnh Anh Bình', 'approachMethod', roadshowTP.id, 12);
    await upsertSourceNode('Báo Tuổi Trẻ - Bách Khoa', 'approachMethod', roadshowTP.id, 13);
    await upsertSourceNode('Báo Thanh Niên', 'approachMethod', roadshowTP.id, 14);
    await upsertSourceNode('Livestream', 'approachMethod', roadshowTP.id, 15);
    await upsertSourceNode('Open day', 'approachMethod', roadshowTP.id, 16);
    await upsertSourceNode('Coffee Talk', 'approachMethod', roadshowTP.id, 17);


    await upsertSourceNode('Tư vấn tại lớp', 'approachMethod', roadshowProvince.id, 1);
    await upsertSourceNode('Tư vấn dưới cờ', 'approachMethod', roadshowProvince.id, 2);
    await upsertSourceNode('Kỹ năng mềm/ Chuyên đề', 'approachMethod', roadshowProvince.id, 3);
    await upsertSourceNode('Gửi tài liệu', 'approachMethod', roadshowProvince.id, 4);
    await upsertSourceNode('Trao học bổng', 'approachMethod', roadshowProvince.id, 5);
    await upsertSourceNode('Đặt bàn tư vấn', 'approachMethod', roadshowProvince.id, 6);
    await upsertSourceNode('Ngày hội do trường THPT tổ chức', 'approachMethod', roadshowProvince.id, 7);
    await upsertSourceNode('Triển lãm tư vấn', 'approachMethod', roadshowProvince.id, 9);
    await upsertSourceNode('Báo Giáo Dục', 'approachMethod', roadshowProvince.id, 10);
    await upsertSourceNode('Báo Văn Hóa Việt', 'approachMethod', roadshowProvince.id, 11);
    await upsertSourceNode('Báo Thế Giới Trẻ', 'approachMethod', roadshowProvince.id, 12);
    await upsertSourceNode('Báo Huỳnh Anh Bình', 'approachMethod', roadshowProvince.id, 13);
    await upsertSourceNode('Báo Tuổi Trẻ - Bách Khoa', 'approachMethod', roadshowProvince.id, 14);
    await upsertSourceNode('Báo Thanh Niên', 'approachMethod', roadshowProvince.id, 15);
    await upsertSourceNode('Livestream', 'approachMethod', roadshowProvince.id, 16);
    await upsertSourceNode('Open day', 'approachMethod', roadshowProvince.id, 17);
    await upsertSourceNode('Coffee Talk', 'approachMethod', roadshowProvince.id, 18);


    await upsertSourceNode('Database TP', 'approachMethod', database.id, 1);
    await upsertSourceNode('Database Tỉnh', 'approachMethod', database.id, 2);

    await upsertSourceNode('Holland TP', 'approachMethod', holland.id, 1);
    await upsertSourceNode('Holland Tỉnh', 'approachMethod', holland.id, 2);


    await upsertSourceNode('other', 'approachMethod', othersOffline.id, 1);

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
