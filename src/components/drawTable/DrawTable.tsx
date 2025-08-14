import React from 'react';
import { DrawList } from '../../@types/darw';
import { dateConverter } from '../dateConverter/DateConverter';
import { FaCheck } from 'react-icons/fa6';
import { FaBan } from 'react-icons/fa6';
import { FaRegCalendarXmark } from 'react-icons/fa6';
import MenuCol from './MenuCol';

interface Draw {
    drawData: DrawList[];
    from: number;
    to: number;
    loading: boolean;
    compact?: boolean | false;
}

const DrawTable: React.FC<Draw> = ({ drawData, from, to, loading, compact }) => {
    const today = new Date();
    const formattedDate = today.toISOString();
    console.log(from, to);
    const handleStatus = (date: string) => {
        if (date > formattedDate) {
            return true;
        } else return false;
    };

    return (
        <div>
            <div className="w-full">
                {loading && (
                    <div className="flex justify-center items-center absolute z-20 w-full mt-14">
                        <span className="loading loading-dots items-center justify-center"></span>
                    </div>
                )}
                <table className="min-w-full divide-y divide-border">
                    <thead>
                        <tr>
                            <th className="table-header text-left">Date</th>
                            <th className="table-header text-left">Name</th>
                            <th className="table-header text-center">
                                {compact ? 'No.P' : 'No. of Partic'}
                            </th>
                            <th className="table-header text-center">Status</th>
                            {!compact && <th className="table-header text-left">Prize</th>}
                            <th className="table-header text-center">Menu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {drawData.slice(0, 10).map((draw, index) => {
                            const dateString = dateConverter(draw.runAt, 'YMD-HMS');
                            const [date, time] = dateString.split(',');

                            return (
                                <tr className="table-row" key={index}>
                                    <td className="table-cell">
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium">{date || 'N/A'}</span>
                                            <span className="text-text-secondary text-xs">
                                                {time || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-3">
                                            <div className="hidden lg:block">
                                                <div className="draw-icon">
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className="font-medium">{draw.name}</span>
                                        </div>
                                    </td>
                                    <td className="table-cell text-center">
                                        <span className="status-badge">{draw.noOfPartic}</span>
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex justify-center">
                                            {compact ? (
                                                <div
                                                    className="tooltip tooltip-top"
                                                    data-tip={
                                                        draw.deactivatedAt
                                                            ? 'Cancelled'
                                                            : handleStatus(draw.runAt)
                                                                ? ((draw.ticketCap ?? 0) > 0 && draw.noOfPartic >= (draw.ticketCap ?? 0) ? 'Full Capacity' : 'Published')
                                                                : 'Expired'
                                                    }>
                                                    <div className={`status-icon-wrapper ${(draw.deactivatedAt
                                                        ? false
                                                        : ((draw.ticketCap ?? 0) > 0 && draw.noOfPartic >= (draw.ticketCap ?? 0)))
                                                        ? 'inactive'
                                                        : (handleStatus(draw.runAt) ? 'active' : 'inactive')
                                                        }`}>
                                                        {draw.deactivatedAt ? (
                                                            <FaBan className="status-icon" />
                                                        ) : handleStatus(draw.runAt) ? (
                                                            <FaCheck className="status-icon" />
                                                        ) : (
                                                            <FaRegCalendarXmark className="status-icon" />
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className={`badge badge-outline ${draw.deactivatedAt ? 'badge-error' : handleStatus(draw.runAt) ? 'badge-success' : 'badge-warning'} font-normal text-xs`}>
                                                    {draw.deactivatedAt
                                                        ? 'Cancelled'
                                                        : handleStatus(draw.runAt)
                                                            ? ((draw.ticketCap ?? 0) > 0 && draw.noOfPartic >= (draw.ticketCap ?? 0) ? 'Full Capacity' : 'Published')
                                                            : 'Expired'}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    {!compact && (
                                        <td className="table-cell text-left text-xs">
                                            {draw.prize}
                                        </td>
                                    )}
                                    <MenuCol drawId={draw.id} />
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DrawTable;
