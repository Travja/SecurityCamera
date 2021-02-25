/**
 * Correctly handles any errors that need to have a callback involved
 * @param {Object} err error
 * @param {Function} cb callback function
 */
export const handleError = (err, cb) => {
  if (
    err.response &&
    (err.response.status === 401 || err.response.status === 403)
  ) {
    window.location.href = "/";
  } else {
    cb({ error: err.response ? err.response.data.error : err.message }, null);
  }
};
