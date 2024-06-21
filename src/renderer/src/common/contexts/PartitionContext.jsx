import {createContext, useState} from "react";

export const PartitionContext = createContext([]);

export const PartitionProvider = ({children}) => {
    const [partitions, setPartitions] = useState([]);

    return (
        <PartitionContext.Provider value={[partitions, setPartitions]}>
            {children}
        </PartitionContext.Provider>
    );
}