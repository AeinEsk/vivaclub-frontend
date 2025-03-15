interface PaginationProps {
    totalPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ totalPage, currentPage, onPageChange }: PaginationProps) => {
    return (
        <>
            {Array.from({ length: totalPage }, (_, index) => {
                const page = index + 1;
                return (
                    <div key={index}>
                        {totalPage !== 1 ? (
                            <input
                                key={page}
                                type="radio"
                                name="pagination"
                                aria-label={`${page}`}
                                defaultChecked={currentPage === page}
                                className={`join-item btn btn-square btn-sm mx-1 
                            ${currentPage === page ? 'btn-active' : ''}`}
                                onClick={() => onPageChange(page)}
                            />
                        ) : undefined}
                    </div>
                );
            })}
        </>
    );
};

export default Pagination;
