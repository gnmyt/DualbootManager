import "./styles.sass";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import Button from "@common/components/Button";
import {useNavigate} from "react-router-dom";

export const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-center">
            <div className="welcome-page">
                <h1>Welcome!</h1>
                <p>Let’s get started with your simple Dualboot experience</p>

                <div className="action-container">
                    <Button onClick={() => navigate("/setup/partition")} icon={faChevronRight} text="Continue"/>
                </div>
            </div>
        </div>
    );
}