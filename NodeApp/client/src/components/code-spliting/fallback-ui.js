import React from "react";
import "../code-spliting/fallback.css";

/**
 * Fallback UI for page suspense
 */
export const fallback = {
    fallback: (
        <div className="loader-center">
            <div className="loader" />
            <h2>Loading your experience...</h2>
        </div>
    ),
};
