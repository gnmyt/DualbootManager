import {useContext, useEffect} from "react";
import "./styles.sass";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUserLock} from "@fortawesome/free-solid-svg-icons";
import {ConfigurationContext} from "@common/contexts/ConfigurationContext";

export const UACPrompt = () => {
    const navigate = useNavigate()
    const {loadConfiguration} = useContext(ConfigurationContext);

    const ipcHandle = async () => {
        try {
            await window.electron.ipcRenderer.invoke("start-transaction");
            await loadConfiguration();
            navigate("/home/themes");
        } catch (error) {
            window.electron.ipcRenderer.send("close-app");
        }
    }

    useEffect(() => {
        const timeout = setTimeout(() => ipcHandle(), 500);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="uac-prompt">
            <FontAwesomeIcon icon={faUserLock} />
            <p>Please enter your admin password in the opened window.</p>
        </div>
    );
}