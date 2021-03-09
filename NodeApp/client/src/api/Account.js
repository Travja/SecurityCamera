import axios from "axios";
import { RT_VAR, T_VAR, ls } from "../redux/redux-reducer";
import { getNewTokens, handleError } from "./helpers/functions";

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

    /**
     * Gets the user account from the database
     * using the stored JWT tokens
     * @param {Function} cb (err, account)
     */
    static async getAccount(cb) {
        try {
            const savedToken = await ls.get(T_VAR);
            const account = await axios.get("/api/account", {
                headers: { Authorization: `Bearer ${savedToken}` },
            });
            if (account.data.error) return cb({ error: account.data.error }, null);
            return cb(null, account.data.user);
        } catch (err) {
            try {
                const newTokens = await getNewTokens(cb);
                ls.set(T_VAR, newTokens.token);
                ls.set(RT_VAR, newTokens.refreshToken);
                try {
                    const savedToken = await ls.get(T_VAR);
                    const account = await axios.get("/account", {
                        headers: { Authorization: `Bearer ${savedToken}` },
                    });
                    if (account.data.error)
                        return cb({ error: account.data.error }, null);
                    return cb(null, account.data.user);
                } catch (err2) {
                    handleError(err2, cb);
                }
            } catch (err1) {
                handleError(err1, cb);
            }
        }
    }
}

export default AccountAPI;
