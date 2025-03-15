import { useEffect, useState } from 'react';
import Loading from '../../components/loading/Loading';
import { useNavigate, useParams } from 'react-router-dom';
import { getMembershipById } from '../../api/packages';
import { PackageFormData } from '../../@types/packageForm';
import { PackageCard } from '../../components/packageCard';

const PackageInfo = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { packageId } = useParams<{ packageId: string }>();
    const [thePackage, setThePackage] = useState<PackageFormData | null>(null);
    const [error, setError] = useState({
        message: '',
        state: false
    });

    useEffect(() => {
        (async () => {
            if (packageId) {
                try {
                    setLoading(true);
                    setError({ message: '', state: false });
                    const response = await getMembershipById(packageId);
                    if (response.data) {
                        setThePackage(response?.data);
                    } else {
                        setError({ message: 'There is no Package with this ID.', state: true });
                    }
                    setLoading(false);
                } catch (err: any) {
                    setError({ message: err.response.data.error, state: true });
                    setLoading(false);
                }
            }
        })();
    }, []);
    return (
        <div>
            {!error.state ? (
                loading ? (
                    <Loading />
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <h1 className="mb-5 w-full max-w-sm lg:max-w-[50%] text-left text-primary font-bold text-xl">
                            Package Info
                        </h1>
                        <div className="w-full max-w-sm lg:max-w-[50%]">
                            {thePackage?.tiers?.map((tier, index) => (
                                <div key={index}>
                                    <PackageCard
                                        title={tier.name}
                                        price={tier.price}
                                        subtitle={`Recurring Entry: ${tier.recurringEntry} `}
                                        chanceOfWin={`Chance of win : ${tier.chanceOfWin}`}
                                        frequency={`Frequency : ${tier.frequency}`}
                                        currency={tier.currency}
                                        drawDate={thePackage?.nextDrawIn}
                                        content={tier.highlight}
                                        deactivatedAt={tier.deactivatedAt}
                                        purchase={!tier.deactivatedAt}
                                        purchaseFunc={() => {
                                            const totalCost = tier.price;
                                            const currency = tier.currency;
                                            const tireId = tier.id;
                                            const mode = 'package';
                                            navigate('/total', {
                                                state: { mode, tireId, totalCost, currency }
                                            });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ) : (
                <div className="text-lg font-normal text-neutral">
                    <p>{error.message}</p>
                </div>
            )}
        </div>
    );
};

export default PackageInfo;
