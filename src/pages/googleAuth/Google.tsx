import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth/AuthProvider';

const Google = () => {
    const { handleLoginWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
        const email = queryParams.get('email');

        if (token && email) {
            handleLoginWithGoogle(email, token);
        } else {
            console.error('Token or email not found in URL');
        }
    }, [navigate]);

    return (
        <div className="main flex flex-col justify-center items-center h-screen">
            <span className="loading loading-ring loading-lg mb-3"></span>
            <p>Please wait...</p>
        </div>
    );
};

export default Google;
