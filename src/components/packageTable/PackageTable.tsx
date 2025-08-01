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

const PackageTable = ({ packageData, from, to, loading, compact }: Package) => {
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
                            <th className="table-header text-left">
                            {compact ? 'Freq' : 'Frequency'}

                            </th>
                            <th className="table-header text-center">Status</th>
                            <th className="text-xs capitalize px-2">
                                {compact ? 'No.S' : 'No. of subscribers'}
                            </th>
                            <th className="table-header text-center">Menu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {packageData.slice(from, to).map((pkg, index) => {
                            const drawDateArray =
                                dateConverter(pkg.drawDate, 'YMD-HMS')?.split(',') || [];

                            const drawDate = `${drawDateArray[0]}`;
                            const drawTime = `${drawDateArray[1]}`;

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
