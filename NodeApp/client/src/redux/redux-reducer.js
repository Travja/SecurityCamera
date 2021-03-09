import { Redux } from "./redux-types";
import SecureLS from "secure-ls";

/**
 * Encoded local storage.
 * ** Refrain from using `localstorage.<function>()` for anything **
 *
 * Import this variable and use it as in `ls.<function>()`
 */
export const ls = new SecureLS({ encodingType: "aes" });

export const T_VAR = "@token";
export const RT_VAR = "@refreshToken";

const initial_state = {
    token: ls.get(T_VAR),
    refresh_token: ls.get(RT_VAR),
};

/**
 * Redux Reducer. Used to configure and interact with the Redux store
 * This keeps track of the token in local storage.
 * @param {Object} state redux state
 * @param {Objcet} action action
 */
export const reducer = (state = initial_state, action) => {
    switch (action.type) {
        case Redux.LOGIN: {
            ls.set(T_VAR, action.token);
            ls.set(RT_VAR, action.refresh_token);
            return {
                token: action.token,
                refresh_token: action.refresh_token,
            };
        }
        case Redux.LOGOUT: {
            ls.remove(T_VAR);
            ls.remove(RT_VAR);
            return {
                token: null,
                refresh_token: null,
            };
        }
        default:
            return state;
    }
};
