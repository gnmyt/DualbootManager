import "./styles.sass";

export const SetupHeader = ({title, description}) => {
    return (
        <div className="setup-header">
            <h1>{title}</h1>
            <p>{description}</p>
        </div>
    );
}