import React from 'react';
import { cardProps } from '../../@types/packageCard';
import ConvertTextToList from '../convertTextToList/ConvertTextToList';
import { dateConverter } from '../dateConverter/DateConverter';
import { FaDollarSign, FaRegClock } from 'react-icons/fa6';
import { FaRegCalendar } from 'react-icons/fa6';
import { FaChartLine } from 'react-icons/fa6';
import Alert from '../alert/Alert';

const PackageCard: React.FC<cardProps> = ({
    title,
    subtitle,
    content,
    price,
    purchaseFunc,
    purchase,
    chanceOfWin,
    deactivatedAt,
    drawDate,
    frequency,
    currency,
    showCancelAlert = false
}) => {
    return (
        <div className="card w-full mb-4 shadow-xl py-5 px-5 rounded-2xl border border-border/30 bg-white">
            <div className="card-body p-0">
                <div className="flex justify-between">
                    <div className="flex flex-col">
                        <span className="text-primary font-bold text-left">{title}</span>
                        <div className={`my-1 flex gap-1 items-center text-sm ${
                            deactivatedAt 
                                ? 'text-red-600 bg-red-50' 
                                : 'text-green-600 bg-green-50'
                        } px-2 py-1 rounded-2xl`}>
                            <div className={`badge ${
                                deactivatedAt ? 'bg-red-500' : 'bg-green-500'
                            } badge-xs`}></div>
                            <span>{deactivatedAt ? 'Deactivated' : 'Active'}</span>
                        </div>
                    </div>
                    <span className="flex flex-col items-end text-primary text-lg font-bold">
                        <span>
                            {currency} {price}
                        </span>
                        <div className="mb-1 flex gap-1 items-center text-sm text-secondary font-normal">
                            <FaRegClock />
                            <span>{frequency}</span>
                        </div>
                    </span>
                </div>

                <div className="mt-3 grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <div className="flex flex-col items-start gap-2 bg-gray-50 p-5 rounded-xl">
                        <div className="flex items-center gap-2 text-base text-primary">
                            <FaRegCalendar />
                            <span>Recurring Entry</span>
                        </div>
                        <div className="">{subtitle}</div>
                    </div>

                    <div className="flex flex-col items-start gap-2 bg-gray-50 p-5 rounded-xl">
                        <div className="flex items-center gap-2 text-base text-primary">
                            <FaChartLine />
                            <span>Win Chance</span>
                        </div>
                        <div className="">{chanceOfWin}</div>
                    </div>

                    <div className="flex flex-col items-start gap-2 bg-gray-50 p-5 rounded-xl">
                        <div className="flex items-center gap-2 text-base text-primary">
                            <FaDollarSign />
                            <span>Next Draw</span>
                        </div>
                        <div className="">
                            {drawDate && dateConverter(drawDate, 'YMD-HMS', 'short')}
                        </div>
                    </div>
                </div>

                {content && (
                    <>
                        <h4 className="mt-5 text-left font-bold">Package Description</h4>
                        <div className="mt-2 text-sm bg-gray-50 p-5 rounded-xl">
                            <ConvertTextToList text={content} />
                        </div>
                    </>
                )}

                {showCancelAlert && (
                    <div className="my-5">
                        <Alert
                            message={
                                'If you cancel this package, current members will still be eligible for the upcoming draw. No members will be charged for the next subscription period, and the subscription page will be deactivated.'
                            }
                            type="simple-outline"
                        />
                    </div>
                )}

                {purchase ? (
                    <div className="card-actions justify-center content-center mt-6">
                        <button
                            className="btn btn-primary w-full text-sm font-medium text-white"
                            onClick={purchaseFunc}>
                            Purchase Now
                        </button>
                        <div className="mt-2 text-xs">
                            <p className="text-secondary">Cancel anytime</p>
                            <a
                                href="https://vivaclub.io/terms-conditions"
                                target="_blank"
                                className="block mt-1 text-primary">
                                Terms and Conditions
                            </a>
                        </div>
                    </div>
                ) : (
                    <div>
                        {deactivatedAt && (
                            <button className="btn btn-sm btn-error w-full text-sm font-medium text-white mt-6">
                                Deactivated at: {deactivatedAt}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackageCard;
