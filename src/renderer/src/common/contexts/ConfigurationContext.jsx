import {createContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export const ConfigurationContext = createContext([]);

export const ConfigurationProvider = ({children}) => {

    const [mountPoint, setMountPoint] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        window.electron.ipcRenderer.invoke("request-bootloader-mount")
            .then((data) => {
                if (data === null) {
                    navigate("/setup/uac-prompt");
                    return;
                }

                setMountPoint(data);
                navigate("/home/themes");
            });
    }, []);

    return (
        <ConfigurationContext.Provider value={mountPoint}>
            {children}
        </ConfigurationContext.Provider>
    );
}