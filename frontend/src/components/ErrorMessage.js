import React from "react";

export const ErrorMessage = ({message}) => {
    return (
        <div className="bg-danger p-3 mb-3" >
            <h6 className="text-white m-0">{message}</h6>
        </div>
    )
}
