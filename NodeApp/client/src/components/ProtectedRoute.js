import React, { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import AccountAPI from "../api/Account";

/**
 * Protects routes lo logged in users only.
 * ** ALSO tags the user object to the `props` of the autheticated routes.
 * @param {Object} param0 any react-router-dom `Route` props
 */
export const ProtectedRoute = ({ component: Component, ...rest }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        let mounted = true;
        if (mounted)
            AccountAPI.getAccount((err, account) => {
                if (err) setUser(false);
                else setUser(account);
            });
        return () => (mounted = false);
    }, []);

    if (user === null) {
        return (
            <div>
                <h3>Authenticating user...</h3>
            </div>
        );
    }

    return (
        <Route
            {...rest}
            render={(props) => {
                if (typeof user === "object")
                    return <Component {...rest} user={user} />;
                else
                    return (
                        <Redirect to={{ pathname: "/", state: { from: props.location } }} />
                    );
            }}
        />
    );
};
