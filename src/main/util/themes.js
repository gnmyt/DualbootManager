import { INSTALLATION_PATH } from "../index";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import plist from "plist";

export const getThemes = async () => {
    const themesDir = path.join(INSTALLATION_PATH, 'themes');

    try {
        const directories = await fs.readdir(themesDir, { withFileTypes: true });
        const themes = [];

        for (const dir of directories) {
            if (dir.isDirectory()) {
                const themePath = path.join(themesDir, dir.name);

                const screenshotPath = path.join(themePath, 'screenshot.png');
                let thumbnail = null;
                try {
                    const screenshotBuffer = await fs.readFile(screenshotPath);
                    thumbnail = screenshotBuffer.toString('base64');
                } catch (err) {
                    console.error(`Failed to read screenshot.png for theme ${dir.name}: ${err.message}`);
                }

                const plistPath = path.join(themePath, 'theme.plist');
                let description = null;
                let author = null;
                try {
                    const plistContent = await fs.readFile(plistPath, 'utf8');
                    const plistData = plist.parse(plistContent);

                    description = plistData.Description;
                    author = plistData.Author;
                } catch (err) {
                    console.error(`Failed to read theme.plist for theme ${dir.name}: ${err.message}`);
                }

                themes.push({name: dir.name, thumbnail, description, author});
            }
        }

        return themes;
    } catch (err) {
        console.error(`Failed to read themes directory: ${err.message}`);
        return [];
    }
};
