import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa6';
import { FaRegFileLines } from 'react-icons/fa6';
import { FaRegFileImage } from 'react-icons/fa6';
import { FaUserShield } from 'react-icons/fa6';
import { FaQuestion } from 'react-icons/fa6';

const Drawer = () => {
    return (
        <div>
            <div className="drawer drawer-start z-[10000]">
                <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                {/* Page content here */}
                <div className="drawer-content">
                    <label htmlFor="my-drawer-4">
                        <div className="nav-button">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </div>
                    </label>
                </div>

                <div className="drawer-side z-20">
                    <label
                        htmlFor="my-drawer-4"
                        aria-label="close sidebar"
                        className="drawer-overlay"></label>
                    <ul className="menu bg-white text-base-content min-h-full w-60 py-4 flex flex-col justify-between">
                        {/* Sidebar content here */}

                        <div className="[&>li]:mb-2">
                            <li>
                                <Link to="/profile/create-package" className="mx-1 no-underline">
                                    <FaPlus className="text-lg" />
                                    Create Membership
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile/create-draw" className="mx-1 no-underline">
                                    <FaPlus className="text-lg" />
                                    Create Draw
                                </Link>
                            </li>
                            <div className="h-[1px] w-full bg-gray-100 my-5"></div>
                            <li>
                                <a
                                    className="mx-1 no-underline"
                                    href="https://vivaclub.io/#howitworks"
                                    target="_blank">
                                    <FaRegFileLines className="text-lg" />
                                    How It Works ?
                                </a>
                            </li>
                            <li>
                                <a
                                    className="mx-1 no-underline"
                                    href="https://vivaclub.io/#pricing"
                                    target="_blank">
                                    <FaRegFileImage className="text-lg" />
                                    Club Examples
                                </a>
                            </li>
                            <li>
                                <a
                                    className="mx-1 no-underline"
                                    href="https://vivaclub.io/terms-conditions"
                                    target="_blank">
                                    <FaUserShield className="text-lg" />
                                    Terms And Conditions
                                </a>
                            </li>
                            <li>
                                <a
                                    className="mx-1 no-underline"
                                    href="https://vivaclub.io/#faq"
                                    target="_blank">
                                    <FaQuestion className="text-lg" />
                                    FAQ
                                </a>
                            </li>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Drawer;
