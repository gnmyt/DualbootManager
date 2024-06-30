import "./styles.sass";
import {useContext} from "react";
import Navigation from "@common/components/Navigation";
import {ConfigurationContext} from "@common/contexts/ConfigurationContext";

export const Update = () => {
    const {configuration} = useContext(ConfigurationContext);

    return (
        <div className="update-page">
            <Navigation />
        </div>
    );
}