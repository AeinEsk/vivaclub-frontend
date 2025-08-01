import { useAuth } from '../../contexts/Auth/AuthProvider';
import InfoBtn from '../../components/infoButton/InfoBtn';
import React, { useEffect, useState } from 'react';
import { getMemberships } from '../../api/packages';
import Loading from '../../components/loading/Loading';
import { getDrawsList } from '../../api/draws';
import { PATHS } from '../../routes/routes';
import { FaCube } from 'react-icons/fa6';
import { FaAngleRight } from 'react-icons/fa6';
import { FaListCheck } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { FaPlaneCircleCheck } from 'react-icons/fa6';
import { FaGear } from 'react-icons/fa6';
import { FaRegEnvelope } from 'react-icons/fa6';
import { FaRegCalendar } from 'react-icons/fa6';
import { FaRegClock } from 'react-icons/fa6';
import userSVG from '../../assets/square-user-round.svg';


interface CollapseItemsProps {
    label: string;
    value: string | boolean | undefined;
}

const CollapseItems: React.FC<CollapseItemsProps> = ({ label, value }) => {
    return (
        <div className="text-primary font-normal flex flex-row items-center justify-between mb-2">
            <p>{label} :</p>
            <p className="capitalize text-secondary">{value}</p>
        </div>
    );
};

const Profile = () => {
    const navigate = useNavigate();
    const { currentUser, handleLogout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [packageNum, setPackageNum] = useState();
    const [drawNum, setDrawNum] = useState();
    const filters = {
        page: 1,
        pageSize: 7
    };

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const { data } = await getMemberships(filters);
                setPackageNum(data?.totalRecords);
                setLoading(false);
            } catch (error: any) {
                console.error(error.response);
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const { data } = await getDrawsList(filters);
                setDrawNum(data?.totalRecords);
                setLoading(false);
            } catch (error: any) {
                console.error(error?.response);
                setLoading(false);
            }
        })();
    }, []);

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <div className="flex items-center justify-center">
                    <div className="w-full max-w-sm">
                        <div className="flex flex-row gap-5 justify-start mt-6 ">
                            <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600">
                            <img
                                    src={
                                        currentUser?.imageUrl !== null
                                            ? `${currentUser?.imageUrl}`
                                            : userSVG
                                    }
                                />

                            </div>

                            <article className="prose text-start mt-4">
                                <h3 className="mb-0 font-bold">{currentUser?.email}</h3>
                                <p className="mb-0 text-sm">Personal Account</p>
                            </article>
                        </div>

                        {/* Start - Your Packages */}
                        <div className="mt-5 flex gap-5 justify-between items-center">
                            <div
                                onClick={() => navigate(PATHS.PACKAGE_LIST)}
                                className="w-[50%] border border-border rounded-xl p-2 hover:cursor-pointer bg-white">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-secondary">
                                        Your Packages
                                    </span>
                                    <span className="mr-[2px] text-sm font-bold text-primary">
                                        {packageNum}
                                    </span>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <FaCube className="text-secondary text-sx" />
                                        <span className="text-secondary text-xs">View all</span>
                                    </div>
                                    <div>
                                        <FaAngleRight className="text-secondary text-xs" />
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => navigate(PATHS.DRAW_LIST)}
                                className="w-[50%] border border-border rounded-xl p-2 hover:cursor-pointer bg-white">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-secondary">
                                        Your Draws
                                    </span>
                                    <span className="mr-[2px] text-sm font-bold text-primary">
                                        {drawNum}
                                    </span>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <FaListCheck className="text-secondary text-[12px]" />
                                        <span className="text-secondary text-xs">View list</span>
                                    </div>
                                    <div>
                                        <FaAngleRight className="text-secondary text-xs" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* End - Your Packages */}

                        <div className="mt-5 border border-border rounded-xl overflow-hidden bg-white">
                            <InfoBtn
                                title="Onboarding"
                                data={`${currentUser?.isStipeConnected}`}
                                Icon={<FaPlaneCircleCheck className="text-primary/80" />}
                            />
                            <InfoBtn
                                title="Account Id"
                                data={`${currentUser?.stripeId}`}
                                className="truncate"
                                Icon={<FaGear className="text-primary/80" />}
                            />
                            <InfoBtn
                                title="Email"
                                data={`${currentUser?.stripeData?.email}`}
                                className="truncate"
                                Icon={<FaRegEnvelope className="text-primary/80" />}
                            />
                            <InfoBtn
                                title="Currently Due"
                                data={`${currentUser?.stripeData?.currentlyDue}`}
                                className="truncate"
                                Icon={<FaRegCalendar className="text-primary/80" />}
                            />
                            <InfoBtn
                                title="Past Due"
                                data={`${currentUser?.stripeData?.pastDue}`}
                                className="truncate"
                                Icon={<FaRegClock className="text-primary/80" />}
                            />

                            <div className="collapse collapse-arrow bg-white">
                                <input type="checkbox" name="my-accordion-2" />
                                <div className="collapse-title flex gap-2 items-center justify-left">
                                    <div className="w-[38px] h-[38px] flex items-center shrink-0 justify-center bg-primary/20 rounded-xl">
                                        <FaGear className="text-primary/80" />
                                    </div>
                                    <div className="text-sm font-normal">Capabilities</div>
                                </div>

                                <div className="collapse-content text-sm text-base-content">
                                    <CollapseItems
                                        label={'Bancontact Payments'}
                                        value={
                                            currentUser?.stripeData?.capabilities
                                                .bancontact_payments
                                        }
                                    />
                                    <CollapseItems
                                        label={'Blik Payments'}
                                        value={currentUser?.stripeData?.capabilities.blik_payments}
                                    />
                                    <CollapseItems
                                        label={'Card Payments'}
                                        value={currentUser?.stripeData?.capabilities.card_payments}
                                    />
                                    <CollapseItems
                                        label={'eps Payments'}
                                        value={currentUser?.stripeData?.capabilities.eps_payments}
                                    />
                                    <CollapseItems
                                        label={'Klarna Payments'}
                                        value={
                                            currentUser?.stripeData?.capabilities.klarna_payments
                                        }
                                    />
                                    <CollapseItems
                                        label={'Link Payments'}
                                        value={currentUser?.stripeData?.capabilities.link_payments}
                                    />

                                    <CollapseItems
                                        label={'p24 Payments'}
                                        value={currentUser?.stripeData?.capabilities.p24_payments}
                                    />
                                    <CollapseItems
                                        label={'Revolut Pay Payments'}
                                        value={
                                            currentUser?.stripeData?.capabilities
                                                .revolut_pay_payments
                                        }
                                    />
                                    <CollapseItems
                                        label={'Transfers'}
                                        value={currentUser?.stripeData?.capabilities.transfers}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="">
                            <button
                                className="btn bg-red-600 hover:bg-red-100 transition-all duration-200 text-white w-full font-semibold text-left mt-10"
                                onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;
