import React from 'react';
import { useForm } from 'react-hook-form';
import { DrawListFilter, drawType } from '../../@types/darw';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: DrawListFilter) => void;
}

const DrawFilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
    const { register, handleSubmit, reset } = useForm<DrawListFilter>();

    const handleApply = (data: DrawListFilter) => {
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
                            <span className="label-text">Run Method</span>
                        </label>
                        <select className="select select-bordered" {...register('runMethod')}>
                            <option value="">Select Run Method</option>
                            {drawType.map((option, index) => (
                                <option key={index} value={option.value}>
                                    {option.option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-control mb-3">
                        <label className="label">
                            <span className="label-text">Draw Name</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered"
                            placeholder="Enter draw name"
                            {...register('drawName')}
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

                    <div className="grid grid-cols-2 mb-3">
                        <div className="col-span-1 mr-2">
                            <label className="label">
                                <span className="label-text">Entry Cost Min</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                placeholder="Entry cost min"
                                {...register('entryCostMin')}
                            />
                        </div>
                        <div className="col-span-1 ml-2">
                            <label className="label">
                                <span className="label-text">Entry Cost Max</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                placeholder="Entry cost max"
                                {...register('entryCostMax')}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 mb-3">
                        <div className="col-span-1 mr-2">
                            <label className="label">
                                <span className="label-text">Minimum Prize</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                placeholder="Minimum Prize"
                                {...register('minimumPrize')}
                            />
                        </div>
                        <div className="col-span-1 ml-2">
                            <label className="label">
                                <span className="label-text">Maximum Prize</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                placeholder="Maximum Prize"
                                {...register('maximumPrize')}
                            />
                        </div>
                    </div>

                    <div className="modal-action flex justify-center">
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

export default DrawFilterModal;
