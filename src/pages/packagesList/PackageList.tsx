import { useEffect, useState } from 'react';
import { getMemberships } from '../../api/packages';
import { Membership, PackageListFilter } from '../../@types/packageForm';
import { useNavigate } from 'react-router-dom';
import PackageTable from '../../components/packageTable/PackageTable';
import PackageFilterModal from '../../components/filters/PackageFilterModal';
import { FaFilter } from 'react-icons/fa6';
import Pagination from '../../components/filters/Pagination';
import { PATHS } from '../../routes/routes';

const PackageList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [membership, setMembership] = useState<Membership[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotlaPages] = useState<number>(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCompact, setIsCompact] = useState<boolean>(window.innerWidth < 768); // Default based on initial screen size

    const [filters, setFilters] = useState<PackageListFilter>({
        page: 1,
        pageSize: 10,
        frequency: '',
        startDate: '',
        endDate: '',
        membershipName: ''
    });

    const handleApplyFilters = (filters: Partial<PackageListFilter>) => {
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
                const { data } = await getMemberships(filters);
                setMembership(data?.memberships);
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
                    className="btn btn-primary btn-outline btn-sm w-full font-normal mb-5 relative"
                    onClick={() => setIsModalOpen(true)}>
                    Open Filters
                    <FaFilter />
                </button>
                <PackageFilterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onApply={handleApplyFilters}
                />
            </div>
            {membership.length !== 0 ? (
                <div>
                    <PackageTable packageData={membership} from={0} to={100} loading={loading} compact={isCompact} />
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
                <p className="text-center text-base my-4">No Packages Available yet</p>
            )}

            <button
                className=" btn btn-primary w-full rounded-btn font-normal mt-7"
                onClick={() => navigate(PATHS.CREATE_PACKAGE)}>
                Create a New Package
            </button>
        </div>
    );
};

export default PackageList;
