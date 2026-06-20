/**
 * Extract pagination parameters from query string.
 * Defaults to page 1 and limit 10 if not provided or invalid.
 *
 * @param {object} query - Express req.query object
 * @returns {{ page: number, limit: number }}
 */
function getPaginationParams(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!page || page < 1) page = 1;
  if (!limit || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  return { page, limit };
}

/**
 * Build a standard paginated response object.
 *
 * @param {Array} data - The array of records for the current page
 * @param {number} total - Total number of matching records
 * @param {number} page - Current page number
 * @param {number} limit - Records per page
 * @returns {{ data: Array, total: number, page: number, limit: number }}
 */
function buildPaginationResponse(data, total, page, limit) {
  return { data, total, page, limit };
}

module.exports = {
  getPaginationParams,
  buildPaginationResponse,
};
