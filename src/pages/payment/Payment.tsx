import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import question from '../../assets/question.svg';
import { useState } from 'react';
import { paymentOtpRequest } from '../../api/otp';
import { refundPaymentRequest } from '../../api/payment';
import { FaCheck, FaExclamation, FaRegPaperPlane, FaXmark } from 'react-icons/fa6';
import { PATHS } from '../../routes/routes';

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

    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isCanceled, setIsCanceled] = useState<boolean>(false);

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
                            <p className={GRID_KEY_CLASS}>{count && 'Tickets:'}</p>
                            <p className={GRID_VALUE_CLASS}>{count && count}</p>
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
