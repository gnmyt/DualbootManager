import {useLocation, useNavigate} from "react-router-dom";
import "./styles.sass";

export const Navigation = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === `/home/${path}`;
    }

    return (
        <div className="navigation">
            <h1 className={isActive("themes") ? "nav-active" : ""} onClick={() => navigate("/home/themes")}>theming</h1>
            <h1 className={isActive("settings") ? "nav-active" : ""} onClick={() => navigate("/home/settings")}>settings</h1>
            <h1 className={isActive("update") ? "nav-active" : ""} onClick={() => navigate("/home/update")}>update</h1>
        </div>
    )
}