import { Navigate, useLocation } from 'react-router-dom';
import { PATHS } from '../routes/routes';
import { useAuth } from '../contexts/Auth/AuthProvider';
import { useState } from 'react';
import Loading from '../components/loading/Loading';
import StripePopup from '../components/alert/StripePopup';

export default function ProtectedRoute({ children }: any) {
    const { authToken, loading, currentUser } = useAuth();
    const [requestedLocation, setRequestedLocation] = useState<string | null>(null);
    const { pathname } = useLocation();
    const location = useLocation();

    if (loading) {
        return <Loading />;
    }

    const isWelcomePage = location.pathname === PATHS.WELCOME;
    const isProfilePage = location.pathname === PATHS.PROFILE;

    if (!authToken) {
        if (pathname !== requestedLocation) {
            setRequestedLocation(pathname);
        }
        return <Navigate to={PATHS.SIGNIN} state={{ from: location }} />;
    } else if (!isWelcomePage && !isProfilePage && !currentUser?.isStipeConnected) {
        return (
            <>
                {children}
                {<StripePopup showPopup={true} />}
            </>
        );
    } else {
        return <>{children}</>;
    }
}
