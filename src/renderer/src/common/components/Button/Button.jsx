import "./styles.sass";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export const Button = ({text, icon, onClick}) => {
    return (
        <button className="btn" onClick={onClick}>
            <p>{text}</p>
            {icon && <FontAwesomeIcon icon={icon} />}
        </button>
    );
}