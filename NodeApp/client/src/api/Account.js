import axios from "axios";
import { RT_VAR, T_VAR, ls } from "../redux/redux-reducer";

class AccountAPI {
  /**
   * Logs into the app.
   * @param {Object} payload  {email: String, password: String}
   * @param {Function} cb (err)
   */
  static async login(payload, cb) {
    try {
      const login = await axios.post("/api/login", JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
      if (login.data.error) cb({ error: login.data.error });
      else {
        ls.set(T_VAR, login.data.token);
        ls.set(RT_VAR, login.data.refreshToken);
        cb(null);
      }
    } catch (err) {
      cb({ error: err.response ? err.response.data.error : err.message });
    }
  }
}

export default AccountAPI;
