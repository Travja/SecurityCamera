import { Redux } from "./redux-types";
import SecureLS from "secure-ls";

/**
 * Encoded local storage.
 * ** Refrain from using `localstorage.<function>()` for anything **
 *
 * Import this variable and use it as in `ls.<function>()`
 */
export const ls = new SecureLS({ encodingType: "aes" });

const LS_VAR = "@token";

const initial_state = {
  token: ls.get(LS_VAR),
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
      ls.set(LS_VAR, action.token);
      return {
        token: action.token,
      };
    }
    case Redux.LOGOUT: {
      ls.set(LS_VAR, null);
      return {
        token: null,
      };
    }
    default:
      return state;
  }
};
