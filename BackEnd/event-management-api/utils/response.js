// utils/response.js
function sendResponse(res, statusCode, message, data = null) {
    res.status(statusCode).json({
      status: statusCode === 200 ? 'success' : 'error',
      message,
      data
    });
  }
  
  module.exports = { sendResponse };
  