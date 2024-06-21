import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHardDrive} from "@fortawesome/free-solid-svg-icons";
import "./styles.sass";

export const PartitionItem = ({name, path, size, active, onClick}) => {
    return (
        <div className={"partition-item" + (active ? " partition-active" : "")} onClick={onClick}>
            <FontAwesomeIcon icon={faHardDrive} />
            <h1>{name}</h1>
            <div className="part-info">
                <p className="path">{path}</p>
                <div className="circle" />
                <p>{size}</p>
            </div>
        </div>
    )
}