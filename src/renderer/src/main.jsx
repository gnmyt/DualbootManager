import React from "react";
import ReactDOM from "react-dom/client";
import "@common/styles/main.sass";
import {createHashRouter, RouterProvider,} from "react-router-dom";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import Root from "@common/layouts/Root";

const router = createHashRouter([
    {
        path: "/",
        element: <Root/>
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);