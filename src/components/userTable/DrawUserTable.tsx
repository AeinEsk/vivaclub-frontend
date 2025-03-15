import React from 'react';
import { dateConverter } from '../dateConverter/DateConverter';

interface UserInfo {
    ownerEmail: string;
    ticketCount: string;
    latestCreatedAt: string;
}

interface TableData {
    userInfo: UserInfo[];
    loading: boolean;
}

const DrawUserTable: React.FC<TableData> = ({ userInfo, loading }) => {
    return (
        <div>
            <div className="overflow-x-auto rounded-lg relative">
                {loading ? (
                    <div className="flex justify-center items-center absolute z-20 w-full mt-14">
                        <span className="loading loading-dots items-center justify-center"></span>
                    </div>
                ) : undefined}
                <table className="table table-zebra border-separate	w-full rounded-lg bg-white border mb-8">
                    {/* head */}
                    <thead className="bg-slate-200">
                        <tr className="text-sm font-medium text-black">
                            <th className="capitalize pl-2 pr-11">Email</th>
                            <th className="capitalize pl-1 pr-1">No. Tickets</th>
                            <th className="capitalize pl-2 pr-2">Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* rows */}
                        {userInfo.map((draw, index) => (
                            <tr key={index}>
                                <td className="pl-2 pr-2 text-xs">{draw.ownerEmail}</td>
                                <td className="text-xs">{draw.ticketCount}</td>
                                <td className=" font-normal text-xs pl-2 pr-1">
                                    {dateConverter(draw.latestCreatedAt, 'DMY', 'short')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DrawUserTable;
