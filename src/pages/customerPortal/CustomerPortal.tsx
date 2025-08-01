import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCustomerTickets } from '../../api/customer';
import { PATHS } from '../../routes/routes';
import ticketIcon from '../../assets/ticket.svg';
import membershipIcon from '../../assets/membership.svg';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

interface Ticket {
    id: string;
    ticketCode: string;
    ticketFor: 'DRAW' | 'MEMBER';
    runDate?: string;
    membershipTirePaymentId?: string;
    membershipTireId?: string;
    drawID: string;
    generatedCode: string;
    hasWon: boolean;
    ownerEmail: string;
    paymentId: string;
    createdAt: string;
    updatedAt: string;
    deactivatedAt: string | null;
}

const CustomerPortal = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tickets, setTickets] = useState<{
        memberships: Ticket[];
        upcomingTickets: Ticket[];
        pastTickets: Ticket[];
    }>({
        memberships: [],
        upcomingTickets: [],
        pastTickets: []
    });

    useEffect(() => {
        const token = localStorage.getItem('customerToken');
        if (!token) {
            navigate(PATHS.CUSTOMER_SIGNIN);
            return;
        }
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('customerToken');
            if (!token) {
                navigate(PATHS.CUSTOMER_SIGNIN);
                return;
            }
            const response = await getCustomerTickets(token);
            setTickets(response.data);
        } catch (error: any) {
            if (error.response?.status === 401) {
                localStorage.removeItem('customerToken');
                navigate(PATHS.CUSTOMER_SIGNIN);
            }
            setError(error.response?.data?.error || 'Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    const TicketCard = ({ ticket, type }: { ticket: Ticket; type: string }) => {
        useEffect(() => {
            if (ticket.hasWon) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }, [ticket.hasWon]);

        return (
            <div className={`
                bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
                ${ticket.hasWon 
                    ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border border-green-300' 
                    : !ticket.hasWon && type === 'draw' 
                        ? 'border border-gray-100' 
                        : 'border border-gray-100'
                }
            `}>
                {/* Header Section */}
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className={`
                                p-2 rounded-lg 
                                ${type === 'membership' ? 'bg-blue-50' : 'bg-purple-50'}
                            `}>
                                <img 
                                    src={type === 'membership' ? membershipIcon : ticketIcon} 
                                    alt={type} 
                                    className={`w-6 h-6 sm:w-8 sm:h-8 ${ticket.hasWon ? 'text-green-600' : ''}`}
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className={`text-base sm:text-lg font-semibold ${ticket.hasWon ? 'text-green-700' : 'text-gray-800'}`}>
                                        {ticket.generatedCode}
                                    </h3>
                                    {type === 'draw' && (
                                        <span className={`
                                            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                            ${ticket.hasWon 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-600'
                                            }
                                        `}>
                                            {ticket.hasWon ? '🎉 Winner!' : 'Not Won'}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 space-y-1">
                                    <p className="text-sm text-gray-600 capitalize">
                                        {type === 'membership' ? 'Membership Ticket' : 'Draw Ticket'}
                                    </p>
                                    {type === 'membership' && ticket.membershipTireId && (
                                        <p className="text-sm text-gray-600">
                                            Tier: {ticket.membershipTireId}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {ticket.runDate && (
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg sm:text-right">
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <p className="text-xs text-gray-500">Next Draw</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {format(new Date(ticket.runDate), 'dd MMM yyyy HH:mm')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="border-t border-gray-100 p-4 sm:p-6 bg-gray-50 rounded-b-xl">
                    <div className="flex flex-col sm:flex-row justify-between gap-3 text-xs text-gray-500">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <span className="flex items-center gap-1">
                                <span className="font-medium">ID:</span> 
                                <span className="font-mono">{ticket.drawID.slice(0, 8)}...</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="font-medium">Payment:</span> 
                                <span className="font-mono">{ticket.paymentId}</span>
                            </span>
                        </div>
                        
                        {type === 'membership' && (
                            <a
                                href={`${import.meta.env.VITE_API_URL}/payment/refund?paymentId=${ticket.paymentId}&email=${location.state?.email}`}
                                className="btn btn-sm btn-error text-white hover:bg-red-600 transition-colors w-full sm:w-auto"
                                onClick={(e) => {
                                    if (!window.confirm('Are you sure you want to cancel this membership? This action cannot be undone.')) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                Cancel Membership
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-dots loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate(PATHS.SIGNIN)}
                        className="btn btn-primary">
                        Back to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
                    Your Tickets
                </h1>

                <div className="space-y-8">
                    {/* Active Memberships */}
                    {tickets.memberships.length > 0 && (
                        <section>
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700 px-1">
                                Active Memberships
                            </h2>
                            <div className="space-y-4">
                                {tickets.memberships.map(ticket => (
                                    <TicketCard key={ticket.id} ticket={ticket} type="membership" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Upcoming Draws */}
                    {tickets.upcomingTickets.length > 0 && (
                        <section>
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700 px-1">
                                Upcoming Draws
                            </h2>
                            <div className="space-y-4">
                                {tickets.upcomingTickets.map(ticket => (
                                    <TicketCard key={ticket.id} ticket={ticket} type="draw" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Past Draws */}
                    <section>
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700 px-1">
                            Past Draws
                        </h2>
                        <div className="space-y-4">
                            {tickets.pastTickets.length > 0 ? (
                                tickets.pastTickets.map(ticket => (
                                    <TicketCard key={ticket.id} ticket={ticket} type="draw" />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                                    <p className="text-gray-500">No past draws</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// const styles = `
// .filter-gold {
//     filter: invert(70%) sepia(80%) saturate(1000%) hue-rotate(359deg) brightness(105%) contrast(105%);
// }
// `;

export default CustomerPortal; 