interface ButtonProps {
    name: string;
    onClick: () => void;
    mode?: string;
    loading?: boolean | false;
}

interface State {
    text: string;
    isOpen: boolean;
    button1?: ButtonProps;
    button2?: ButtonProps;
}

const Popup: React.FC<State> = ({ text, isOpen, button1, button2 }) => {
    if (!isOpen) return null;
    return (
        <div className="modal modal-open" role="dialog">
            <div className="modal-box">
                <h3 className="text-lg font-bold">Warning !</h3>
                <p className="py-4 whitespace-pre-wrap">{text}</p>
                <div className="modal-action flex justify-center">
                    {button1 && (
                        <button
                            className={`btn btn-sm ${button1.mode || ''}`}
                            onClick={button1.onClick}
                            disabled={button1.loading}>
                            {button1.loading ? (
                                <span className="loading loading-dots loading-md items-center"></span>
                            ) : (
                                `${button1.name}`
                            )}
                        </button>
                    )}
                    {button2 && (
                        <button
                            className={`btn btn-sm ${button2.mode || ''}`}
                            disabled={button2.loading}
                            onClick={button2.onClick}>
                            {button2.loading ? (
                                <span className="loading loading-dots loading-md items-center"></span>
                            ) : (
                                `${button2.name}`
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Popup;
