import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import type { PaymentPrepareResponse } from "@/types/payment";
import { motion } from "framer-motion";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";

interface PaymentWidgetProps {
  prepareData: PaymentPrepareResponse;
  clientKey: string;
}

export function PaymentWidget({ prepareData, clientKey }: PaymentWidgetProps) {
  const handlePayment = async () => {
    try {
      const tossPayments = await loadTossPayments(clientKey);

      // General Payment SDK requires initializing the payment instance
      const payment = tossPayments.payment({ customerKey: "ANONYMOUS" });

      await payment.requestPayment({
        method: "CARD", // "CARD" is the method code for general card payment
        amount: {
          currency: "KRW",
          value: prepareData.amount,
        },
        orderId: prepareData.orderId,
        orderName: prepareData.orderName,
        successUrl: window.location.origin + prepareData.successUrl,
        failUrl: window.location.origin + prepareData.failUrl,
        customerEmail: "customer@stolique.com",
        customerName: "StoLink User",
      });
    } catch (error) {
      console.error("Payment Request Failed:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden relative"
    >
      {/* Absolute Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-mocha-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-sage-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative p-8 pb-6 text-center border-b border-dashed border-mocha-200/50">
        <h3 className="text-sm font-bold text-mocha-400 tracking-widest uppercase mb-2">
          Payment Method
        </h3>
        <p className="text-2xl font-bold font-sans text-espresso-900 flex items-center justify-center gap-2">
          Credit Card
          <CreditCard className="w-5 h-5 text-mocha-500" />
        </p>
      </div>

      {/* Ticket Body */}
      <div className="p-8 space-y-6 relative">
        {/* Ticket Cutouts */}
        <div className="absolute top-0 left-0 w-4 h-4 -translate-x-2 -translate-y-2 bg-gray-50 rounded-full" />
        <div className="absolute top-0 right-0 w-4 h-4 translate-x-2 -translate-y-2 bg-gray-50 rounded-full" />

        <div className="space-y-4">
          <div className="flex justify-between items-center group">
            <span className="text-gray-400 text-sm font-medium group-hover:text-mocha-500 transition-colors">
              Product
            </span>
            <span className="text-gray-700 font-medium font-sans">
              {prepareData.orderName}
            </span>
          </div>
          <div className="flex justify-between items-center group">
            <span className="text-gray-400 text-sm font-medium group-hover:text-mocha-500 transition-colors">
              Order ID
            </span>
            <span className="text-gray-600 text-xs font-mono bg-mocha-50 px-2 py-1 rounded">
              {prepareData.orderId.slice(0, 12)}...
            </span>
          </div>
          <div className="border-t border-mocha-100 my-4" />
          <div className="flex justify-between items-center">
            <span className="text-mocha-900 font-bold text-lg">Total</span>
            <span className="text-3xl font-bold font-sans text-transparent bg-clip-text bg-gradient-to-r from-mocha-600 to-mocha-800">
              {prepareData.amount.toLocaleString()}
              <span className="text-base text-gray-400 font-normal ml-1">
                KRW
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-white/50">
        <motion.button
          whileHover={{ scale: 1.01, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePayment}
          className="w-full relative overflow-hidden bg-[#3D302A] hover:bg-black text-white p-5 rounded-2xl shadow-lg shadow-black/10 group transition-all duration-300"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />

          <span className="relative z-20 flex items-center justify-center gap-3 font-medium text-lg">
            Pay Now
            <CheckCircle2 className="w-5 h-5 text-sage-400 group-hover:text-sage-300 transition-colors" />
          </span>
        </motion.button>

        <div className="flex justify-center items-center gap-2 mt-4 text-[10px] text-gray-400 uppercase tracking-wider">
          <Lock className="w-3 h-3" />
          Secured by Toss Payments
        </div>
      </div>
    </motion.div>
  );
}
