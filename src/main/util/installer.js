import {INSTALLATION_PATH} from "../index";
import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import AdmZip from "adm-zip";
import sudo from "sudo-prompt";


export const download = async (url, assetName,dest) => {
    const zipPath = path.join(INSTALLATION_PATH, assetName);

    if (!fs.existsSync(dest)) fs.mkdirSync(dest);

    const writer = fs.createWriteStream(zipPath);
    const downloadResponse = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream'
    });

    downloadResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(dest, true);
}

export const downloadBootloader = async () => {
    try {
        const repoUrl = 'https://api.github.com/repos/CloverHackyColor/CloverBootloader/releases/latest';
        const response = await axios.get(repoUrl);
        const latestRelease = response.data;

        const asset = latestRelease.assets.find(asset => asset.name.startsWith('CloverV2-') && asset.name.endsWith('.zip'));
        if (!asset) {
            throw new Error('No suitable asset found in the latest release');
        }

        if (fs.existsSync(path.join(INSTALLATION_PATH, 'clover_bootloader'))) {
            fs.rmSync(path.join(INSTALLATION_PATH, 'clover_bootloader'), { recursive: true });
        }

        const zipUrl = asset.browser_download_url;
        const tempDir = path.join(INSTALLATION_PATH, 'clover_tmp');

        await download(zipUrl, asset.name,tempDir);

        fs.renameSync(path.join(tempDir, 'CloverV2', 'EFI'), path.join(INSTALLATION_PATH, 'bootloader'));

        fs.rmSync(tempDir, { recursive: true });

        return true;
    } catch (error) {
        console.error('Error downloading or extracting bootloader:', error.message);
        return false;
    }
};
export const mountAndInstallBootloader = async (disk, partition) => {
    const mountDir = path.join(INSTALLATION_PATH, 'efi_tmp');
    if (!fs.existsSync(mountDir)) fs.mkdirSync(mountDir);

    const bootloaderPath = path.join(INSTALLATION_PATH, 'bootloader');

    const diskPartition = disk + (disk.startsWith("/dev/nvme") ? "p" : "") + partition;

    const bashCommand = `
        existing_mount_point=$(findmnt -rn -o TARGET ${diskPartition})
        if [ -z "$existing_mount_point" ]; then
            mount ${diskPartition} ${mountDir}
            mount_point=${mountDir}
        else
            mount_point=$existing_mount_point
        fi
        if [ ! -d $mount_point/EFI ]; then exit 1; fi
        cp -r ${bootloaderPath}/* $mount_point/EFI
        efibootmgr -c -d ${disk} -p ${partition} -L "Clover Bootloader" -l "\\EFI\\BOOT\\BOOTX64.efi"
    `;

    fs.writeFileSync(path.join(INSTALLATION_PATH, 'install.sh'), bashCommand);

    return new Promise((resolve, reject) => {
        sudo.exec(`bash ${path.join(INSTALLATION_PATH, 'install.sh')}`, { name: 'Clover Bootloader Installer' }, (error) => {
            if (error) {
                reject(error);
                return;
            }

            fs.writeFileSync(path.join(INSTALLATION_PATH, 'bootloader_installed'), diskPartition);

            resolve();
        });
    });
}


export const downloadThemes = async () => {
    try {
        const repoUrl = 'https://github.com/CloverHackyColor/CloverThemes';
        const zipUrl = `${repoUrl}/archive/refs/heads/master.zip`;
        const tempDir = path.join(INSTALLATION_PATH, 'themes-tmp');

        if (fs.existsSync(path.join(INSTALLATION_PATH, 'themes'))) {
            fs.rmSync(path.join(INSTALLATION_PATH, 'themes'), { recursive: true });
        }

        await download(zipUrl, 'CloverThemes-master.zip',tempDir);

        fs.unlinkSync(path.join(INSTALLATION_PATH, 'CloverThemes-master.zip'));

        const extractedDir = path.join(tempDir, 'CloverThemes-master');
        fs.renameSync(extractedDir, path.join(INSTALLATION_PATH, 'themes'));

        fs.rmSync(tempDir, { recursive: true });

        await deleteInvalidThemes(path.join(INSTALLATION_PATH, 'themes'));

        return true;
    } catch (error) {
        console.error('Error downloading or extracting themes:', error.message);
        return false;
    }
};

export const deleteInvalidThemes = async (themesDir) => {
    try {
        const themes = await fs.promises.readdir(themesDir, { withFileTypes: true });

        for (const theme of themes) {
            if (theme.isDirectory()) {
                const themePath = path.join(themesDir, theme.name);
                const plistPath = path.join(themePath, 'theme.plist');
                const screenshotPath = path.join(themePath, 'screenshot.png');

                if (!fs.existsSync(plistPath) || !fs.existsSync(screenshotPath)) {
                    await fs.promises.rm(themePath, { recursive: true });
                    console.log(`Deleted invalid theme: ${theme.name}`);
                }

            } else {
                await fs.promises.unlink(path.join(themesDir, theme.name));
            }
        }

        console.log('Finished deleting invalid themes.');
    } catch (error) {
        console.error('Error deleting invalid themes:', error.message);
    }
};