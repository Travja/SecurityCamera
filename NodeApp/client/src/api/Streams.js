import axios from "axios";
import { ls, RT_VAR, T_VAR } from "../redux/redux-reducer";
import { handleError } from "./helpers/functions";

class StreamsAPI {
  /**
   * Gets a new set of tokens from the API
   * @param {Function} cb function(error, tokens)
   */
  static async getNewTokens(cb) {
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
  }

  /**
   * Gets the streams from the api
   * @param {Function} cb (err, data)
   */
  static async getStreams(cb) {
    try {
      const savedToken = await ls.get(T_VAR);
      const streams = await axios.get("/api/streams", {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (streams.data.error) return cb({ error: streams.error }, null);
      return cb(null, streams.data);
    } catch (err) {
      try {
        const newTokens = await this.getNewTokens(cb);
        ls.set(T_VAR, newTokens.token);
        ls.set(RT_VAR, newTokens.refreshToken);
        try {
          const savedToken = await ls.get(T_VAR);
          const streams = await axios.get("/api/streams", {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (streams.data.error) return cb({ error: streams.error }, null);
          return cb(null, streams.data);
        } catch (err2) {
          return handleError(err2, cb);
        }
      } catch (err1) {
        return handleError(err1, cb);
      }
    }
  }
}

export default StreamsAPI;
