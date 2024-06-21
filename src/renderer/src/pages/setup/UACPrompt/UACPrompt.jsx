import {useContext, useEffect} from "react";
import {PartitionContext} from "@common/contexts/PartitionContext";
import "./styles.sass";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUserLock} from "@fortawesome/free-solid-svg-icons";

export const UACPrompt = () => {
    const setPartitions = useContext(PartitionContext)[1];
    const navigate = useNavigate()

    const ipcHandle = async () => {
        try {
            const result = await window.electron.ipcRenderer.invoke("request-partitions");
            setPartitions(result);
            navigate("/setup/welcome");
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