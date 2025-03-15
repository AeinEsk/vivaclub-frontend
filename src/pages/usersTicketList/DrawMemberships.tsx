import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDrawMembeships } from '../../api/draws';
import DrawUserTable from '../../components/userTable/DrawUserTable';
import Pagination from '../../components/filters/Pagination';
import { PackageMembersFilter } from '../../@types/packageForm';
import { DrawMembersFilter } from '../../@types/darw';
import MembershipsFilterModal from '../../components/filters/MembershipsFilterModal';
import filerSvg from '../../assets/filter.svg';

interface Membership {
    ownerEmail: string;
    ticketCount: string;
    latestCreatedAt: string;
}
const DrawMemberships = () => {
    const { drawId } = useParams<{ drawId: string }>();
    const [userData, setUserData] = useState<Membership[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotlaPages] = useState<number>(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<'package' | 'draw'>('draw');
    const [filters, setFilters] = useState<PackageMembersFilter | DrawMembersFilter>({
        email: '',
        startDate: '',
        endDate: '',
        page: 1,
        pageSize: 10
    });

    useEffect(() => {
        (async () => {
            if (drawId) {
                try {
                    setLoading(true);
                    const { data } = await getDrawMembeships(drawId, filters);
                    if (data.length !== 0) {
                        setUserData(data?.members);
                        setTotlaPages(data?.totalPages);
                    }
                    setLoading(false);
                } catch (e) {
                    setLoading(false);
                    console.error(e);
                }
            }
        })();
    }, [drawId, filters]);

    const handleApplyFilters = (newFilters: PackageMembersFilter | DrawMembersFilter) => {
        setFilterType('draw');
        if (drawId) {
            setFilters((prev) => ({
                ...prev,
                ...newFilters,
                page: 1,
                pageSize: 10
            }));
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setFilters((prev) => ({
            ...prev,
            ...filters,
            page: page
        }));
    };

    return (
        <>
            <div>
                <button
                    className="btn btn-outline btn-sm w-full rounded-btn font-normal mb-5 border-gray-400 relative bg-white"
                    onClick={() => setIsModalOpen(true)}>
                    Open Filters
                    <img src={filerSvg} alt="filter" />
                </button>
                <MembershipsFilterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onApply={handleApplyFilters}
                    filterType={filterType}
                />
            </div>
            {userData.length !== 0 ? (
                <>
                    <DrawUserTable userInfo={userData} loading={loading} />
                    <div className="flex justify-center mt-8">
                        <Pagination
                            totalPage={totalPages}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </>
            ) : loading ? (
                <div className="flex justify-center items-center absolute z-20 w-full mt-14">
                    <span className="loading loading-dots items-center justify-center"></span>
                </div>
            ) : (
                <p>No Draw Membership Found</p>
            )}
        </>
    );
};

export default DrawMemberships;
