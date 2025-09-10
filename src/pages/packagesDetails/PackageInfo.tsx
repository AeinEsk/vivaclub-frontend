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
                            {thePackage?.tiers?.map((tier, index) => {
                                const hasCustomTerms = !!(thePackage as any)?.termsHtml && String((thePackage as any).termsHtml).trim().length > 0;
                                const termsLink = hasCustomTerms && packageId
                                    ? `/terms?membershipId=${packageId}`
                                    : '/terms';
                                // Compute current promo multiplier from membership promo periods
                                const promos = (thePackage as any)?.promoPeriods as Array<{ start: string; end: string; multiplier: number }> | undefined;
                                // Use selected timezone to determine active period; normalize both sides to timezone key
                                const tz = (thePackage as any)?.timezone as string | undefined;
                                const toKey = (val?: string) => {
                                    if (!val) return '';
                                    const s = String(val);
                                    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) return s.slice(0, 16);
                                    try {
                                        const d = new Date(s);
                                        const formatted = new Intl.DateTimeFormat('sv-SE', {
                                            timeZone: tz || Intl.DateTimeFormat().resolvedOptions().timeZone,
                                            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                        }).format(d);
                                        return formatted.replace(' ', 'T');
                                    } catch { return s.slice(0, 16); }
                                };
                                const nowKey = toKey(new Date().toISOString());
                                const activePromo = Array.isArray(promos)
                                    ? promos.find(p => toKey(p.start) <= nowKey && nowKey < toKey(p.end))
                                    : undefined;
                                const multiplier = activePromo?.multiplier ?? 1;
                                const baseEntries = Number(tier.recurringEntry ?? 0);
                                const totalEntries = baseEntries * multiplier;
                                return (
                                    <div key={index}>
                                        <PackageCard
                                            title={tier.name}
                                            price={tier.price}
                                            subtitle={`Recurring Entry: ${tier.recurringEntry} `}
                                            numberOfTicket={`Number of Ticket: ${tier.numberOfTicket}`}
                                            frequency={`Frequency : ${tier.frequency}`}
                                            currency={tier.currency}
                                            drawDate={thePackage?.nextDrawIn}
                                            content={tier.highlight}
                                            deactivatedAt={tier.deactivatedAt}
                                            purchase={!tier.deactivatedAt}
                                            termsLink={termsLink}
                                            entriesPreview={
                                                <>
                                                    <span className="font-medium">You will get: {totalEntries} subscriptions</span> 
                                                    {multiplier > 1 && (
                                                        <div className="text-[11px] text-gray-500">
                                                            {baseEntries} × ({multiplier} Promo) = {totalEntries}
                                                        </div>
                                                    )}
                                                </>
                                            }
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
                                );
                            })}
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
