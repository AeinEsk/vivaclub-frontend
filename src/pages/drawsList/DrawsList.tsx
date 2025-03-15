import { useEffect, useState } from 'react';
import { DrawList, DrawListFilter } from '../../@types/darw';
import { getDrawsList } from '../../api/draws';
import DrawTable from '../../components/drawTable/DrawTable';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/filters/Pagination';
import { PATHS } from '../../routes/routes';
import DrawFilterModal from '../../components/filters/DrawFilterModal';
import { FaFilter } from 'react-icons/fa6';

const DrawsList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [drawData, setDrawData] = useState<DrawList[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotlaPages] = useState<number>(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState<DrawListFilter>({
        page: 1,
        pageSize: 10,
        runMethod: '',
        startDate: '',
        endDate: '',
        drawName: '',
        entryCostMin: undefined,
        entryCostMax: undefined,
        minimumPrize: undefined,
        maximumPrize: undefined
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
        (async () => {
            try {
                setLoading(true);
                const { data } = await getDrawsList(filters);
                setDrawData(data?.draws);
                setTotlaPages(data?.totalPages);
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
                />
            </div>
            {drawData.length !== 0 ? (
                <div>
                    <DrawTable drawData={drawData} from={0} to={100} loading={loading} />
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
                <p className="text-center text-base my-4">No Draws Available yet</p>
            )}

            <button
                className=" btn btn-primary w-full rounded-btn font-normal mt-7 text-white"
                onClick={() => navigate(PATHS.CREATE_DRAW)}>
                Add new draw
            </button>
        </div>
    );
};

export default DrawsList;
