import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage({ orderId, onNavigate }) {
    const [countdown, setCountdown] = useState(5);

    // Separate effect for countdown timer
    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    // Separate effect for navigation when countdown reaches 0
    useEffect(() => {
        if (countdown === 0) {
            onNavigate('order-detail', { orderId });
        }
    }, [countdown, orderId, onNavigate]);

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
                {/* Success Animation */}
                <div className="relative mb-8">
                    <div className="w-32 h-32 bg-[#E8F5F1] rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <CheckCircle className="w-16 h-16 text-[#006A52]" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#22C55E] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">
                    Payment Successful!
                </h1>
                <p className="text-[#666666] mb-6">
                    Thank you for your order. Your payment has been processed successfully.
                </p>

                {/* Order ID */}
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
                    <p className="text-sm text-[#666666] mb-1">Order ID</p>
                    <p className="font-mono font-semibold text-[#006A52] text-lg">
                        {orderId ? orderId.slice(-8).toUpperCase() : 'N/A'}
                    </p>
                </div>

                {/* Auto-redirect notice */}
                <p className="text-sm text-[#999999] mb-6">
                    Redirecting to order details in <span className="font-bold text-[#006A52]">{countdown}</span> seconds...
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={() => onNavigate('order-detail', { orderId })}
                        className="w-full btn-primary py-4 h-14 text-lg"
                    >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        View Order Details
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <Button
                        onClick={() => onNavigate('home')}
                        className="w-full btn-secondary py-3"
                    >
                        Continue Shopping
                    </Button>
                </div>
            </div>
        </div>
    );
}
