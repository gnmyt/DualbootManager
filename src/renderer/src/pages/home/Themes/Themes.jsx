import "./styles.sass";
import {useEffect, useState} from "react";
import Navigation from "@common/components/Navigation";

export const Themes = () => {
    const [themes, setThemes] = useState([]);

    useEffect(() => {
        window.electron.ipcRenderer.invoke("request-themes").then(setThemes);
    }, []);

    return (
        <div className="themes-page">
            <Navigation />
            <div className="themes-area">
                {themes.map((theme, index) => (
                    <div key={index} className="theme">
                        <img src={"data:image/png;base64," + theme.thumbnail} alt="Screenshot" />
                        <div className="theme-inner">
                            <div className="theme-title">
                                <h2>{theme.name}</h2>
                                <p>by {theme.author}</p>
                            </div>
                            <p className="theme-description">{theme.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}