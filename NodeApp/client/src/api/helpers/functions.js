import { ls, RT_VAR } from "../../redux/redux-reducer";
import axios from "axios";

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

/**
 * Gets a new set of tokens from the API
 * @param {Function} cb function(error, tokens)
 */
export const getNewTokens = async (cb) => {
  try {
    const savedRefreshToken = await ls.get(RT_VAR);
    const newTokens = await axios.post(
      "/api/tokens",
      JSON.stringify({
        refreshToken: savedRefreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return newTokens.data;
  } catch (err) {
    handleError(err, cb);
  }
};
