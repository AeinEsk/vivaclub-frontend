import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../routes/routes';
import { createStripe } from '../../api/auth';

interface state {
    showPopup: boolean;
}
const StripePopup: React.FC<state> = ({ showPopup }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleStripe = async () => {
        setLoading(true);
        try {
            const response = await createStripe();
            window.location.replace(response?.data?.url);
        } catch (err) {
            setLoading(false);
            console.error(err);
        }
    };

    return (
        <div>
            <input
                type="checkbox"
                id="my_modal_6"
                className="modal-toggle"
                checked={showPopup}
                readOnly
            />
            <div className="modal" role="dialog">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">Stripe Connection Required !</h3>
                    <p className="py-2">You need to connect to Stripe to access this page.</p>
                    <div className="modal-action flex justify-center">
                        <button onClick={handleStripe} className="btn btn-primary text-white w-36">
                            {loading ? (
                                <span className="loading loading-dots loading-md items-center"></span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                        <button
                            disabled={loading}
                            className="btn border-primary"
                            onClick={() => navigate(PATHS.WELCOME)}>
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StripePopup;
