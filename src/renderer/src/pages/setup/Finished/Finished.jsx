import "./styles.sass";
import {faChevronRight, faRefresh} from "@fortawesome/free-solid-svg-icons";
import Button from "@common/components/Button";
import {useNavigate} from "react-router-dom";
import BIOSImage from "./assets/bios.png";
export const Finished = () => {
    const navigate = useNavigate();

    const rebootNow = () => {
        window.electron.ipcRenderer.send("reboot-to-bios");
    }

    return (
        <div className="space-inner finished-page">
            <div className="info-area">
                <h1>Finished!</h1>
                <p>You now may want to change your boot order to boot CLOVER first (if not applied automatically).</p>
                <div className="button-area">
                    <Button icon={faChevronRight} text="Reboot later" onClick={() => navigate("/home/uac-prompt")}></Button>
                    <Button icon={faRefresh} text="Reboot now" onClick={rebootNow}></Button>

                </div>
            </div>
            <img src={BIOSImage} alt="BIOS" />
        </div>
    );
}