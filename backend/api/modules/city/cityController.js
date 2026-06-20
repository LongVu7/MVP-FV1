const cityService = require('./cityService');

const handleError = (res, error) => {
  const status = error.status || 500;
  res.status(status).json({
    error: error.message,
    ...(status === 500 && { details: error.message })
  });
};

const getAllCities = async (req, res) => {
  try {
    const data = await cityService.getAllCities();
    res.status(200).json({
      message: 'Cities retrieved successfully',
      data
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getAllCities };
