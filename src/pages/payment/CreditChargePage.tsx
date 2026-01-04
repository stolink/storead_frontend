import { useState, useEffect } from "react";
import { paymentService } from "@/services/paymentService";
import type { CreditPackage, PaymentPrepareResponse } from "@/types/payment";
import { CreditPackageCard } from "@/components/payment/CreditPackageCard";
import { PaymentWidget } from "@/components/payment/PaymentWidget";
import { Loader2, Sparkles, ChevronLeft } from "lucide-react";
import { PaymentLayout } from "@/components/payment/PaymentLayout";
import { motion, AnimatePresence } from "framer-motion";

// TODO: 환경변수로 관리
// const CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"; // Official Docs Test Key (Safe for Public Test)
const CLIENT_KEY =
  import.meta.env.VITE_TOSS_CLIENT_KEY ||
  "test_ck_mBZ1gQ4YVXGpwxBzmlk23l2KPoqN";

export function CreditChargePage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [prepareData, setPrepareData] = useState<PaymentPrepareResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Layout View State: "selection" | "payment"
  const viewState = prepareData ? "payment" : "selection";

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await paymentService.getPackages();
      if (response && response.data) {
        setPackages(response.data);
      }
    } catch (error) {
      console.error("패키지 조회 실패:", error);
      // API 오류 (401 포함) 시 디자인 확인용 Mock Data 사용
      setPackages([
        {
          id: 1,
          name: "Starter Pack",
          price: 5000,
          creditAmount: 5000,
          bonusCredit: 0,
          isPopular: false,
        },
        {
          id: 2,
          name: "Reader's Choice",
          price: 10000,
          creditAmount: 10000,
          bonusCredit: 1000,
          isPopular: true,
        },
        {
          id: 3,
          name: "Premium Collection",
          price: 30000,
          creditAmount: 30000,
          bonusCredit: 5000,
          isPopular: false,
        },
      ]);
    } finally {
      setInitializing(false);
    }
  };

  const handleSelectPackage = async (packageId: number) => {
    if (selectedPackage === packageId && prepareData) return;

    setSelectedPackage(packageId);
    setLoading(true);
    setPrepareData(null);

    // Artificial delay for "Premium Feeling" (avoid instant jank)
    // In production, real network request takes time anyway.
    try {
      const response = await paymentService.preparePayment({ packageId });
      if (response && response.data) {
        // Wait small amount to let UI settle
        setTimeout(() => {
          setPrepareData(response.data);
          setLoading(false);
        }, 600);
      }
    } catch (error) {
      console.error("결제 준비 실패:", error);
      setSelectedPackage(null);
      setLoading(false);
    }
  };

  const handleBackToSelection = () => {
    setPrepareData(null);
    setSelectedPackage(null);
  };

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F4EF]">
        <Loader2 className="h-10 w-10 animate-spin text-mocha-500" />
      </div>
    );
  }

  return (
    <PaymentLayout className="max-w-7xl">
      <div className="relative min-h-[600px]">
        {/* Header - Always visible but morphs position */}
        <motion.div layout className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white/60 text-mocha-800 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm"
          >
            <Sparkles className="w-3 h-3 mr-2" />
            Premium Access
          </motion.div>
          <motion.h1
            layoutId="page-title"
            className="text-4xl md:text-5xl font-bold font-serif text-espresso-900 tracking-tight mb-4"
          >
            {viewState === "selection" ? "Choose Your Pass" : "Confirm Payment"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-mocha-600 text-lg max-w-xl mx-auto"
          >
            {viewState === "selection"
              ? "Unlock the full library with our curated credit packages."
              : "Secure usage of SSL/TLS encryption for your transaction."}
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewState === "selection" ? (
            <motion.div
              key="selection-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4"
            >
              {packages.map((pkg, idx) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <CreditPackageCard
                    packageData={pkg}
                    selected={selectedPackage === pkg.id}
                    onSelect={handleSelectPackage}
                  />
                </motion.div>
              ))}

              {/* Floating Loader Overlay */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white/20 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl"
                >
                  <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-mocha-500" />
                    <span className="text-sm font-medium text-mocha-900">
                      Preparing...
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="payment-widget"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start"
            >
              {/* Left: Summary Card (Morphed from selection) */}
              <div className="space-y-6">
                <button
                  onClick={handleBackToSelection}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-mocha-200 text-espresso-900 hover:bg-mocha-50 transition-all shadow-sm group font-medium text-sm mb-6"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                  Back to Packages
                </button>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-mocha-500 to-espresso-900 rounded-3xl blur-2xl opacity-20" />
                  <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-mocha-500 text-sm font-bold tracking-wider uppercase mb-2">
                      Selected Package
                    </h3>
                    <div className="text-3xl font-serif text-espresso-900 font-bold mb-1">
                      {prepareData?.orderName}
                    </div>
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mocha-600 to-mocha-800 mb-8">
                      {prepareData?.amount.toLocaleString()}{" "}
                      <span className="text-xl text-mocha-400 font-normal">
                        WON
                      </span>
                    </div>

                    <div className="space-y-4 border-t border-mocha-100 pt-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Service Fee</span>
                        <span className="text-gray-900 font-medium">
                          Included
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax</span>
                        <span className="text-gray-900 font-medium">
                          Included
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Payment Widget */}
              <div className="relative">
                <PaymentWidget
                  prepareData={prepareData!}
                  clientKey={CLIENT_KEY}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PaymentLayout>
  );
}
