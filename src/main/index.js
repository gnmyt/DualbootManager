import {app, shell, BrowserWindow, ipcMain} from "electron";
import {join} from "path";
import {electronApp, optimizer, is} from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import {retrievePartitions} from "./util/partition";

const createWindow = async () => {
    const mainWindow = new BrowserWindow({
        width: 1049,
        height: 600,
        show: false,
        autoHideMenuBar: true,
        resizable: false,
        ...(process.platform === 'linux' ? {icon} : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    });

    mainWindow.removeMenu();

    mainWindow.on('ready-to-show', () => mainWindow.show());

    ipcMain.handle('request-partitions', retrievePartitions);
    ipcMain.on("close-app", () => app.quit());

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return {action: 'deny'};
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId('de.gnmyt');

    app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window));

    createWindow();
});

app.on('window-all-closed', () => app.quit());