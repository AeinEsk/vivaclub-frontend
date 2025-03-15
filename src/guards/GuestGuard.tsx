import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/Auth/AuthProvider';
import { PATHS } from '../routes/routes';

interface AuthGuardProps {
    children: React.ReactNode;
}

interface LocationState {
    from: Location;
}

export default function GuestGuard({ children }: AuthGuardProps) {
    const { authToken } = useAuth();
    const location = useLocation();
    const state = location.state as LocationState;

    if (authToken) {
        return state?.from ? (
            <Navigate to={state.from} />
        ) : (
            <Navigate to={PATHS.WELCOME} state={{ from: location.pathname }} />
        );
    } else return <>{children}</>;
}
