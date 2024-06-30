import {app, shell, BrowserWindow, ipcMain} from "electron";
import {join} from "path";
import {electronApp, optimizer, is} from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import {retrievePartitions, retrieveBootloaderMount} from "./util/partition";
import * as fs from "node:fs";
import {getThemes} from "./util/themes";
import {deleteInvalidThemes, downloadBootloader, downloadThemes, mountAndInstallBootloader} from "./util/installer";
import sudo from "sudo-prompt";
import {
    commitTransaction,
    copyTheme,
    getConfig,
    retrieveFormattedEntries,
    startTransaction,
    updateConfig
} from "./util/config";

export const INSTALLATION_PATH = join(app.getPath('userData'), 'appdata');
export const REQUIRED_BINARIES = ['efibootmgr', 'pkexec', 'mount', 'umount', 'findmnt', 'cp', 'rm', 'bash',
    'chmod', 'echo', 'parted', 'grep'];

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
    ipcMain.handle("request-efi-entries", retrieveFormattedEntries);
    ipcMain.handle('request-partitions', retrievePartitions);
    ipcMain.handle('request-themes', getThemes);

    ipcMain.handle("check-binaries", () => {
        return new Promise((resolve) => {
            let notInstalled = [];
            for (const dependency of REQUIRED_BINARIES) {
                if (!fs.existsSync(`/usr/bin/${dependency}`) && !fs.existsSync(`/usr/sbin/${dependency}`)) {
                    notInstalled.push(dependency);
                }
            }

            resolve(notInstalled);
        });
    });

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
    ipcMain.handle("copy-theme", (_, theme) => copyTheme(theme));

    ipcMain.handle("start-transaction", startTransaction);
    ipcMain.handle("commit-transaction", commitTransaction);
    ipcMain.handle("get-config", getConfig);
    ipcMain.handle("update-config", (_, config) => updateConfig(config));

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