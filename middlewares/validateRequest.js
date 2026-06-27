const { validationResult } = require("express-validator");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(", ");
    return next(appError.create(message, 400, httpStatusText.FAIL));
  }
  next();
};
