import { FaChevronDown, FaChevronUp, FaXmark } from 'react-icons/fa6';
import { useState } from 'react';

interface AccordionProps {
    name: string;
    price: number;
    chanceOfWin: number;
    recurringEntry: number;
    highlight?: string;
    onDelete: (e?: React.MouseEvent) => void;
}

const AccordionPackage: React.FC<AccordionProps> = ({
    name,
    price,
    chanceOfWin,
    recurringEntry,
    highlight,
    onDelete
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-3 border border-gray-200 rounded-xl overflow-hidden">
            <div 
                className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between flex-1 mr-4">
                    <div>
                        <h3 className="font-medium text-primary">{name}</h3>
                        <p className="text-sm text-gray-600">AUD {price}</p>
                    </div>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(e);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                    <FaXmark className="w-4 h-4" />
                </button>
            </div>

            {isOpen && (
                <div className="p-4 bg-white">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Number of Tickets:</span>
                            <span className="font-medium">{chanceOfWin}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Recurring Entry:</span>
                            <span className="font-medium">{recurringEntry}</span>
                        </div>
                        {highlight && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Highlight:</span>
                                <span className="font-medium">{highlight}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccordionPackage;
