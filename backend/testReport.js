require('dotenv').config();
const { getDashboardReportService } = require('./api/modules/report/reportService');
const prisma = require('./config/db');

async function test() {
  try {
    const user = { accountId: 1, role: 'Admin' }; // Mock user
    const params = {
      fromDate: '2026-09-01',
      toDate: '2026-09-30'
    };
    
    // We also need to mock role permissions for buildReportScope if it reads from DB
    // Actually buildReportScope checks db for account, let's just use the first account in db
    const account = await prisma.account.findFirst();
    if (!account) {
      console.log('No account found');
      return;
    }
    const realUser = { accountId: account.id };

    console.log('Testing Dashboard Report Aggregation...');
    const data = await getDashboardReportService(realUser, params);
    console.log(JSON.stringify(data, null, 2));
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
