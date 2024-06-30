import "./styles.sass";
import {useContext} from "react";
import Navigation from "@common/components/Navigation";
import {ConfigurationContext} from "@common/contexts/ConfigurationContext";
import {
    faCalendarDays,
    faClock,
    faDesktop, faHandPointer,
    faLanguage,
    faMousePointer, faRefresh
} from "@fortawesome/free-solid-svg-icons";
import SettingRow from "@pages/home/Settings/components";

import LinuxImage from "./assets/linux.png";
import WindowsImage from "./assets/windows.png";
import SmallButton from "@common/components/SmallButton";

export const LANGUAGES = [
    {value: "en", label: "English"}, {value: "ru", label: "Русский"},
    {value: "fr", label: "Français"}, {value: "it", label: "Italiano"},
    {value: "es", label: "Español"}, {value: "pt", label: "Português"},
    {value: "br", label: "Português (Brasil)"}, {value: "de", label: "Deutsch"},
    {value: "nl", label: "Nederlands"}, {value: "pl", label: "Polski"},
    {value: "ua", label: "Українська"}, {value: "cz", label: "Čeština"},
    {value: "hr", label: "Hrvatski"}, {value: "id", label: "Bahasa Indonesia"},
    {value: "ko", label: "한국어"}
];

export const TIMEOUTS = [
    {value: 0, label: "No Timeout"}, {value: 5, label: "5 Seconds"},
    {value: 10, label: "10 Seconds"}, {value: 15, label: "15 Seconds"},
    {value: 20, label: "20 Seconds"}, {value: 25, label: "25 Seconds"},
    {value: 30, label: "30 Seconds"}, {value: 35, label: "35 Seconds"},
    {value: 40, label: "40 Seconds"}, {value: 45, label: "45 Seconds"},
    {value: 50, label: "50 Seconds"}, {value: 55, label: "55 Seconds"},
    {value: 60, label: "60 Seconds"}
];

export const TIMEZONE = [
    {value: -12, label: "GMT -12:00"}, {value: -11, label: "GMT -11:00"},
    {value: -10, label: "GMT -10:00"}, {value: -9, label: "GMT -9:00"},
    {value: -8, label: "GMT -8:00"}, {value: -7, label: "GMT -7:00"},
    {value: -6, label: "GMT -6:00"}, {value: -5, label: "GMT -5:00"},
    {value: -4, label: "GMT -4:00"}, {value: -3, label: "GMT -3:00"},
    {value: -2, label: "GMT -2:00"}, {value: -1, label: "GMT -1:00"},
    {value: 0, label: "GMT +0:00"}, {value: 1, label: "GMT +1:00"},
    {value: 2, label: "GMT +2:00"}, {value: 3, label: "GMT +3:00"},
    {value: 4, label: "GMT +4:00"}, {value: 5, label: "GMT +5:00"},
    {value: 6, label: "GMT +6:00"}, {value: 7, label: "GMT +7:00"},
    {value: 8, label: "GMT +8:00"}, {value: 9, label: "GMT +9:00"},
    {value: 10, label: "GMT +10:00"}, {value: 11, label: "GMT +11:00"},
    {value: 12, label: "GMT +12:00"}
];


export const Settings = () => {
    const {configuration, updateConfiguration} = useContext(ConfigurationContext);

    const getFormatted = () => {
        if (!configuration?.GUI?.Custom?.Entries) return [];

        return configuration?.GUI?.Custom?.Entries?.map((entry) => {
            return {value: entry.Path, label: entry.Title}
        });
    }

    const deleteBootEntry = (index) => {
        const newEntries = configuration?.GUI?.Custom?.Entries;
        newEntries.splice(index, 1);
        updateConfiguration("GUI.Custom.Entries", newEntries);
    }

    const syncBootEntries = () => {
        window.electron.ipcRenderer.invoke("request-efi-entries").then((entries) => {
            updateConfiguration("GUI.Custom.Entries", entries);
        });
    }

    if (!configuration) return null;

    return (
        <div className="settings-page">
            <Navigation/>

            <div className="settings-container">
                <SettingRow icon={faDesktop} title="Screen Resolution"
                            description="Select the resolution fitting to your screen"
                            configurationValue={configuration?.GUI?.ScreenResolution}
                            configurationKey="GUI.ScreenResolution"/>

                <SettingRow icon={faLanguage} title="Language"
                            description="Select one of the provided language packets in which the GUI shows up"
                            configurationValue={configuration?.GUI?.Language} configurationKey="GUI.Language"
                            selectItems={LANGUAGES}/>

                <SettingRow icon={faClock} title="Timeout"
                            description="How long do you want to wait until the PC boots automatically?"
                            configurationValue={configuration?.Boot?.Timeout} configurationKey="Boot.Timeout"
                            selectItems={TIMEOUTS}/>

                <SettingRow icon={faHandPointer} title="Auto-Select"
                            description="Which OS do you want to boot if none is selected?"
                            configurationValue={configuration?.Boot?.DefaultVolume}
                            configurationKey="Boot.DefaultVolume"
                            selectItems={[{value: "LastBootedVolume", label: "Last booted"}, ...getFormatted()]}/>

                <SettingRow icon={faMousePointer} title="Mouse Sensitivity"
                            description="How fast should your mouse move over the screen?"
                            configurationValue={configuration?.GUI?.Mouse?.Speed} configurationKey="GUI.Mouse.Speed"
                            slider={{min: 1, max: 20}}/>

                <SettingRow icon={faCalendarDays} title="Timezone" description="Select your timezone"
                            configurationValue={configuration?.GUI?.Timezone} configurationKey="GUI.Timezone"
                            selectItems={TIMEZONE}/>

                <div className="boot-sync">
                    <h2>Boot Entries</h2>
                    <SmallButton text="Synchronize" icon={faRefresh} onClick={syncBootEntries}/>
                </div>

                <div className="boot-entries">
                    {configuration?.GUI?.Custom?.Entries?.map((entry, index) => {
                        return <div className="boot-entry" key={index} onClick={() => deleteBootEntry(index)}>
                            <img src={entry.Type === "Linux" ? LinuxImage : WindowsImage} alt="OS"/>
                            <h2>{entry.Title}</h2>
                        </div>
                    })}
                </div>
            </div>


        </div>
    );
}