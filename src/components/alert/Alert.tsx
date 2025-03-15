import React from 'react';
import { AlertProps } from '../../@types/alerts';

const Alert: React.FC<AlertProps> = ({ message, type }) => {
    return (
        <>
            {type === 'simple-outline' ? (
                <div role="alert" className="flex alert rounded-lg bg-blue-50">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-blue-700"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span className="text-sm font-light text-blue-700">{message}</span>
                </div>
            ) : type !== 'simple' ? (
                <div
                    role="alert"
                    className={`alert ${type} flex h-12 rounded-lg text-white text-xs`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={
                                type === 'alert-error'
                                    ? 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                                    : type === 'alert-success'
                                      ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                      : type === 'alert-info'
                                        ? 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                        : type === 'alert-warning'
                                          ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                                          : undefined
                            }
                        />
                    </svg>
                    <span>{message}</span>
                </div>
            ) : (
                <div
                    role="alert"
                    className={`flex alert rounded-lg border-yellow-100 bg-yellow-50 text-left`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-amber-600"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span className="text-xs font-normal text-yellow-600">{message}</span>
                </div>
            )}
        </>
    );
};

export default Alert;
