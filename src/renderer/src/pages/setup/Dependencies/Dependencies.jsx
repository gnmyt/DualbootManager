import {useContext} from "react";
import "./styles.sass";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose, faWarning} from "@fortawesome/free-solid-svg-icons";
import {ConfigurationContext} from "@common/contexts/ConfigurationContext";
import SmallButton from "@common/components/SmallButton";

export const Dependencies = () => {

    const {missingDependencies} = useContext(ConfigurationContext);

    return (
        <div className="dependency-error">
            <FontAwesomeIcon icon={faWarning} className="big-svg"/>
            <h1>Missing binaries</h1>
            <div className="dep-msg-area">
                <p>You are missing binaries {missingDependencies.map((dependency, index) => <span key={index}>{dependency}</span>)}.</p>
            </div>

            <div className="dep-btn-area">
                <SmallButton text="Close" icon={faClose} onClick={() => window.electron.ipcRenderer.send("close-app")}/>
            </div>
        </div>
    );
}