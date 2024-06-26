import {resolve} from "path";
import {defineConfig, externalizeDepsPlugin} from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()]
    },
    preload: {
        plugins: [externalizeDepsPlugin()]
    },
    renderer: {
        resolve: {
            alias: {
                "@renderer": resolve("src/renderer/src"),
                "@common": resolve("src/renderer/src/common"),
                "@pages": resolve("src/renderer/src/pages"),
            }
        },
        plugins: [react()]
    }
});