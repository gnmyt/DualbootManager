import "./styles.sass";
import {useContext} from "react";
import Navigation from "@common/components/Navigation";
import {ConfigurationContext} from "@common/contexts/ConfigurationContext";

export const Settings = () => {
    const {configuration} = useContext(ConfigurationContext);

    return (
        <div className="settings-page">
            <Navigation />
        </div>
    );
}