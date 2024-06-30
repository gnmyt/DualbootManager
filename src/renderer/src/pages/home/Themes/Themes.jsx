import "./styles.sass";
import {useContext, useEffect, useState} from "react";
import Navigation from "@common/components/Navigation";
import {ConfigurationContext} from "@common/contexts/ConfigurationContext";
import SmallButton from "@common/components/SmallButton";
import {faUpload} from "@fortawesome/free-solid-svg-icons";

export const Themes = () => {
    const [themes, setThemes] = useState([]);
    const {configuration, updateConfiguration} = useContext(ConfigurationContext);

    useEffect(() => {
        window.electron.ipcRenderer.invoke("request-themes").then(setThemes);
    }, []);

    const installTheme = async (theme) => {
        await window.electron.ipcRenderer.invoke("copy-theme", theme);

        updateConfiguration("GUI.Theme", theme);
    }

    return (
        <div className="themes-page">
            <Navigation />
            <div className="themes-area">
                {themes.map((theme, index) => (
                    <div key={index} className={"theme" + (configuration?.GUI?.Theme === theme.name ? " theme-active" : "")}>
                        <img src={"data:image/png;base64," + theme.thumbnail} alt="Screenshot" />
                        <div className="theme-inner">
                            <div className="theme-title">
                                <h2>{theme.name}</h2>
                                <p>by {theme.author}</p>
                            </div>
                            <p className="theme-description">{theme.description}</p>
                        </div>
                        <div className="theme-actions">
                            <SmallButton onClick={() => installTheme(theme.name)} icon={faUpload} text="Install"
                                         disabled={configuration?.GUI?.Theme === theme.name} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}