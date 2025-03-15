import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPackageMembeships } from '../../api/packages';
import PckageUserTable from '../../components/userTable/PckageUserTable';
import { PackageMembersFilter } from '../../@types/packageForm';
import { DrawMembersFilter } from '../../@types/darw';
import MembershipsFilterModal from '../../components/filters/MembershipsFilterModal';
import filerSvg from '../../assets/filter.svg';
import Pagination from '../../components/filters/Pagination';

interface Membership {
    email: string;
    leftRecurrence: string;
    tierName: string;
}

const PackageMemberships = () => {
    const { packageId } = useParams<{ packageId: string }>();
    const [userData, setUserData] = useState<Membership[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotlaPages] = useState<number>(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<'package' | 'draw'>('package');
    const [filters, setFilters] = useState<PackageMembersFilter | DrawMembersFilter>({
        email: '',
        startDate: '',
        endDate: '',
        tierName: '',
        page: 1,
        pageSize: 10
    });

    useEffect(() => {
        (async () => {
            if (packageId) {
                try {
                    setLoading(true);
                    const { data } = await getPackageMembeships(packageId, filters);
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
    }, [packageId, filters]);

    const handleApplyFilters = (newFilters: PackageMembersFilter | DrawMembersFilter) => {
        setFilterType('package');
        if (packageId) {
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
                    <PckageUserTable userInfo={userData} loading={loading} />
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
                <p>No Package Membership Found</p>
            )}
        </>
    );
};

export default PackageMemberships;
