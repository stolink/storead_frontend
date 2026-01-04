import { useSearchParams, useNavigate } from "react-router-dom";
import { PaymentLayout } from "@/components/payment/PaymentLayout";
import { motion } from "framer-motion";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { useState } from "react";

export function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");

  const [showDetails, setShowDetails] = useState(false);

  return (
    <PaymentLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-mocha-900/10 border border-mocha-100 max-w-md mx-auto"
      >
        <div className="p-10 text-center relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3"
            >
              <AlertCircle className="w-10 h-10 text-red-400" />
            </motion.div>

            <h2 className="text-2xl font-bold font-serif text-espresso-900 mb-3">
              결제가 중단되었습니다
            </h2>

            <p className="text-mocha-500 mb-8 leading-relaxed">
              요청하신 결제를 처리하지 못했습니다.
              <br />
              일시적인 네트워크 오류일 수 있습니다.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate("/credits/charge")}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-mocha-900 text-white font-medium hover:bg-mocha-800 transition-all active:scale-98 shadow-lg shadow-mocha-900/10"
              >
                <RotateCcw className="w-4 h-4" />
                다시 시도하기
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-transparent text-mocha-600 font-medium hover:bg-mocha-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                홈으로 돌아가기
              </button>
            </div>

            {/* Technical Details Accordion */}
            <div className="mt-8 pt-6 border-t border-dashed border-mocha-200">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-mocha-400 hover:text-mocha-600 underline underline-offset-4 transition-colors"
              >
                {showDetails ? "상세 정보 숨기기" : "왜 실패했나요?"}
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: showDetails ? "auto" : 0,
                  opacity: showDetails ? 1 : 0,
                }}
                className="overflow-hidden"
              >
                <div className="pt-4 text-left bg-red-50/50 rounded-lg p-4 mt-2 text-xs space-y-2 font-mono text-red-800/80">
                  <p>Code: {code}</p>
                  <p>Message: {message}</p>
                  <p className="truncate">Order ID: {orderId}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </PaymentLayout>
  );
}
