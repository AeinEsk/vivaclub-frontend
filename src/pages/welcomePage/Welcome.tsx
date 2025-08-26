import { useEffect, useState } from 'react';
import { DrawList } from '../../@types/darw';
import { getDrawsList } from '../../api/draws';
import { Link } from 'react-router-dom';
import { getMemberships } from '../../api/packages';
import { Membership } from '../../@types/packageForm';
import DrawTable from '../../components/drawTable/DrawTable';
import PackageTable from '../../components/packageTable/PackageTable';
import StripeAlert from '../../components/alert/StripeAlert';
import { useAuth } from '../../contexts/Auth/AuthProvider';
import { PATHS } from '../../routes/routes';

const Welcome = () => {
    const { currentUser } = useAuth();
    const [loadingDraw, setLoadingDraw] = useState(false);
    const [loadingPackage, setLoadingPackage] = useState(false);
    const [loadingPromoDraw, setLoadingPromoDraw] = useState(false);
    const [drawData, setDrawData] = useState<DrawList[]>([]);
    const [promoDrawData, setPromoDrawData] = useState<DrawList[]>([]);
    const [membership, setMembership] = useState<Membership[]>([]);
    const filters = {
        page: 1,
        pageSize: 7
    };

    useEffect(() => {
        (async () => {
            try {
                setLoadingDraw(true);
                const response = await getDrawsList(filters);
                const allDraws = response?.data?.draws || [];
                // Filter out promotional draws (entryCost = 0) from regular draws
                const regularDraws = allDraws.filter((d: any) => Number(d.entryCost) > 0);
                setDrawData(regularDraws);
                setLoadingDraw(false);
            } catch (error: any) {
                console.error(error.response);
                setLoadingDraw(false);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                setLoadingPackage(true);
                const response = await getMemberships(filters);
                setMembership(response?.data?.memberships);
                setLoadingPackage(false);
            } catch (error: any) {
                console.error(error?.response);
                setLoadingPackage(false);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                setLoadingPromoDraw(true);
                // Fetch all draws and filter client-side by entryCost === 0
                const { data } = await getDrawsList({ page: 1, pageSize: 100 });
                const items: DrawList[] = data?.draws || [];
                const promos = items.filter((d) => Number(d.entryCost) === 0);
                setPromoDrawData(promos.slice(0, 7)); // Take first 7 for display
                setLoadingPromoDraw(false);
            } catch (error: any) {
                console.error(error?.response);
                setLoadingPromoDraw(false);
            }
        })();
    }, []);

    return (
        <>
            {currentUser !== undefined && !currentUser!.isStipeConnected ? (
                <StripeAlert />
            ) : undefined}
            {/* first table start */}
            <div className="table-container mb-5">
                <div className="flex gap-2 justify-between items-center p-4 md:p-6 border-b border-border">
                    <div>
                        <h2 className="text-lg md:text-xl text-left font-semibold mb-1 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            Draws
                        </h2>
                        <p className="text-xs sm:text-sm text-left text-text-secondary">
                            If you need a one-time draw, create it here.
                        </p>
                    </div>
                    <Link to="/profile/create-draw">
                        <button className="add-button">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <span className="text-nowrap">Draw</span>
                        </button>
                    </Link>
                </div>
                {drawData.length !== 0 ? (
                    <>
                        <DrawTable
                            drawData={drawData}
                            from={0}
                            to={20}
                            loading={loadingDraw}
                            compact
                        />
                        <Link
                            to={'/profile/draw-list'}
                            className="inline-block my-3 px-5 py-2 text-xs font-normal text-gray-500 hover:bg-gray-50">
                            See more...
                        </Link>
                    </>
                ) : loadingDraw ? (
                    <div className="flex justify-center items-center z-20 w-full my-4">
                        <span className="loading loading-dots items-center justify-center"></span>
                    </div>
                ) : (
                    <p className="text-center text-base my-4">No Draws Available yet</p>
                )}
            </div>
            {/* first table end */}

            {/* second table start */}
            <div className="table-container mb-5">
                <div className="flex gap-2 justify-between items-center p-4 md:p-6 border-b border-border">
                    <div>
                        <h2 className="text-lg md:text-xl text-left font-semibold mb-1 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            Club Memberships
                        </h2>
                        <p className="text-xs sm:text-sm text-left text-text-secondary">
                            For a recurring club membership draw, create one here.
                        </p>
                    </div>
                    <Link to="/profile/create-package">
                        <button className="add-button">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <span className="text-nowrap">Package</span>
                        </button>
                    </Link>
                </div>
                {membership.length !== 0 ? (
                    <div>
                        <PackageTable
                            packageData={membership}
                            from={0}
                            to={20}
                            loading={loadingPackage}
                            compact
                        />
                        <Link
                            to={'/profile/packages-list'}
                            className="inline-block my-3 px-5 py-2 text-xs font-normal text-gray-500 hover:bg-gray-50">
                            See more...
                        </Link>
                    </div>
                ) : loadingPackage ? (
                    <div className="flex justify-center items-center z-20 w-full my-4">
                        <span className="loading loading-dots items-center justify-center"></span>
                    </div>
                ) : (
                    <p className="text-center text-base my-4">No Packages Available yet</p>
                )}
            </div>
            {/* second table end */}


            {/* promotional draws table start */}
            <div className="table-container mb-5">
                <div className="flex gap-2 justify-between items-center p-4 md:p-6 border-b border-border">
                    <div>
                        <h2 className="text-lg md:text-xl text-left font-semibold mb-1 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            Promotional Draws
                        </h2>
                        <p className="text-xs sm:text-sm text-left text-text-secondary">
                            Free entry draws for audience engagement with QR codes.
                        </p>
                    </div>
                    <Link to={PATHS.CREATE_PROMO_DRAW}>
                        <button className="add-button">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <span className="text-nowrap">Promo Draw</span>
                        </button>
                    </Link>
                </div>
                {promoDrawData.length !== 0 ? (
                    <>
                        <DrawTable
                            drawData={promoDrawData}
                            from={0}
                            to={20}
                            loading={loadingPromoDraw}
                            compact
                            isPromoList
                        />
                        <Link
                            to={PATHS.PROMO_DRAW_LIST}
                            className="inline-block my-3 px-5 py-2 text-xs font-normal text-gray-500 hover:bg-gray-50">
                            See more...
                        </Link>
                    </>
                ) : loadingPromoDraw ? (
                    <div className="flex justify-center items-center z-20 w-full my-4">
                        <span className="loading loading-dots items-center justify-center"></span>
                    </div>
                ) : (
                    <p className="text-center text-base my-4">No Promotional Draws Available yet</p>
                )}
            </div>
            {/* promotional draws table end */}

        </>
    );
};

export default Welcome;
