import { Route, Routes } from 'react-router-dom';
import { Header } from '../components/navMenu';
import { SignUp } from '../pages/auth/signUp';
import { SignIn } from '../pages/auth/signIn';
import { Profile } from '../pages/profile';
import { CreatePackage } from '../pages/createPackage';
import { PackagesList } from '../pages/packagesList';
import { CreateDraw } from '../pages/createDraw';
import { PackagesDetails } from '../pages/packagesDetails';
import { DrawDetails } from '../pages/drawDetails';
import { DrawsList } from '../pages/drawsList';
import { Welcome } from '../pages/welcomePage';
import { DrawInfo } from '../pages/drawInfo';
import { PackageInfo } from '../pages/packagesDetails';
import { Total } from '../pages/total';
import TermsManager, { TermsViewer } from '../pages/terms';
import { Payment } from '../pages/payment';
import { PATHS } from './routes';
import { GoogleAuth } from '../pages/googleAuth';
import { OtpVerification } from '../pages/auth/otp';
import { DrawMemberships, PackageMemberships } from '../pages/usersTicketList';
import { PrivacyPolicy } from '../pages/privacy-policy';
import { ResetPassword } from '../pages/auth/resetPassword';
import ProtectedRoute from '../guards/AuthGuards';
import GuestGuard from '../guards/GuestGuard';
import CustomerVerification from '../pages/customerVerification/CustomerVerification';
import CustomerPortal from '../pages/customerPortal/CustomerPortal';
import CustomerSignIn from '../pages/CustomerSignIn/customerSignIn';

const Router = () => {
    return (
        <Routes>
            <Route
                path={PATHS.SIGNIN}
                element={
                    <GuestGuard>
                        <SignIn />
                    </GuestGuard>
                }
            />
            <Route
                path={PATHS.SIGNUP}
                element={
                    <GuestGuard>
                        <SignUp />
                    </GuestGuard>
                }
            />
            <Route
                path={PATHS.WELCOME}
                element={
                    <ProtectedRoute>
                        <Header title="Welcome" menuIcon={true} backIcon={false}>
                            <Welcome />
                        </Header>
                    </ProtectedRoute>
                }
            />
            <Route
                path={PATHS.PROFILE}
                element={
                    <ProtectedRoute>
                        <Header title="Profile" backIcon={true}>
                            <Profile />
                        </Header>
                    </ProtectedRoute>
                }
            />
            <Route
                path={PATHS.CREATE_PACKAGE}
                element={
                    <ProtectedRoute>
                        <Header title="Creating Membership" backIcon={true}>
                            <CreatePackage />
                        </Header>
                    </ProtectedRoute>
                }
            />
            <Route
                path={PATHS.PACKAGE_LIST}
                element={
                    <ProtectedRoute>
                        <Header title="Your Active Packages" backIcon={true}>
                            <PackagesList />
                        </Header>
                    </ProtectedRoute>
                }
            />
            <Route
                path={PATHS.EDIT_PACKAGE}
                element={
                    <ProtectedRoute>
                        <Header title="Edit Packages" backIcon={true}>
                            <CreatePackage />
                        </Header>
                    </ProtectedRoute>
                }
            />
            <Route
                path={PATHS.PACKAGE_DITAILS}
                element={
                    <ProtectedRoute>
                        <Header title="Package Details" backIcon={true}>
                            <PackagesDetails />
                        </Header>
                    </ProtectedRoute>
                }
            />
            <Route
                path={PATHS.CREATE_DRAW}
                element={
                    <ProtectedRoute>
                        <Header title="Creating Draw" backIcon={true}>
                            <CreateDraw />
                        </Header>
                    </ProtectedRoute>
                }
            />
            <Route
                path={PATHS.EDIT_DRAW}
                element={
                    <ProtectedRoute>
                        <Header title="Edit Draw" backIcon={true}>
                            <CreateDraw />
                        </Header>
                    </ProtectedRoute>
                }
            />

            <Route
                path={PATHS.TERMS}
                element={
                    <ProtectedRoute>
                        <Header title="Terms & Conditions" backIcon={true}>
                            <TermsManager />
                        </Header>
                    </ProtectedRoute>
                }
            />

            <Route
                path={PATHS.PUBLIC_TERMS}
                element={
                    <Header title="Terms & Conditions" backIcon>
                        <TermsViewer />
                    </Header>
                }
            />

            <Route
                path={PATHS.DRAW_LIST}
                element={
                    <ProtectedRoute>
                        <Header title="Your Draw List" backIcon={true}>
                            <DrawsList />
                        </Header>
                    </ProtectedRoute>
                }
            />

            <Route
                path={PATHS.DRAW_USERS}
                element={
                    <ProtectedRoute>
                        <Header title="Draw Memberships List" backIcon={true}>
                            <DrawMemberships />
                        </Header>
                    </ProtectedRoute>
                }
            />

            <Route
                path={PATHS.PACKAGE_USERS}
                element={
                    <ProtectedRoute>
                        <Header title="Package Memberships List" backIcon={true}>
                            <PackageMemberships />
                        </Header>
                    </ProtectedRoute>
                }
            />

            <Route
                path={PATHS.DRAW_DETAILS}
                element={
                    <ProtectedRoute>
                        <Header title="Draw Details" backIcon={true}>
                            <DrawDetails />
                        </Header>
                    </ProtectedRoute>
                }
            />

            <Route
                path={PATHS.DRAW_INFO}
                element={
                    <Header title="Draw Info">
                        <DrawInfo />
                    </Header>
                }
            />
            <Route
                path={PATHS.PACKAGE_INFO}
                element={
                    <Header title="Package Info">
                        <PackageInfo />
                    </Header>
                }
            />
            <Route
                path={PATHS.TOTAL}
                element={
                    <Header title="Totla Cost" backIcon>
                        <Total />
                    </Header>
                }
            />
            <Route
                path={PATHS.DRAW_PAYMENT}
                element={
                    <Header title="Payment">
                        <Payment />
                    </Header>
                }
            />

            <Route
                path={PATHS.PACKAGE_PAYMENT}
                element={
                    <Header title="Payment">
                        <Payment />
                    </Header>
                }
            />

            <Route
                path={PATHS.PRIVACY}
                element={
                    <Header title="Privacy Policy">
                        <PrivacyPolicy />
                    </Header>
                }
            />

            <Route
                path={PATHS.RESET_PASS}
                element={
                    <Header title="Reset Password">
                        <ResetPassword />
                    </Header>
                }
            />

            <Route path={PATHS.GOOGLE} element={<GoogleAuth />} />
            <Route path={PATHS.OTP} element={<OtpVerification />} />

            <Route
                path={PATHS.CUSTOMER_VERIFICATION}
                element={
                    <Header title="Verify Email">
                        <CustomerVerification />
                    </Header>
                }
            />

            <Route
                path={PATHS.CUSTOMER_PORTAL}
                element={
                    <Header title="Your Tickets" backIcon={false}>
                        <CustomerPortal />
                    </Header>
                }
            />

            <Route
                path={PATHS.CUSTOMER_SIGNIN}
                element={
                    <Header title="Sign In">
                        <CustomerSignIn />
                    </Header>
                }
            />

            <Route
                path="*"
                element={
                    <Header title="" backIcon>
                        <p className="text-2xl font-semibold">404 Page Not Found !</p>
                    </Header>
                }
            />
        </Routes>
    );
};

export default Router;
