import googleSVG from '../../assets/google.svg';
import { HOST_API } from '../../api/config';

const googleAuthBtn = () => {
    const handleGoogleBtClick = () => {
        window.location.replace(HOST_API + '/auth/google');
    };
    return (
        <div>
            <button
                className="btn btn-outline border-border w-full mb-5 relative hover:bg-gray-50 hover:text-black text-gray-700 font-medium transition-colors duration-200"
                onClick={handleGoogleBtClick}>
                <img
                    src={googleSVG}
                    alt="google logo"
                    className="w-6 h-6 m-0 flex mr-2 absolute left-4"
                />
                <span>Continue with Google</span>
            </button>
        </div>
    );
};

export default googleAuthBtn;
