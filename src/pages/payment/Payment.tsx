import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import question from '../../assets/question.svg';
import { useEffect, useState } from 'react';
import { paymentOtpRequest } from '../../api/otp';
import { refundPaymentRequest } from '../../api/payment';
import { FaCheck, FaExclamation, FaRegPaperPlane, FaXmark } from 'react-icons/fa6';
import { PATHS } from '../../routes/routes';
import { getCurrentPromo, getDrawInfoById } from '../../api/draws';
import { getNowInTimezone } from '../../utils/validation';

const GRID_KEY_CLASS = 'col-span-1 text-sm text-left font-medium text-secondary';
const GRID_VALUE_CLASS = 'col-span-2 text-sm text-right font-bold';

const RefundMessage = () => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-20 backdrop-blur-[7px] z-50">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-3xl text-green-500">
                <FaCheck />
            </div>
            <p className="mt-5  font-semibold text-secondary text-lg">Refund was successful !</p>
        </div>
    );
};

const Payment = () => {
    const navigate = useNavigate();
    const { status } = useParams();
    const [searchParams] = useSearchParams();
    const total = searchParams.get('total');
    const count = searchParams.get('count');
    const drawID = searchParams.get('drawID');
    const currency = searchParams.get('currency');
    const membershipTireId = searchParams.get('membershipTireId');
    const paymentId = searchParams.get('paymentId');
    const email = searchParams.get('email');
    const entriesCreated = searchParams.get('entriesCreated');
    const multiplier = searchParams.get('multiplier');
    const baseEntries = searchParams.get('baseEntries');

    // Membership success fallback calculations to avoid 0 entries
    const memMultiplier = Math.max(1, Number(multiplier || 1));
    const memBaseEntries = Number(baseEntries);
    const effectiveBaseEntries = !isNaN(memBaseEntries) && memBaseEntries > 0 ? memBaseEntries : 1;
    const memEntriesCreated = Number(entriesCreated);
    const effectiveEntriesCreated = !isNaN(memEntriesCreated) && memEntriesCreated > 0
        ? memEntriesCreated
        : (effectiveBaseEntries * memMultiplier);

    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isCanceled, setIsCanceled] = useState<boolean>(false);
    const [promo, setPromo] = useState<{ multiplier: number; extras?: number; totalEntries?: number } | null>(null);

    useEffect(() => {
        // On success, if it's a draw payment and we know count + drawID, fetch promo breakdown to display
        if (status === 'success' && drawID && count) {
            (async () => {
                try {
                    // Primary: server-side calculation
                    const { data } = await getCurrentPromo(drawID, Number(count));
                    if (data && typeof data.multiplier === 'number') {
                        setPromo({ multiplier: data.multiplier, extras: data.extras, totalEntries: data.totalEntries });
                        return;
                    }
                } catch (_) {
                    // ignore and fallback
                }

                // Fallback: compute using draw timezone + promo periods so user sees correct local-based period
                try {
                    const res = await getDrawInfoById(drawID);
                    const draw = res?.data || {};
                    const tz: string | undefined = draw?.timezone;
                    const nowLocal = getNowInTimezone(tz);
                    const nowKey = String(nowLocal).slice(0, 16);
                    const periods: Array<{ start: string; end: string; multiplier: number }> = Array.isArray(draw?.promoPeriods) ? draw.promoPeriods : [];
                    const active = periods.find(p => (p.start || '').slice(0, 16) <= nowKey && nowKey < (p.end || '').slice(0, 16));
                    const m = active?.multiplier ?? 1;
                    const cnt = Number(count);
                    const totalEntries = Number.isFinite(cnt) ? cnt * m : undefined;
                    setPromo({ multiplier: m, extras: active ? (totalEntries ? totalEntries - cnt : undefined) : undefined, totalEntries });
                } catch (_) {
                    setPromo(null);
                }
            })();
        }
    }, [status, drawID, count]);

    const sendOtp = async () => {
        try {
            setLoading(true);
            if (email) {
                const { status } = await paymentOtpRequest(email);
                if (status === 200) {
                    setIsOtpSent(true);
                    setMessage('');
                    setLoading(false);
                }
            }
        } catch (error: any) {
            console.error(error.response.data.error);
            setMessage(error.response.data.error);
            setLoading(false);
        }
    };

    const refundPayment = async () => {
        try {
            setLoading(true);
            if (paymentId && email) {
                const { data } = await refundPaymentRequest(paymentId, email, otp);
                console.log(data);
                setIsCanceled(data.isCanceled);
                setLoading(false);
            }
        } catch (error: any) {
            console.error(error.response.data.error);
            setMessage(error.response.data.error);
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-3xl text-green-500">
                            <FaCheck />
                        </div>
                        <h2 className="font-bold text-xl mt-4">Payment Successful!</h2>
                        <p className="text-sm text-secondary mt-4 mb-6">
                            Transaction is complete. Please check your inbox/spam folder for your
                            entry tickets. Good luck!
                        </p>

                        <div className="mt-1 grid grid-cols-3 w-full bg-gray-50 p-5 rounded-xl gap-y-3">
                            <p className={GRID_KEY_CLASS}>Total:</p>
                            <p className={GRID_VALUE_CLASS}>
                                {total} {currency}
                            </p>

                            <p className={GRID_KEY_CLASS}>
                                {membershipTireId ? 'Tire ID:' : 'Draw ID:'}
                            </p>
                            <p
                                className={
                                    GRID_VALUE_CLASS +
                                    ' font-normal overflow-hidden overflow-ellipsis'
                                }>
                                {membershipTireId ? membershipTireId : drawID}
                            </p>
                            <p className={GRID_KEY_CLASS}>
                                {membershipTireId ? '' : (count && '')}
                            </p>
                            <p className={GRID_VALUE_CLASS}>
                                {membershipTireId
                                    ? `You got: ${effectiveEntriesCreated} subscriptions`
                                    : (count && `You got: ${promo?.totalEntries ?? Number(count)} subscriptions`)}
                            </p>
                            {drawID && count && promo && promo.multiplier > 1 && (
                                <>
                                    <p className={GRID_KEY_CLASS}></p>
                                    <p className={GRID_VALUE_CLASS + ' text-xs font-normal text-secondary'}>
                                        {Number(count)} × ({promo.multiplier} Promo) = {promo?.totalEntries ?? Number(count) * (promo.multiplier || 1)}
                                    </p>
                                </>
                            )}
                            {membershipTireId && Number(multiplier) > 1 && (
                                <>
                                    <p className={GRID_KEY_CLASS}></p>
                                    <p className={GRID_VALUE_CLASS + ' text-xs font-normal text-secondary'}>
                                        {effectiveBaseEntries} × {memMultiplier} Promotional period = {effectiveEntriesCreated}
                                    </p>
                                </>
                            )}
                        </div>

                        <button className="mt-7 btn btn-primary w-full"
                            onClick={() => navigate(`${PATHS.CUSTOMER_VERIFICATION}?email=${email}`)}
                        >
                            Go to Customer Portal
                        </button>
                        {!membershipTireId && (
                            <button
                                onClick={() => navigate(PATHS.DRAW_INFO.replace(':drawId', drawID || ''))}

                                className="mt-5 btn w-full"
                            >
                                Back to Draws
                            </button>
                        )}

                        <div className="mt-4 text-center">
                            <span className="text-xs text-gray-400">
                                Powered by{' '}
                                <a
                                    href="https://vivaclub.io"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-gray-400 hover:text-gray-500"
                                >
                                    VivaClub
                                </a>
                            </span>
                        </div>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-red-100 text-3xl text-red-500">
                            <FaExclamation />
                        </div>
                        <h2 className="font-medium text-xl mt-6">
                            There was an error processing your payment.
                        </h2>
                    </div>
                );
            case 'cancel':
                return (
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 text-3xl text-yellow-500">
                            <FaXmark />
                        </div>{' '}
                        <h2 className="font-medium text-2xl mt-6">Your payment was canceled.</h2>
                    </div>
                );
            case 'refund':
                return !isOtpSent ? (
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-red-100 text-3xl text-red-500">
                            <FaExclamation />
                        </div>
                        <h2 className="font-medium text-lg mt-6">
                            Are you sure you want to cancel your payment ?!
                        </h2>
                        <div className="flex flex-row justify-center mt-6 w-full">
                            <button
                                className="btn bg-red-600 text-white w-full text-base"
                                onClick={() => sendOtp()}>
                                {loading ? (
                                    <span className="loading loading-dots loading-md items-center"></span>
                                ) : (
                                    'Refund'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div>
                            <div className="flex flex-col justify-center items-center">
                                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 text-3xl text-gray-500">
                                    <FaRegPaperPlane />
                                </div>
                                <p className="text-lg font-bold mt-2">Please check your email!</p>
                                <p className="text-sm font-medium text-gray-500 mb-5">
                                    We've sent a code to {email}
                                </p>
                            </div>

                            <input
                                type="text"
                                placeholder="Enter OTP"
                                className="input input-bordered w-full"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                disabled={loading}
                            />
                            {message !== '' && (
                                <div className="label">
                                    <span className="label-text-alt text-red-500">{message}</span>
                                </div>
                            )}
                            <button
                                type="button"
                                className="btn btn-primary w-full mt-4"
                                onClick={refundPayment}
                                disabled={otp === ''}>
                                {loading ? (
                                    <span className="loading loading-dots loading-md items-center"></span>
                                ) : (
                                    'Verify OTP'
                                )}
                            </button>
                            <p className="text-sm text-gray-600 mt-3">
                                Didn't get the code?{' '}
                                <button className="link mr-1" onClick={() => sendOtp()}>
                                    Click to resend
                                </button>
                            </p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center">
                        <img src={question} width={150} alt="unknown" />
                        <h2 className="font-medium text-2xl mt-6">Unknown status.</h2>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-sm shadow-xl py-10 px-5 rounded-2xl border border-border/30 bg-white">
                {renderContent()}
                {isCanceled && <RefundMessage />}
            </div>
        </div>
    );
};

export default Payment;
