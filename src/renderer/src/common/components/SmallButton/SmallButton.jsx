import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./styles.sass";

export const SmallButton = ({icon, text, onClick, disabled}) => {
    return (
        <button className="small-button" onClick={onClick} disabled={disabled}>
            <FontAwesomeIcon icon={icon} />
            <p>{text}</p>
        </button>
    )
}