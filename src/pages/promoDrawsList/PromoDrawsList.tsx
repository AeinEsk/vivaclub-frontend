import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DrawList, DrawListFilter } from '../../@types/darw';
import { getDrawsList } from '../../api/draws';
import { PATHS } from '../../routes/routes';
import DrawTable from '../../components/drawTable/DrawTable';
import Pagination from '../../components/filters/Pagination';
import DrawFilterModal from '../../components/filters/DrawFilterModal';
import { FaFilter } from 'react-icons/fa6';

const PromoDrawsList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [drawData, setDrawData] = useState<DrawList[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCompact, setIsCompact] = useState<boolean>(window.innerWidth < 768); // Default based on initial screen size

    const [filters, setFilters] = useState<DrawListFilter>({
        page: 1,
        pageSize: 10,
        runMethod: '',
        startDate: '',
        endDate: '',
        drawName: '',
        entryCostMin: undefined,
        entryCostMax: undefined,

    });

    const handleApplyFilters = (filters: Partial<DrawListFilter>) => {
        setFilters((prev) => ({
            ...prev,
            ...filters,
            page: 1,
            pageSize: 10
        }));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setFilters((prev) => ({
            ...prev,
            ...filters,
            page: page
        }));
    };

    useEffect(() => {
        const handleResize = () => {
            setIsCompact(window.innerWidth < 768); // Compact for small screens (<768px), non-compact for larger screens
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                // Get all promotional draws by requesting a large page size
                const { data } = await getDrawsList({ ...filters, pageSize: 1000 });
                const allDraws = data?.draws || [];
                // Filter promotional draws (entryCost = 0) for promo draws list
                const promoDraws = allDraws.filter((d: any) => Number(d.entryCost) === 0);
                
                // Calculate pagination for promo draws only
                const pageSize = filters.pageSize || 10;
                const startIndex = ((filters.page || 1) - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedPromoDraws = promoDraws.slice(startIndex, endIndex);
                const calculatedTotalPages = Math.ceil(promoDraws.length / pageSize);
                
                setDrawData(paginatedPromoDraws);
                setTotalPages(calculatedTotalPages);
                setLoading(false);
            } catch (error: any) {
                console.error(error.response);
                setLoading(false);
            }
        })();
    }, [filters]);

    return (
        <div className="bg-white p-3">
            <div>
                <button
                    className="btn btn-primary btn-outline btn-sm font-normal w-full mb-5 relative"
                    onClick={() => setIsModalOpen(true)}>
                    Open Filters
                    <FaFilter />
                </button>
                <DrawFilterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onApply={handleApplyFilters}
                    isPromoDraws={true}
                />
            </div>
            {drawData.length !== 0 ? (
                <div>
                    <DrawTable drawData={drawData} from={0} to={100} loading={loading} compact={isCompact} isPromoList={true} />
                    <div className="flex justify-center mt-8">
                        <Pagination
                            totalPage={totalPages}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            ) : loading ? (
                <div className="flex justify-center items-center z-20 w-full my-4">
                    <span className="loading loading-dots items-center justify-center"></span>
                </div>
            ) : (
                <p className="text-center text-base my-4">No Promotional Draws Available yet</p>
            )}

            <button
                className=" btn btn-primary w-full rounded-btn font-normal mt-7 text-white"
                onClick={() => navigate(PATHS.CREATE_PROMO_DRAW)}>
                Create a New Promotional Draw
            </button>
        </div>
    );
};

export default PromoDrawsList;


