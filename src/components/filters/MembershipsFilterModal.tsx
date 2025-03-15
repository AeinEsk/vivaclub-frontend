import React from 'react';
import { useForm } from 'react-hook-form';
import { PackageMembersFilter } from '../../@types/packageForm';
import { DrawMembersFilter } from '../../@types/darw';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: PackageMembersFilter | DrawMembersFilter) => void;
    filterType: 'package' | 'draw'; 
}

const MembershipsFilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    onApply,
    filterType
}) => {
    const { register, handleSubmit, reset } = useForm<PackageMembersFilter | DrawMembersFilter>();

    const handleApply = (data: PackageMembersFilter | DrawMembersFilter) => {
        onApply(data);
        onClose(); 
    };

    const clearFilters = () => {
        reset(); 
    };

    return (
        <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box">
                <h2 className="font-bold text-lg mb-4">Set Filters</h2>
                <form onSubmit={handleSubmit(handleApply)}>
                    {/* Email */}
                    <div className="form-control mb-3">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            className="input input-bordered"
                            placeholder="Enter email"
                            {...register('email')}
                        />
                    </div>

                    {/* Tier Name (only for PackageMembersFilter) */}
                    {filterType === 'package' && (
                        <div className="form-control mb-3">
                            <label className="label">
                                <span className="label-text">Tier Name</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                placeholder="Enter tier name"
                                {...register('tierName')}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 mb-3">
                        <div className="form-control mr-2">
                            <label className="label">
                                <span className="label-text">Start Date</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered"
                                {...register('startDate')}
                            />
                        </div>

                        <div className="form-control ml-2">
                            <label className="label">
                                <span className="label-text">End Date</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered"
                                {...register('endDate')}
                            />
                        </div>
                    </div>

                    <div className="modal-action flex justify-center mt-14">
                        <button type="submit" className="btn btn-primary btn-sm w-20 text-white">
                            Apply
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm w-20"
                            onClick={clearFilters}>
                            Clear
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm w-20 btn-outline bg-slate-200"
                            onClick={onClose}>
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MembershipsFilterModal;
