import {createContext} from "react";
import {Navigate} from "react-router-dom";

export const ConfigurationContext = createContext([]);

export const ConfigurationProvider = ({children}) => {
    return (
        <ConfigurationContext.Provider value={[]}>
            <Navigate to={"/setup/uac-prompt"}/>
            {children}
        </ConfigurationContext.Provider>
    );
}