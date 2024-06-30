import plist from "plist";
import {retrieveBootloaderMount, retrieveEFIEntries} from "./partition";
import sudo from "sudo-prompt";
import {INSTALLATION_PATH} from "../index";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_CONFIG = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>Boot</key>
        <dict>
            <key>DefaultVolume</key>
            <string>LastBootedVolume</string>
            <key>Timeout</key>
            <integer>5</integer>
        </dict>
        <key>GUI</key>
        <dict>
            <key>Custom</key>
            <dict>
                <key>Entries</key>
                <array>
                </array>
            </dict>
            <key>Scan</key>
            <dict>
                <key>Entries</key>
                <false/>
                <key>Tool</key>
                <false/>
                <key>Legacy</key>
                <false/>
            </dict>
            <key>Mouse</key>
            <dict>
                <key>Speed</key>
                <integer>3</integer>
            </dict>
            <key>Theme</key>
            <string>embedded</string>
            <key>Language</key>
            <string>en</string>
            <key>ScreenResolution</key>
            <string>1920x1080</string>
            <key>Timezone</key>
            <integer>3</integer>
        </dict>
    </dict>
</plist>`;

export const retrieveFormattedEntries = async () => {
    const entries = await retrieveEFIEntries();
    const formattedEntries = entries.map(entry => {
        return {
            Path: entry.path,
            Image: `os_${entry.name.toLowerCase().replace(/\s+/g, '_')}`,
            FullTitle: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
            Title: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
            Type: entry.name.includes("Windows") ? "Windows" : "Linux",
            Volume: entry.uid
        };
    });

    return formattedEntries;
}

export const getDefaultConfig = async () => {
    try {
        const defaultConfig = plist.parse(DEFAULT_CONFIG);

        defaultConfig.GUI.Custom.Entries = await retrieveFormattedEntries();

        return plist.build(defaultConfig);

    } catch (error) {
        console.error("Error creating config.plist: ", error);
        return false;
    }

}

export const startTransaction = async () => {
    const bootloaderMount = await retrieveBootloaderMount();
    const mountDir = path.join(INSTALLATION_PATH, 'efi_tmp');
    if (!fs.existsSync(mountDir)) fs.mkdirSync(mountDir);

    const transactionDir = path.join(INSTALLATION_PATH, 'transaction');
    if (!fs.existsSync(transactionDir)) fs.mkdirSync(transactionDir);

    const bashCommand = `
        existing_mount_point=$(findmnt -rn -o TARGET ${bootloaderMount})
        if [ -z "$existing_mount_point" ]; then
            mount ${bootloaderMount} ${mountDir}
            mount_point=${mountDir}
        else
            mount_point=$existing_mount_point
        fi
        if [ ! -d $mount_point/EFI ]; then exit 1; fi
        cp -r $mount_point/EFI/CLOVER/themes ${transactionDir}
        cp -r $mount_point/EFI/CLOVER/config.plist ${transactionDir}
        chmod -R 777 ${transactionDir}
        `;

    fs.writeFileSync(path.join(INSTALLATION_PATH, 'start_transaction.sh'), bashCommand);

    return new Promise((resolve, reject) => {
        sudo.exec(`bash ${path.join(INSTALLATION_PATH, 'start_transaction.sh')}`, { name: 'Clover Bootloader Installer' }, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

export const commitTransaction = async () => {
    const bootloaderMount = await retrieveBootloaderMount();
    const mountDir = path.join(INSTALLATION_PATH, 'efi_tmp');
    if (!fs.existsSync(mountDir)) fs.mkdirSync(mountDir);

    const transactionDir = path.join(INSTALLATION_PATH, 'transaction');

    const bashCommand = `
        existing_mount_point=$(findmnt -rn -o TARGET ${bootloaderMount})
        if [ -z "$existing_mount_point" ]; then
            mount ${bootloaderMount} ${mountDir}
            mount_point=${mountDir}
        else
            mount_point=$existing_mount_point
        fi
        if [ ! -d $mount_point/EFI ]; then exit 1; fi
        rm -rf $mount_point/EFI/CLOVER/themes
        rm -f $mount_point/EFI/CLOVER/config.plist
        cp -r ${transactionDir}/themes $mount_point/EFI/CLOVER
        cp -r ${transactionDir}/config.plist $mount_point/EFI/CLOVER
        `;

    fs.writeFileSync(path.join(INSTALLATION_PATH, 'commit_transaction.sh'), bashCommand);

    return new Promise((resolve, reject) => {
        sudo.exec(`bash ${path.join(INSTALLATION_PATH, 'commit_transaction.sh')}`, { name: 'Clover Bootloader Installer' }, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

export const getConfig = async () => {
    const configPath = path.join(INSTALLATION_PATH, 'transaction', 'config.plist');

    return new Promise((resolve, reject) => {
        fs.readFile(configPath, 'utf8', (error, data) => {
            if (error) {
                reject(error);
                return;
            }
            resolve( plist.parse(data) );
        });
    });
}

export const updateConfig = async (config) => {
    const configPath = path.join(INSTALLATION_PATH, 'transaction', 'config.plist');

    return new Promise((resolve, reject) => {
        fs.writeFile(configPath, plist.build(config), (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

export const clearThemes = async () => {
    const transactionDir = path.join(INSTALLATION_PATH, 'transaction');
    const themesDir = path.join(transactionDir, 'themes');

    const defaultThemes = ['embedded', 'random'];

    return new Promise((resolve, reject) => {
        fs.readdir(themesDir, (error, files) => {
            if (error) {
                reject(error);
                return;
            }
            files.forEach(file => {
                if (!defaultThemes.includes(file)) {
                    fs.rmSync(path.join(themesDir, file), { recursive: true });
                }
            });
            resolve();
        });
    });

}

export const copyTheme = async (theme) => {
    const transactionDir = path.join(INSTALLATION_PATH, 'transaction');
    const themesDir = path.join(INSTALLATION_PATH, 'themes');

    await clearThemes();

    const themeDir = path.join(themesDir, theme);

    return new Promise((resolve, reject) => {
        fs.cp(themeDir, path.join(transactionDir, 'themes', theme), {recursive: true}, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}