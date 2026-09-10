const reportRepository = require('./reportRepository');

async function getDashboardReportService(user, params) {
  return await reportRepository.getDashboardReport(user, params);
}

module.exports = {
  getDashboardReportService
};
