import "./styles.sass";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useContext} from "react";
import {ConfigurationContext} from "@common/contexts/ConfigurationContext";

export const SettingRow = ({icon, title, description, configurationKey, configurationValue, selectItems, slider}) => {
    const {updateConfiguration} = useContext(ConfigurationContext);

    return (
        <div className="setting-row">

            <div className="settings-left">
                <FontAwesomeIcon icon={icon}/>

                <div className="settings-info">
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>

            </div>
            {!selectItems && !slider && <input type="text" value={configurationValue}
                                               onChange={(e) => updateConfiguration(configurationKey, e.target.value)}/>}
            {selectItems && <select value={configurationValue}
                                    onChange={(e) => updateConfiguration(configurationKey, e.target.value)}>
                {selectItems.map((item, index) => <option key={index} value={item.value}>{item.label}</option>)}
            </select>}


            {slider && <div className="slider-row">
                <input type="range" min={slider.min} max={slider.max} value={configurationValue}
                       onChange={(e) => updateConfiguration(configurationKey, e.target.value)}/>
                <h2>{configurationValue}</h2></div>}
        </div>
    )
}