import React from "react";

export const NotFound = ({ className }) => {
    return (
        <div className={`vh-100 d-flex flex-column justify-content-center ${className}`}>
            <h1>404 Not Found</h1>
            <h5>Something has gone wrong! <br /> Please refresh, login or close this window</h5>
        </div>
    )
}
