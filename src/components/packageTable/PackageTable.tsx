import React from 'react';
import { Membership } from '../../@types/packageForm';
import { dateConverter } from '../dateConverter/DateConverter';
import MenuCol from './MenuCol';

interface Package {
    packageData: Membership[];
    from: number;
    to: number;
    loading: boolean;
    compact?: boolean | false;
}

const PackageTable = ({ packageData, loading }: Package) => {
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
                            <th className="table-header text-left">Name</th>
                            <th className="table-header text-left">Frequency</th>
                            <th className="table-header text-center">Status</th>
                            <th className="table-header text-center">Menu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {packageData.slice(0, 10).map((pkg, index) => {
                            const drawDateArray =
                                dateConverter(pkg.drawDate, 'YMD-HMS')?.split(',') || [];
                            const drawDate = `${drawDateArray[0]}${drawDateArray[1]}`;
                            const drawTime = `${drawDateArray[2]}`;

                            return (
                                <tr className="table-row" key={index}>
                                    <td className="table-cell">
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium">{drawDate}</span>
                                            <span className="text-text-secondary text-xs">
                                                {drawTime}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="table-cell text-left">{pkg.name}</td>
                                    <td className="table-cell text-left">{pkg.frequency}</td>
                                    <td className="table-cell text-center">
                                        <span className="status-badge">{pkg.membersCount}</span>
                                    </td>
                                    <MenuCol membershipId={pkg.id} />
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PackageTable;
