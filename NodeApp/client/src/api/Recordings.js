import axios from "axios";
import { ls, RT_VAR, T_VAR } from "../redux/redux-reducer";
import { handleError, getNewTokens } from "./helpers/functions";

class RecordingAPI {
  /**
   * Gets the recordings from the api
   * @param {Function} cb (err, data)
   */
  static async getRecordings(cb) {
    try {
      const savedToken = await ls.get(T_VAR);
      const recordings = await axios.get("/api/recordings", {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (recordings.data.error)
        return cb({ error: recordings.data.error }, null);
      return cb(null, recordings.data);
    } catch (err) {
      try {
        const newTokens = await getNewTokens(cb);
        ls.set(T_VAR, newTokens.token);
        ls.set(RT_VAR, newTokens.refreshToken);
        try {
          const savedToken = await ls.get(T_VAR);
          const recordings = await axios.get("/api/recordings", {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (recordings.data.error)
            return cb({ error: recordings.data.error }, null);
          return cb(null, recordings.data);
        } catch (err2) {
          return handleError(err2, cb);
        }
      } catch (err1) {
        return handleError(err1, cb);
      }
    }
  }
}

export default RecordingAPI;
