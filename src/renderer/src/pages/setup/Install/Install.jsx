import "./styles.sass";
import SetupHeader from "@common/components/SetupHeader";
import {useContext, useEffect, useState} from "react";
import {PartitionContext} from "@common/contexts/PartitionContext";
import {motion, AnimatePresence} from "framer-motion";
import CloverImage from "./assets/clover.png";
import KofiImage from "./assets/kofi.png";
import ProgressBar from "@pages/setup/Install/components/ProgressBar";
import {useNavigate, useSearchParams} from "react-router-dom";

const slides = [
    {
        key: "slide-0",
        image: CloverImage,
        description: <>This project uses the Clover Bootloader under the hood. With this project, I
            wanted to make configuring it as simple as clicking a few buttons.</>
    },
    {
        key: "slide-1",
        image: KofiImage,
        description: <>This project is completely free and open source. If you want to support this work, feel free to
            star this project or donate :)</>
    }
];

const slideVariants = {
    enter: {x: '100%', opacity: 0},
    center: {x: 0, opacity: 1},
    exit: {x: '-100%', opacity: 0},
};

export const Install = () => {
    const [partitions] = useContext(PartitionContext);
    const [slideShown, setSlideShown] = useState(1);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState("Downloading CloverBootloader from GitHub");
    const navigate = useNavigate();

    const [query] = useSearchParams();
    const disk = query.get("disk");
    const partition = query.get("partition");

    const startProgressTimer = (minProgress, maxProgress) => setInterval(() =>
        setProgress(previous => Math.min(previous + Math.random() * 5, maxProgress)), 1000);

    const runStep = async (startProgress, endProgress, stepMessage, invokeMessage, invokeArgs = []) => {
        setCurrentStep(stepMessage);
        const progressInterval = startProgressTimer(startProgress, endProgress);
        try {
            await window.electron.ipcRenderer.invoke(invokeMessage, ...invokeArgs);
        } catch (error) {
            console.error("Error during installation step: ", error);
            navigate("/setup/partition");
        }
        clearInterval(progressInterval);
        setProgress(endProgress);

        return true;
    };

    const runInstallationSteps = async () => {
        const selectedPartition = partitions.find(part => part.disk === disk && part.partition === parseInt(partition));
        if (!selectedPartition) {
            navigate("/setup/partition");
            return;
        }

        await runStep(0, 20, "Downloading CloverBootloader from GitHub", "download-clover");
        await runStep(20, 70, "Downloading CloverThemes from GitHub", "download-themes");
        await runStep(70, 90, "Deleting invalid themes", "delete-invalid-themes");
        await runStep(90, 90, "Installing CloverBootloader", "install-clover", [disk, partition]);

        setProgress(100);
        console.log("Installation finished");
    };

    useEffect(() => {
        const stepRunner = setTimeout(() => runInstallationSteps(), 1000);

        const interval = setInterval(() => {
            setSlideShown(previous => (previous + 1) % slides.length);
        }, 7000);

        setProgress(0);

        return () => {
            clearInterval(interval);
            clearTimeout(stepRunner);
        }
    }, []);

    useEffect(() => {
        if (progress >= 100) {
            navigate("/setup/finished");
        }
    }, [progress]);

    return (
        <div className="space-inner install-page">
            <SetupHeader title="installing assets" description="Please don’t turn off your computer"/>
            <div className="slides">
                <AnimatePresence initial={false}>
                    {slides.map((slide, index) => index === slideShown && (
                            <motion.div key={slide.key} initial="enter" animate="center" exit="exit"
                                        variants={slideVariants} transition={{duration: 0.5}} className="slide">
                                <img src={slide.image} alt="slide"/>
                                <p>{slide.description}</p>
                            </motion.div>
                        )
                    )}
                </AnimatePresence>
            </div>
            <ProgressBar progress={progress}/>
            <p className="current-step">{currentStep}</p>
        </div>
    );
}
