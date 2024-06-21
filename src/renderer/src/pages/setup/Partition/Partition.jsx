import "./styles.sass";
import SetupHeader from "@common/components/SetupHeader";
import PartitionItem from "@pages/setup/Partition/components/PartitionItem";
import {useContext, useState} from "react";
import {PartitionContext} from "@common/contexts/PartitionContext";
import Button from "@common/components/Button";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";

export const Partition = () => {
    const [partitions] = useContext(PartitionContext);
    const [selectedPartition, setSelectedPartition] = useState(partitions[0]);
    const navigate = useNavigate();

    const installSelected = () => {
        navigate("/setup/install?disk=" + selectedPartition.disk + "&partition=" + selectedPartition.partition);
    }

    return (
        <div className="space-inner partition-page">
            <SetupHeader title="select installation path" description="Choose the partition where you want to install the bootloader." />

            <div className="partition-list">
                {partitions.map((partition, index) => (
                    <PartitionItem key={index} name={partition.name} path={partition.disk + partition.partition} size={partition.size}
                                   active={partition === selectedPartition} onClick={() => setSelectedPartition(partition)} />
                ))}
            </div>

            <div className="button-group">
                <Button text="Install" icon={faChevronRight} onClick={installSelected} />
            </div>

        </div>
    );
}