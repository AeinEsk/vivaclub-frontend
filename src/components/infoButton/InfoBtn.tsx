import React from 'react';
import { useNavigate } from 'react-router-dom';

interface InfoBtnProps {
    title: string;
    data?: string | number;
    path?: string;
    Icon?: JSX.Element;
    className?: string;
}

const InfoBtn: React.FC<InfoBtnProps> = ({ title, data, path, Icon, className }) => {
    const navigate = useNavigate();

    return (
        <div
            className={`flex items-center gap-2 bg-white px-4 py-3 border-b border-border ${
                path ? 'cursor-pointer' : ''
            }`}
            onClick={() => path && navigate(path)}>
            <div className="w-[38px] h-[38px] flex items-center shrink-0 justify-center bg-primary/20 rounded-xl">
                {Icon}
            </div>
            <div className="text-sm text-left min-w-[120px]">
                <div className="font-normal">{title}</div>
                <div
                    className={`font-light text-secondary overflow-hidden overflow-ellipsis ${className}`}>
                    {data}
                </div>
            </div>
        </div>
    );
};

export default InfoBtn;
