import plist from "plist";
import {retrieveEFIEntries} from "./partition";

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
            <key>Language</key>
            <string>en</string>
            <key>ScreenResolution</key>
            <string>1920x1080</string>
            <key>Timezone</key>
            <integer>3</integer>
        </dict>
    </dict>
</plist>`;
export const getDefaultConfig = async () => {
    try {
        const defaultConfig = plist.parse(DEFAULT_CONFIG);

        const bootEntries = await retrieveEFIEntries();

        const formattedEntries = bootEntries.map(entry => {
            return {
                Path: entry.path,
                Image: `os_${entry.name.toLowerCase().replace(/\s+/g, '_')}`,
                FullTitle: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
                Title: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
                Type: entry.name.includes("Windows") ? "Windows" : "Linux",
                Volume: entry.uid
            };
        });

        defaultConfig.GUI.Custom.Entries = formattedEntries;

        return plist.build(defaultConfig);

    } catch (error) {
        console.error("Error creating config.plist: ", error);
        return false;
    }

}

export const loadConfig = async () => {

}