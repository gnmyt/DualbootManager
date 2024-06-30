import {createContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import "./styles.sass";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCodeCommit, faFileUpload, faSave} from "@fortawesome/free-solid-svg-icons";

export const ConfigurationContext = createContext({});

export const ConfigurationProvider = ({children}) => {
    const navigate = useNavigate();

    const [configuration, setConfiguration] = useState({});
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    const loadConfiguration = () => {
        window.electron.ipcRenderer.invoke("get-config").then(setConfiguration);
    }

    const updateConfiguration = (key, value) => {
        setUnsavedChanges(true);
        setConfiguration((prev) => {
            const newConfiguration = {...prev};
            const keys = key.split(".");
            let current = newConfiguration;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;

            window.electron.ipcRenderer.invoke("update-config", newConfiguration);

            return newConfiguration;
        });
    }

    useEffect(() => {
        window.electron.ipcRenderer.invoke("request-bootloader-mount")
            .then((data) => {
                if (data === null) {
                    navigate("/setup/uac-prompt");
                    return;
                }

                navigate("/home/uac-prompt");
            });
    }, []);

    return (
        <ConfigurationContext.Provider value={{configuration, loadConfiguration, updateConfiguration}}>
            {children}
            <button className={"save-button" + (unsavedChanges ? "" : " save-btn-hidden")} onClick={async () => {
                await window.electron.ipcRenderer.invoke("commit-transaction");
                setUnsavedChanges(false);
            }}>
                <FontAwesomeIcon icon={faSave} />
                <p>Save Changes</p>
            </button>
        </ConfigurationContext.Provider>
    );
}
