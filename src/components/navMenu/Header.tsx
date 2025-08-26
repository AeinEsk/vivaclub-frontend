import { ReactNode, useState } from 'react';
import { useAuth } from '../../contexts/Auth/AuthProvider';
import Drawer from './Drawer';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '../../routes/routes';
import userIcon from '../../assets/square-user.svg';
import logOutIcon from '../../assets/log-out.svg';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { FaUser } from 'react-icons/fa6';

type componentProp = {
    children: ReactNode;
    title: string;
    backIcon?: boolean;
    menuIcon?: boolean;
    fullHeight?: boolean;
};

const Header: React.FC<componentProp> = ({ children, title, backIcon, menuIcon, fullHeight = true }) => {
    const { currentUser, handleLogout } = useAuth();
    const navigate = useNavigate();
    const [imgLoading, setImgLoading] = useState(currentUser?.imageUrl ? true : false);

    const handleImageLoad = () => {
        setImgLoading(false);
    };

    return (
        <div>
            {currentUser !== null && (
                <>
                    <header className="header">
                        <div className="flex items-center gap-6">
                            {menuIcon && (
                                <>
                                    <Drawer />
                                    <div>
                                        <h1 className="text-xl text-left font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                            {title}
                                        </h1>
                                        <p className="text-sm text-text-secondary">
                                            {currentUser?.email}
                                        </p>
                                    </div>
                                </>
                            )}
                            {backIcon && (
                                <div className="flex items-center gap-6">
                                    <div
                                        className="nav-button"
                                        onClick={() => {
                                            // If there is history, go back; otherwise, fallback to welcome
                                            if (window.history.state && window.history.state.idx > 0) {
                                                navigate(-1);
                                            } else {
                                                navigate(PATHS.WELCOME);
                                            }
                                        }}
                                    >
                                        <FaArrowLeftLong className="text-[18px]" />
                                    </div>
                                    <h1 className="text-xl text-left font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                        {title}
                                    </h1>
                                </div>
                            )}
                        </div>
                        {menuIcon && (
                            <div className="dropdown dropdown-end inset-0">
                                <div tabIndex={0} role="button" className="avatar placeholder">
                                    <div className="w-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600">
                                        {currentUser?.imageUrl ? (
                                            <>
                                                {imgLoading && (
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                )}
                                                <img
                                                    src={currentUser.imageUrl}
                                                    onLoad={handleImageLoad}
                                                    alt="user image"
                                                    className={imgLoading ? 'hidden' : ''}
                                                />
                                            </>
                                        ) : (
                                            <FaUser className="text-white" />
                                        )}
                                    </div>
                                </div>
                                <ul
                                    tabIndex={0}
                                    className="menu menu-sm dropdown-content bg-white rounded-lg z-[1] mt-3 w-36 py-2 px-1 shadow-lg border-[1px] border-border"
                                    style={{ insetInlineEnd: '' }}>
                                    <li className="mb-1">
                                        <Link to={PATHS.PROFILE}>
                                            <img src={userIcon} alt="add" width={18} />
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={PATHS.SIGNIN} onClick={handleLogout}>
                                            <img src={logOutIcon} alt="add" width={18} />
                                            Logout
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </header>

                    <div className={`main ${fullHeight ? 'min-h-screen' : ''} bg-page-body`}>{children}</div>
                </>
            )}
        </div>
    );
};

export default Header;
