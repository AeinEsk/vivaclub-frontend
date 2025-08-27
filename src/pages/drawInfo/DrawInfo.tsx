import { useNavigate, useParams } from 'react-router-dom';
import InfoBtn from '../../components/infoButton/InfoBtn';
import { useEffect, useState } from 'react';
import Loading from '../../components/loading/Loading';
import { PATHS } from '../../routes/routes';
import { getDrawInfoById } from '../../api/draws';
import { HOST_API } from '../../api/config';
import { dateConverter } from '../../components/dateConverter/DateConverter';
import {
    FaDollarSign,
    FaGift,
    FaRegCalendar,
    FaRegIdCard,
    FaTriangleExclamation,
    FaUser
} from 'react-icons/fa6';

interface draw {
    name: string;
    prize: string;
    ticketPrice: number;
    imageId: string;
    runAt: string;
    currency: number;
    deactivatedAt: string;
}

const DrawInfo = () => {
    const { drawId } = useParams<{ drawId: string }>();
    const navigate = useNavigate();
    const [numTickets, setNumTickets] = useState<number>(1);
    const [drawInfo, setDrawInfo] = useState<draw>({
        name: '',
        prize: '',
        ticketPrice: 0,
        imageId: '',
        runAt: '',
        currency: 0,
        deactivatedAt: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>();
    const [imgLoading, setImgLoading] = useState(true);
    const [imgError, setImgError] = useState<boolean>(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const today = new Date();
    const formattedDate = today.toISOString();

    useEffect(() => {
        (async () => {
            if (drawId) {
                try {
                    setLoading(true);
                    setError(false);
                    const { data, status } = await getDrawInfoById(drawId);
                    if (status === 200) {
                        setDrawInfo({
                            name: data?.name,
                            prize: data?.prize,
                            ticketPrice: data?.entryCost,
                            imageId: data?.imageId,
                            runAt: data?.runAt,
                            currency: data.currency,
                            deactivatedAt: data.deactivatedAt
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

    const handleNext = () => {
        const totalCost = numTickets * drawInfo.ticketPrice;
        const mode = 'draw';
        const currency = drawInfo.currency;
        navigate(PATHS.TOTAL, { state: { mode, drawId, numTickets, totalCost, currency } });
    };

    return (
        <div>
            {!error ? (
                loading ? (
                    <Loading />
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        {/* Simple Image Modal */}
                        {showFullImage && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                                onClick={() => setShowFullImage(false)}
                            >
                                <img
                                    src={imageUrl}
                                    alt="draw image"
                                    className="max-w-[95vw] max-h-[95vh]"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}

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
                                                className={`border border-gray-50 rounded-lg text-center ${imgLoading ? 'hidden' : 'block'} w-full h-[200px] object-cover max-w-full max-h-full cursor-pointer`}
                                                onLoad={() => setImgLoading(false)}
                                                onError={() => {
                                                    setImgLoading(false);
                                                    setImgError(true);
                                                }}
                                                onClick={() => setShowFullImage(true)}
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
                                </div>
                            </div>

                            <div>
                                {/* <div className="border-dashed border-2 border-gray-300 my-6 -mx-4"></div> */}

                                {!drawInfo.deactivatedAt && handleStatus(drawInfo.runAt) ? (
                                    <form action="" method="dialog" className="p-5 pt-0 -mt-7">
                                        <div className="mb-5">
                                            <label className="flex items-center gap-1 mb-2">
                                                <FaRegIdCard className="text-sm" />
                                                <span className="text-sm">Tickets</span>
                                            </label>
                                            <div className="p-3 bg-gray-50 rounded-xl">
                                                <input
                                                    type="number"
                                                    placeholder="Number of Tickets"
                                                    className="input input-bordered border-gray-400 w-full"
                                                    min={1}
                                                    defaultValue={Number(numTickets)}
                                                    required
                                                    onChange={(e) =>
                                                        setNumTickets(Number(e.target.value))
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary w-full"
                                            onClick={handleNext}
                                            disabled={numTickets <= 0}>
                                            Next
                                        </button>
                                    </form>
                                ) : (
                                    <div className="flex justify-center card bg-orange-400 text-white font-bold h-12 p-0 mt-5">
                                        {drawInfo.deactivatedAt ? 'Draw Cancelled' : 'Expired'}
                                    </div>
                                )}
                                <div className="mt-4 mb-4 text-center">
                                    <span className="text-xs text-gray-400">
                                        Powered by{' '}
                                        <a
                                            href="https://vivaclub.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline text-gray-400 hover:text-gray-500"
                                        >
                                            VivaClub
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                <div className="flex justify-center">
                    <div className="w-full max-w-lg shadow-xl rounded-2xl border border-border/30 bg-white overflow-hidden">
                        <header className="bg-primary-gradient px-3 py-5 text-left">
                            <p className="text-white font-bold mb-1">Draw Info</p>
                        </header>
                        <div className="py-10 px-5">
                            <div className="w-[68px] h-[68px] flex items-center justify-center mx-auto rounded-full bg-[#F5F3FF] text-xl text-primary/80">
                                <FaTriangleExclamation />
                            </div>
                            <h4 className="mt-4 font-bold text-lg">Draw Not Found</h4>
                            <p className="mt-1 px-12 text-secondary">
                                We could not find the draw you are looking for. It may have been
                                removed or the ID is incorrect.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrawInfo;
