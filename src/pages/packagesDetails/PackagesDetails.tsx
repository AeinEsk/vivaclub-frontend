import { useNavigate, useParams } from 'react-router-dom';
import { PackageCard } from '../../components/packageCard';
import { useEffect, useState } from 'react';
import { Membership, Tier } from '../../@types/packageForm';
import { cancelPackage, getMembershipDetailsById } from '../../api/packages';
import Loading from '../../components/loading/Loading';
import Popup from '../../components/alert/Popup';

const PackagesDetails = () => {
    const { packageId } = useParams<{ packageId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [memberships, setMemberships] = useState<Membership>();
    const [tier, setTier] = useState<Tier[] | undefined>([]);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showPopup, setShowPopup] = useState({
        state: false,
        text: '',
        packageId: ''
    });

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                if (packageId) {
                    const { data } = await getMembershipDetailsById(packageId);
                    setMemberships(data);
                    setTier(data?.tiers);
                    setLoading(false);
                } else {
                    console.error('No PackageId Found!');
                }
            } catch (error: any) {
                console.error(error.response);
                setLoading(false);
            }
        })();
    }, []);

    const closePopup = (): void => {
        setShowPopup({ state: false, text: '', packageId: '' });
    };

    const handleCancelDraw = async (packageId: string) => {
        try {
            setCancelLoading(true);
            await cancelPackage(packageId);
            setShowPopup({ state: false, text: '', packageId: '' });
            setCancelLoading(false);
            navigate(-1);
        } catch (error: any) {
            setCancelLoading(false);
            console.error(error.response);
        }
    };

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <h1 className="mb-5 w-full max-w-sm lg:max-w-[50%] text-left text-primary font-bold text-xl">
                        Package Info
                    </h1>

                    <div className="w-full max-w-sm lg:max-w-[50%]">
                        {tier?.map((tier, index) => (
                            <div key={index}>
                                <PackageCard
                                    title={tier.name}
                                    frequency={memberships?.frequency}
                                    subtitle={`${tier.recurringEntry}`}
                                    content={tier.highlight}
                                    price={tier.price}
                                    currency={tier.currency}
                                    drawDate={memberships?.nextDrawIn}
                                    purchase={false}
                                    numberOfTicket={`${tier.numberOfTicket}`}
                                    deactivatedAt={tier.deactivatedAt}
                                    showCancelAlert={true}
                                />
                            </div>
                        ))}
                    </div>

                    {memberships && !memberships?.deactivatedAt && (
                        <div
                            className="flex justify-center card bg-red-400 text-white font-bold h-12 p-0 mt-5 w-full max-w-sm lg:max-w-[50%]"
                            onClick={() =>
                                setShowPopup({
                                    state: true,
                                    packageId: memberships.id,
                                    text: 'Are you sure you want to cancel this Package? All entries will be refunded if the Package is canceled.'
                                })
                            }>
                            Cancel Package
                        </div>
                    )}

                    <Popup
                        isOpen={showPopup.state}
                        text={showPopup.text}
                        button1={{
                            name: 'Confirm',
                            onClick() {
                                handleCancelDraw(showPopup.packageId);
                            },
                            mode: 'btn-error w-24 text-white',
                            loading: cancelLoading
                        }}
                        button2={{
                            name: 'Cancel',
                            onClick: closePopup,
                            mode: 'btn-primary w-24'
                        }}
                    />
                </div>
            )}
        </>
    );
};

export default PackagesDetails;
