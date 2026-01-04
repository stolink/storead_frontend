import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentService } from "@/services/paymentService";
import { PaymentLayout } from "@/components/payment/PaymentLayout";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Library, RotateCcw } from "lucide-react";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const paymentKey = searchParams.get("paymentKey");
  const amount = searchParams.get("amount");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [resultMessage, setResultMessage] = useState("");
  const [addedCredit, setAddedCredit] = useState<number>(0);

  // Simple count-up effect state
  const [displayCredit, setDisplayCredit] = useState(0);

  useEffect(() => {
    if (!orderId || !paymentKey || !amount) {
      setStatus("error");
      setResultMessage("필수 결제 정보가 누락되었습니다.");
      return;
    }
    confirmPayment();
  }, [orderId, paymentKey, amount]);

  useEffect(() => {
    if (status === "success" && addedCredit > 0) {
      const duration = 1500; // 1.5s
      const steps = 60;
      const stepValue = addedCredit / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        if (step >= steps) {
          setDisplayCredit(addedCredit);
          clearInterval(timer);
        } else {
          setDisplayCredit(Math.floor(stepValue * step));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [status, addedCredit]);

  const confirmPayment = async () => {
    try {
      const response = await paymentService.confirmPayment({
        orderId: orderId!,
        paymentKey: paymentKey!,
        amount: Number(amount),
      });

      if (response && response.status === "OK") {
        setAddedCredit(response.data.creditAmount);
        setStatus("success");
      } else {
        setStatus("error");
        setResultMessage(
          response?.message || "결제 승인 중 오류가 발생했습니다."
        );
      }
    } catch (error: any) {
      console.error("결제 승인 실패:", error);
      setStatus("error");
      setResultMessage(error.message || "서버 통신 오류가 발생했습니다.");
    }
  };

  if (status === "loading") {
    return (
      <PaymentLayout>
        <div className="flex flex-col items-center justify-center p-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
          <Loader2 className="h-12 w-12 animate-spin text-mocha-500 mb-4" />
          <h2 className="text-xl font-medium text-espresso-900 animate-pulse">
            결제를 안전하게 확인하고 있습니다...
          </h2>
          <p className="text-mocha-400 mt-2 text-sm">잠시만 기다려주세요</p>
        </div>
      </PaymentLayout>
    );
  }

  return (
    <PaymentLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-mocha-900/10 border border-sage-100"
      >
        <div className="relative p-12 text-center overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sage-50 to-transparent" />

          {status === "success" ? (
            <>
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10"
              >
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold font-serif text-espresso-900 mb-2"
              >
                결제가 완료되었습니다
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-mocha-500 mb-8"
              >
                새로운 이야기가 당신을 기다리고 있어요.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-sage-50/50 rounded-2xl p-6 mb-8 border border-sage-100"
              >
                <p className="text-sm text-sage-600 font-medium mb-1">
                  총 보유 크레딧
                </p>
                <p className="text-4xl font-bold text-sage-800 tabular-nums">
                  {displayCredit.toLocaleString()} C
                </p>
              </motion.div>
            </>
          ) : (
            <>
              {/* Error State */}
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10">
                <motion.div
                  initial={{ x: -10 }}
                  animate={{ x: [0, -5, 5, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-red-500 text-5xl font-mono">!</div>
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold text-espresso-900 mb-2">
                결제에 실패했습니다
              </h2>
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 max-w-sm mx-auto">
                {resultMessage}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-3 justify-center"
          >
            {status === "error" ? (
              <button
                onClick={() => navigate("/credits/charge")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-mocha-500 text-white font-medium hover:bg-mocha-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                다시 시도하기
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/library")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-mocha-200 text-mocha-700 font-medium hover:bg-mocha-50 transition-colors"
                >
                  <Library className="w-4 h-4" />
                  서재로 가기
                </button>
                <button
                  onClick={() => navigate("/discovery")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-mocha-900 text-white font-medium hover:bg-mocha-800 transition-colors shadow-lg shadow-mocha-900/20"
                >
                  작품 보러가기
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </PaymentLayout>
  );
}
