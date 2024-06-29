import {app, shell, BrowserWindow, ipcMain} from "electron";
import {join} from "path";
import {electronApp, optimizer, is} from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import {retrievePartitions, retrieveBootloaderMount} from "./util/partition";
import * as fs from "node:fs";
import {getThemes} from "./util/themes";
import {deleteInvalidThemes, downloadBootloader, downloadThemes, mountAndInstallBootloader} from "./util/installer";
import sudo from "sudo-prompt";

export const INSTALLATION_PATH = join(app.getPath('userData'), 'appdata');

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

    ipcMain.handle("request-bootloader-mount", retrieveBootloaderMount);
    ipcMain.handle('request-partitions', retrievePartitions);
    ipcMain.handle('request-themes', getThemes);

    ipcMain.on("close-app", () => app.quit());
    ipcMain.on("reboot-to-bios", () => {
        sudo.exec(`systemctl reboot --firmware-setup`, {name: 'Clover Bootloader Installer'}, (error) => {
            if (error) {
                console.error("Error rebooting to BIOS: ", error);
            }
        });
    });

    ipcMain.handle("download-clover", downloadBootloader);
    ipcMain.handle("download-themes", downloadThemes);
    ipcMain.handle("install-clover", (_, disk, partition) => mountAndInstallBootloader(disk, partition));
    ipcMain.handle("delete-invalid-themes", () => deleteInvalidThemes(join(INSTALLATION_PATH, 'themes')));

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

if (!fs.existsSync(INSTALLATION_PATH)) {
    fs.mkdirSync(INSTALLATION_PATH, {recursive: true});
}