import React from 'react';
import { FaQuestion } from 'react-icons/fa6';

interface TooltipProps {
    text: string;
    direction?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text, direction = 'tooltip-right' }) => {
    return (
        <div className={`tooltip ${direction} before:w-48 before:text-xs`} data-tip={text}>
            <button
                className="flex items-center justify-center p-1 border border-text-secondary rounded-full h-[14px] w-[14px]"
                type="button">
                <FaQuestion className="text-[8px] text-secondary" />
            </button>
        </div>
    );
};

export default Tooltip;
