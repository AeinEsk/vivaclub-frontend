import { useState } from 'react';
import { PATHS } from '../../routes/routes';
import { handleCopyLink } from '../functions/HandleCopyLink';
import { handleShareLink } from '../functions/HandleShareLink';
import { useNavigate } from 'react-router-dom';
import { FaEllipsisVertical } from 'react-icons/fa6';

type MenuCol = {
    membershipId: string;
};
const MenuCol = ({ membershipId }: MenuCol) => {
    const navigate = useNavigate();
    const [isCopied, setIsCopied] = useState(false);

    return (
        <td className="table-cell text-center">
            <div className="dropdown dropdown-top dropdown-end relative">
                <button tabIndex={0} className="menu-button">
                    <FaEllipsisVertical className="text-lg text-gray-400" />
                </button>
                <ul
                    tabIndex={0}
                    className="menu menu-xs dropdown-content bg-base-100 rounded-box z-[100] w-40 px-3 py-2 shadow-lg border-border">
                    <li>
                        <a
                            className="text-sm"
                            onClick={() =>
                                handleShareLink(
                                    'lottery Draw',
                                    'Share this Draw with others',
                                    PATHS.PACKAGE_INFO.replace(':packageId', membershipId)
                                )
                            }>
                            Share
                        </a>
                    </li>
                    <li>
                        <a
                            className="text-sm"
                            onClick={() => {
                                handleCopyLink(
                                    PATHS.PACKAGE_INFO.replace(':packageId', membershipId),
                                    setIsCopied
                                );
                            }}>
                            {isCopied ? (
                                <span className="text-success text-sm text-nowrap overflow-hidden text-ellipsis max-w-ful">
                                    Copied to clipboard!
                                </span>
                            ) : (
                                ' Copy Link'
                            )}
                        </a>
                    </li>
                    <li>
                        <a
                            className="text-sm"
                            onClick={() =>
                                navigate(PATHS.PACKAGE_DITAILS.replace(':packageId', membershipId))
                            }>
                            Package Details
                        </a>
                    </li>
                    <li>
                        <a
                            className="text-sm"
                            onClick={() =>
                                navigate(PATHS.EDIT_PACKAGE.replace(':packageId', membershipId))
                            }>
                            Edit Package
                        </a>
                    </li>
                    <li>
                        <a
                            className="text-sm"
                            onClick={() =>
                                navigate(PATHS.PACKAGE_USERS.replace(':packageId', membershipId))
                            }>
                            Memberships
                        </a>
                    </li>
                </ul>
            </div>
        </td>
    );
};

export default MenuCol;
