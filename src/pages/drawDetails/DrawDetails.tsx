import { useNavigate, useParams } from 'react-router-dom';
import InfoBtn from '../../components/infoButton/InfoBtn';
import { useEffect, useState } from 'react';
import Loading from '../../components/loading/Loading';
import { cancelDraw, getDrawInfoById } from '../../api/draws';
import { HOST_API } from '../../api/config';
import { dateConverter } from '../../components/dateConverter/DateConverter';
import Popup from '../../components/alert/Popup';
import { FaDollarSign, FaGift, FaRegCalendar, FaUser } from 'react-icons/fa6';

interface draw {
    id: string;
    name: string;
    prize: string;
    ticketPrice: number;
    imageId: string;
    runAt: string;
    deactivatedAt: string;
    currency: number;
}

const DrawDetails = () => {
    const { drawId } = useParams<{ drawId: string }>();
    const navigate = useNavigate();
    const [drawInfo, setDrawInfo] = useState<draw>({
        id: '',
        name: '',
        prize: '',
        ticketPrice: 0,
        imageId: '',
        runAt: '',
        deactivatedAt: '',
        currency: 0
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>();
    const [imgLoading, setImgLoading] = useState(true);
    const [imgError, setImgError] = useState<boolean>(false);
    const today = new Date();
    const formattedDate = today.toISOString();
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showPopup, setShowPopup] = useState({
        state: false,
        text: '',
        drawId: ''
    });

    useEffect(() => {
        (async () => {
            if (drawId) {
                try {
                    setLoading(true);
                    setError(false);
                    const { data, status } = await getDrawInfoById(drawId);
                    if (status === 200) {
                        setDrawInfo({
                            id: data.id,
                            name: data.name,
                            prize: data.prize,
                            ticketPrice: data.entryCost,
                            imageId: data.imageId,
                            runAt: data.runAt,
                            deactivatedAt: data.deactivatedAt,
                            currency: data.currency
                        });
                        setImageUrl(`${HOST_API}/public/download/${data?.imageId}`);
                    } else {
                        setError(true);
                    }
                    setLoading(false);
                } catch (e) {
                    setLoading(false);
                    setError(true);
                    console.error(e);
                }
            }
        })();
    }, []);

    const handleStatus = (date: string) => {
        if (date > formattedDate) {
            return true;
        } else return false;
    };

    const closePopup = (): void => {
        setShowPopup({ state: false, text: '', drawId: '' });
    };

    const handleCancelDraw = async (drawId: string) => {
        try {
            setCancelLoading(true);
            await cancelDraw(drawId);
            setShowPopup({ state: false, text: '', drawId: '' });
            setCancelLoading(false);
            navigate(-1);
        } catch (error: any) {
            setCancelLoading(false);
            console.error(error.response);
        }
    };

    return (
        <div>
            {!error ? (
                loading ? (
                    <Loading />
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <div className="card p-0 w-full max-w-sm shadow-xl border border-border/30 bg-white overflow-hidden">
                            <header className="bg-primary-gradient px-3 py-5 text-left">
                                <p className="text-white font-bold mb-1">Draw Info</p>
                                <p className="text-white text-xs">Review your draw details below</p>
                            </header>
                            <div className="p-4">
                                {drawInfo.imageId && (
                                    <div className="mb-10">
                                        {imgLoading && !imgError && (
                                            <div className="inset-0 flex items-center justify-center bg-slate-200 rounded-lg w-full h-[200px]">
                                                <span className="loading loading-spinner loading-md mr-2"></span>
                                                Loading Image
                                            </div>
                                        )}
                                        <div className="flex justify-center">
                                            <img
                                                src={imageUrl}
                                                alt="draw image"
                                                className={`border border-gray-50 rounded-lg text-center ${imgLoading ? 'hidden' : 'block'} w-full h-[200px] object-cover max-w-full max-h-full`}
                                                onLoad={() => setImgLoading(false)}
                                                onError={() => {
                                                    setImgLoading(false);
                                                    setImgError(true);
                                                }}
                                            />
                                        </div>
                                        {imgError && (
                                            <p className="text-red-500">Error loading image</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <div className="flex gap-1 items-center text-xs text-primary">
                                                <FaUser /> <span>Name</span>
                                            </div>
                                            <p className="text-xs mt-2 text-left">
                                                {drawInfo.name}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <div className="flex gap-1 items-center text-xs text-primary">
                                                <FaGift /> <span>Prize</span>
                                            </div>
                                            <p className="text-xs mt-2 text-left">
                                                {drawInfo.prize}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <div className="flex gap-1 items-center text-xs text-primary">
                                                <FaDollarSign /> <span>Entry Cost</span>
                                            </div>
                                            <p className="text-xs mt-2 text-left">
                                                {drawInfo.currency + ' ' + drawInfo.ticketPrice}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <div className="flex gap-1 items-center text-xs text-primary">
                                                <FaRegCalendar /> <span>Draw Date</span>
                                            </div>
                                            <p className="text-xs mt-2 text-left">
                                                {dateConverter(drawInfo.runAt, 'YMD-HMS', 'long')}
                                            </p>
                                        </div>
                                    </div>

                                    {drawInfo.deactivatedAt && (
                                        <InfoBtn
                                            title={'Deactivated at'}
                                            data={dateConverter(
                                                drawInfo.deactivatedAt,
                                                'YMD-HMS',
                                                'long'
                                            )}
                                        />
                                    )}

                                    <div className="h-[1px] bg-gray-50 my-6 -mx-4"></div>

                                    {!drawInfo.deactivatedAt && handleStatus(drawInfo.runAt) ? (
                                        <div
                                            className="flex justify-center card bg-red-50 text-red-600 cursor-pointer font-bold h-12 p-0 mt-5"
                                            onClick={() =>
                                                setShowPopup({
                                                    state: true,
                                                    drawId: drawInfo.id,
                                                    text: 'Are you sure you want to cancel this draw? All entries will be refunded if the draw is canceled.'
                                                })
                                            }>
                                            Cancel Draw
                                        </div>
                                    ) : (
                                        <div className="flex justify-center card bg-orange-400 text-white font-bold h-12 p-0 mt-5">
                                            {drawInfo.deactivatedAt ? 'Draw Cancelled' : 'Expired'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                <div>
                    <p>There is no Draw with this ID.</p>
                </div>
            )}

            <Popup
                isOpen={showPopup.state}
                text={showPopup.text}
                button1={{
                    name: 'Confirm',
                    onClick() {
                        handleCancelDraw(showPopup.drawId);
                    },
                    mode: 'btn-error w-24 text-white',
                    loading: cancelLoading
                }}
                button2={{
                    name: 'Cancel',
                    onClick: closePopup,
                    mode: 'btn-primary w-24'
                }}
            />
        </div>
    );
};

export default DrawDetails;
