type textProp = {
    text: string;
};

const ConvertTextToList: React.FC<textProp> = ({ text }) => {
    const lines = text.split('\n');
    return (
        <div>
            {lines.map((line, index) =>
                line.trim().startsWith('-') || line.trim().startsWith('.') ? (
                    <div key={index}>
                        <ul>
                            <li key={index} className="font-medium text-sm text-left">
                                {'• ' + line.slice(1)}
                            </li>
                        </ul>
                    </div>
                ) : (
                    <ul key={index}>
                        <li key={index} className="text-left">
                            {line}
                        </li>
                    </ul>
                )
            )}
        </div>
    );
};

export default ConvertTextToList;
