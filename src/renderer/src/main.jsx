import React, {createRef} from "react";
import ReactDOM from "react-dom/client";
import "@common/styles/main.sass";
import {createHashRouter, RouterProvider,} from "react-router-dom";

import "@fontsource/roboto/100.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import Root from "@common/layouts/Root";
import {PartitionProvider} from "@common/contexts/PartitionContext";
import Setup from "@common/layouts/Setup";
import UACPrompt from "@pages/setup/UACPrompt";
import Welcome from "@pages/setup/Welcome";
import Partition from "@pages/setup/Partition";
import Install from "@pages/setup/Install";
import Finished from "@pages/setup/Finished";
import Themes from "@pages/home/Themes";

export const routes = [
    {path: "/setup/uac-prompt", element: <UACPrompt/>, nodeRef: createRef()},
    {path: "/setup/welcome", element: <Welcome/>, nodeRef: createRef()},
    {path: "/setup/partition", element: <Partition/>, nodeRef: createRef()},
    {path: "/setup/install", element: <Install/>, nodeRef: createRef()},
    {path: "/setup/finished", element: <Finished/>, nodeRef: createRef()},
    {path: "/home/themes", element: <Themes/>, nodeRef: createRef()}
];

const router = createHashRouter([
    {
        path: "/", element: <Root/>, children: [
            {
                path: "/setup",
                element: <Setup/>,
                children: routes.filter(route => route.path.startsWith("/setup")).map(route => ({
                    ...route, path: route.path.replace("/setup/", "")
                }))
            },
            {
                path: "/home",
                element: <Root/>,
                children: routes.filter(route => route.path.startsWith("/home")).map(route => ({
                    ...route, path: route.path.replace("/home/", "")
                }))
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <PartitionProvider>
            <RouterProvider router={router}/>
        </PartitionProvider>
    </React.StrictMode>
);