module.exports = (query) => {
  const limit = +query.limit || 20;
  const page = +query.page || 1;
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};
