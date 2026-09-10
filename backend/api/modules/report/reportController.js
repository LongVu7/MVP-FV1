const { getDashboardReportService } = require('./reportService');

const getDashboardReport = async (req, res, next) => {
  try {
    const params = req.query; // Validated by Zod
    const user = req.user;

    const data = await getDashboardReportService(user, params);

    res.json({
      message: 'Dashboard report fetched successfully',
      requestedByRole: user.role,
      requestedByAccountId: user.accountId,
      data,
      pagination: null
    });
  } catch (error) {
    if (!error.status) error.status = 500;
    next(error);
  }
};

module.exports = {
  getDashboardReport
};
