import React from 'react';
import { useForm } from 'react-hook-form';
import { PackageListFilter } from '../../@types/packageForm';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: PackageListFilter) => void;
}

const frequency = ['Weekly', 'Bi-weekly', 'Monthly', 'Yearly'];

const PackageFilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
    const { register, handleSubmit, reset } = useForm<PackageListFilter>();

    const handleApply = (data: PackageListFilter) => {
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
                    <div className="form-control mb-3">
                        <label className="label">
                            <span className="label-text">Frequency</span>
                        </label>
                        <select className="select select-bordered" {...register('frequency')}>
                            <option value="">Select Frequency</option>
                            {frequency.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-control mb-3">
                        <label className="label">
                            <span className="label-text">Membership Name</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered"
                            placeholder="Enter draw name"
                            {...register('membershipName')}
                        />
                    </div>

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

export default PackageFilterModal;
