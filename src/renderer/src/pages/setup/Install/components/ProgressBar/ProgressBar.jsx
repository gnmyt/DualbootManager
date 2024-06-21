import "./styles.sass";

export const ProgressBar = ({progress}) => {
    return (
        <div className="progress-bar">
            <div className="progress" style={{width: `${progress}%`}} />
        </div>
    );
}