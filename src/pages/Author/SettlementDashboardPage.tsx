import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  FileText,
  AlertCircle,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useSettlementDashboard,
  useSettlements,
  useRevenueTransactions,
  useRequestSettlement,
  useConfirmSettlement,
  useRejectSettlement,
} from "@/hooks/useSettlements";
import type { SettlementResponse } from "@/types/settlement";

// Utility formatting
const formatCurrency = (amount: number) => amount.toLocaleString("ko-KR");
const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(
    2,
    "0",
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const formatMonth = (monthStr: string) => {
  return monthStr.slice(2).replace("-", ".");
};

// Badges
const StatusBadge = ({ status }: { status: SettlementResponse["status"] }) => {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
    PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
  };
  const labels: Record<string, string> = {
    PENDING: "확인 대기",
    CONFIRMED: "정산 확정",
    PROCESSING: "처리중",
    COMPLETED: "정산 완료",
    FAILED: "처리 실패",
    REJECTED: "거절됨",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-1 text-[11px] font-bold tracking-wider rounded-md border",
        styles[status] || "bg-zinc-100 text-zinc-600 border-zinc-200",
      )}
    >
      {labels[status] || status}
    </span>
  );
};

export default function SettlementDashboardPage() {
  const navigate = useNavigate();

  // Queries
  const { data: dashboard, isLoading: isLoadingDashboard } =
    useSettlementDashboard();
  const { data: settlements, isLoading: isLoadingSettlements } = useSettlements(
    0,
    20,
  );
  const { data: transactions, isLoading: isLoadingTx } = useRevenueTransactions(
    0,
    20,
  );

  // Mutations
  const requestMutation = useRequestSettlement();
  const confirmMutation = useConfirmSettlement();
  const rejectMutation = useRejectSettlement();

  // Dialog states
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestPeriodStart, setRequestPeriodStart] = useState("");
  const [requestPeriodEnd, setRequestPeriodEnd] = useState("");

  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Handlers
  const handleOpenRequestModal = () => {
    const now = new Date();
    // Default to last month
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0); // last day of last month

    setRequestPeriodStart(start.toISOString().split("T")[0]);
    setRequestPeriodEnd(end.toISOString().split("T")[0]);
    setIsRequestModalOpen(true);
  };

  const handleRequestSubmit = async () => {
    if (!requestPeriodStart || !requestPeriodEnd) {
      toast.error("기간을 선택해주세요.");
      return;
    }
    if (new Date(requestPeriodStart) >= new Date(requestPeriodEnd)) {
      toast.error("시작일은 종료일보다 이전이어야 합니다.");
      return;
    }

    try {
      await requestMutation.mutateAsync({
        periodStart: requestPeriodStart,
        periodEnd: requestPeriodEnd,
      });
      toast.success("정산 요청이 완료되었습니다.");
      setIsRequestModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "정산 요청에 실패했습니다.");
    }
  };

  const handleConfirm = async (id: string) => {
    if (!confirm("이 정산을 확인하시겠습니까? 확인 후에는 취소할 수 없습니다."))
      return;

    try {
      await confirmMutation.mutateAsync(id);
      toast.success("정산이 확정되었습니다.");
    } catch (err: any) {
      toast.error(err.message || "정산 확인에 실패했습니다.");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error("거절 사유를 입력해주세요.");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        settlementId: rejectTarget,
        reason: rejectReason.trim(),
      });
      toast.success("정산이 거절되었습니다.");
      setRejectTarget(null);
      setRejectReason("");
    } catch (err: any) {
      toast.error(err.message || "거절 처리에 실패했습니다.");
    }
  };

  // Loading state
  const isLoading = isLoadingDashboard || isLoadingSettlements || isLoadingTx;

  return (
    <div className="min-h-screen bg-paper relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-amber-200/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-mocha-200/20 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-warm border-b border-mocha-200/30">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate("/author")}
                className="p-2.5 rounded-xl bg-white/50 hover:bg-white/80 border border-mocha-200/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
              >
                <ChevronLeft className="h-5 w-5 text-mocha-700 group-hover:text-mocha-900" />
              </button>
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-1"
                >
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20 shadow-sm">
                    Author Studio
                  </span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-heading font-bold text-espresso-900 flex items-center gap-2"
                >
                  정산{" "}
                  <span className="text-amber-700 font-serif italic">
                    대시보드
                  </span>
                </motion.h1>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={handleOpenRequestModal}
                className="bg-espresso-900 hover:bg-mocha-900 text-white rounded-xl px-5 h-11 font-medium shadow-lg shadow-espresso-900/20 hover:shadow-xl hover:shadow-espresso-900/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" /> 정산 요청
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 relative z-10 space-y-8 pb-20">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-paper/50 backdrop-blur-sm min-h-[500px]">
            <div className="w-10 h-10 rounded-full border-4 border-mocha-200 border-t-amber-500 animate-spin" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl glass-card border border-mocha-200 shadow-md relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 opacity-80" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold tracking-wide text-mocha-700 uppercase">
                누적 수익
              </h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-serif font-bold text-espresso-900">
                {formatCurrency(dashboard?.totalEarned || 0)}
              </span>
              <span className="text-sm text-mocha-600 font-medium">크레딧</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl glass-card border border-mocha-200 shadow-md relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mocha-400 to-espresso-900 opacity-80" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-mocha-100 text-mocha-700">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold tracking-wide text-mocha-700 uppercase">
                정산 대기
              </h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-serif font-bold text-espresso-900">
                {formatCurrency(dashboard?.pendingBalance || 0)}
              </span>
              <span className="text-sm text-mocha-600 font-medium">크레딧</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl glass-card border border-mocha-200 shadow-md relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-80" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold tracking-wide text-mocha-700 uppercase">
                정산 완료
              </h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-serif font-bold text-espresso-900">
                {formatCurrency(dashboard?.totalSettled || 0)}
              </span>
              <span className="text-sm text-mocha-600 font-medium">크레딧</span>
            </div>
          </motion.div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card border border-mocha-200 rounded-2xl shadow-md p-6"
          >
            <div className="flex items-center gap-2 mb-6 border-b border-mocha-200/50 pb-3">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-serif font-bold text-espresso-900">
                월별 수익 추이
              </h2>
            </div>
            <div className="h-[240px] w-full">
              {dashboard?.revenueByMonth &&
              dashboard.revenueByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...dashboard.revenueByMonth].reverse()}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e5e5"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatMonth}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      tickFormatter={(value) =>
                        value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                      }
                    />
                    <Tooltip
                      cursor={{ fill: "#f4f4f5", opacity: 0.5 }}
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-espresso-900 text-white p-3 rounded-xl shadow-xl border border-mocha-700 text-xs">
                              <p className="font-bold mb-1 opacity-90">
                                {formatMonth(data.month)}
                              </p>
                              <p className="font-serif text-[15px]">
                                {formatCurrency(data.totalRevenue)} 크레딧
                              </p>
                              <p className="text-mocha-300 mt-1">
                                {data.transactionCount}건의 거래
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="totalRevenue"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    >
                      {dashboard.revenueByMonth.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill="url(#colorRevenue)" />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#b45309"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#d97706"
                          stopOpacity={0.8}
                        />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-mocha-600">
                  <BarChart3 className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">수익 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Revenue by Work Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card border border-mocha-200 rounded-2xl shadow-md p-6 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-6 border-b border-mocha-200/50 pb-3">
              <FileText className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-serif font-bold text-espresso-900">
                작품별 수익
              </h2>
            </div>

            <div className="flex-1 overflow-auto no-scrollbar">
              {dashboard?.revenueByWork &&
              dashboard.revenueByWork.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.revenueByWork.map((work) => {
                    const maxRev = Math.max(
                      ...dashboard.revenueByWork.map((w) => w.totalRevenue),
                      1,
                    );
                    const pct = Math.max((work.totalRevenue / maxRev) * 100, 2);

                    return (
                      <div key={work.workId} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span
                            className="font-bold text-espresso-900 truncate max-w-[200px]"
                            title={work.workTitle}
                          >
                            {work.workTitle}
                          </span>
                          <span className="font-serif font-bold text-amber-700">
                            {formatCurrency(work.totalRevenue)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-mocha-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                            />
                          </div>
                          <span className="text-[11px] text-mocha-500 w-10 text-right">
                            {work.transactionCount}건
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-mocha-600 min-h-[160px]">
                  <FileText className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">작품별 분배 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card border border-mocha-200 rounded-2xl shadow-md overflow-hidden"
        >
          <div className="p-5 border-b border-mocha-200/50 bg-white/40">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-mocha-700" />
              <h2 className="text-lg font-serif font-bold text-espresso-900">
                최근 거래 내역
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase tracking-wider text-mocha-600 bg-mocha-50/50">
                <tr>
                  <th className="px-5 py-4 font-bold">유형</th>
                  <th className="px-5 py-4 font-bold">크레딧</th>
                  <th className="px-5 py-4 font-bold hidden sm:table-cell">
                    수수료
                  </th>
                  <th className="px-5 py-4 font-bold">내 수익</th>
                  <th className="px-5 py-4 font-bold">일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mocha-100/60 font-medium">
                {transactions?.content && transactions.content.length > 0 ? (
                  transactions.content.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-white/60 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "px-2 py-1 text-[10px] uppercase font-bold rounded shadow-sm border",
                            tx.type === "CHAPTER_SALE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : tx.type === "REFUND"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-amber-50 text-amber-700 border-amber-100",
                          )}
                        >
                          {tx.type === "CHAPTER_SALE"
                            ? "판매"
                            : tx.type === "REFUND"
                              ? "환불"
                              : "조정"}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-serif text-mocha-900">
                        {formatCurrency(tx.creditAmount)}
                      </td>
                      <td className="px-5 py-3 font-serif text-mocha-500 hidden sm:table-cell">
                        {formatCurrency(tx.platformFee)}
                      </td>
                      <td
                        className={cn(
                          "px-5 py-3 font-serif font-bold",
                          tx.authorShare >= 0
                            ? "text-emerald-600"
                            : "text-red-600",
                        )}
                      >
                        {tx.authorShare > 0 ? "+" : ""}
                        {formatCurrency(tx.authorShare)}
                      </td>
                      <td className="px-5 py-3 text-xs text-mocha-500 font-sans tracking-wide">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-mocha-500"
                    >
                      거래 내역이 존재하지 않습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Settlements Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card border border-mocha-200 rounded-2xl shadow-md overflow-hidden"
        >
          <div className="p-5 border-b border-mocha-200/50 bg-white/40">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-mocha-700" />
              <h2 className="text-lg font-serif font-bold text-espresso-900">
                정산 내역
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase tracking-wider text-mocha-600 bg-mocha-50/50">
                <tr>
                  <th className="px-5 py-4 font-bold">기간</th>
                  <th className="px-5 py-4 font-bold hidden md:table-cell">
                    총액
                  </th>
                  <th className="px-5 py-4 font-bold hidden md:table-cell">
                    수수료
                  </th>
                  <th className="px-5 py-4 font-bold">정산액</th>
                  <th className="px-5 py-4 font-bold">상태</th>
                  <th className="px-5 py-4 font-bold text-right">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mocha-100/60 font-medium tracking-tight">
                {settlements?.content && settlements.content.length > 0 ? (
                  settlements.content.map((settlement: any) => (
                    <tr
                      key={settlement.id}
                      className="hover:bg-white/60 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap text-[13px] text-mocha-800 tracking-normal">
                        {settlement.periodStart}{" "}
                        <span className="text-mocha-400 mx-1">~</span>{" "}
                        {settlement.periodEnd}
                      </td>
                      <td className="px-5 py-4 font-serif text-mocha-900 hidden md:table-cell">
                        {formatCurrency(settlement.grossAmount)}
                      </td>
                      <td className="px-5 py-4 font-serif text-mocha-500 hidden md:table-cell">
                        {formatCurrency(settlement.platformFeeTotal)}
                      </td>
                      <td className="px-5 py-4 font-serif font-bold text-espresso-900 text-[15px]">
                        {formatCurrency(settlement.netAmount)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={settlement.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {settlement.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2.5 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800"
                              onClick={() => handleConfirm(settlement.id)}
                              disabled={confirmMutation.isPending}
                            >
                              확인
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2.5 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                              onClick={() => setRejectTarget(settlement.id)}
                            >
                              거절
                            </Button>
                          </div>
                        ) : (
                          <span className="text-mocha-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-mocha-500"
                    >
                      정산 내역이 존재하지 않습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      {/* Request Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass-card border flex flex-col gap-0 border-mocha-200 shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-espresso-900 to-mocha-800 p-6 pb-8 px-6 text-white relative">
            {/* Sparkles pattern overlay */}
            <div
              className={`absolute inset-0 opacity-10 bg-[url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")]`}
            />
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-xl font-serif font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                정산 요청
              </DialogTitle>
              <DialogDescription className="text-mocha-100/90 text-[13px] pt-1 leading-relaxed">
                정산을 요청할 기간을 선택해주세요. 선택한 기간 내의 대기 중인
                모든 거래가 집계됩니다.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-4 pb-4">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="periodStart"
                  className="text-xs font-bold text-mocha-700 uppercase"
                >
                  시작일
                </Label>
                <Input
                  id="periodStart"
                  type="date"
                  value={requestPeriodStart}
                  onChange={(e) => setRequestPeriodStart(e.target.value)}
                  className="bg-white border-mocha-200 focus-visible:ring-amber-500 h-11"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="periodEnd"
                  className="text-xs font-bold text-mocha-700 uppercase"
                >
                  종료일
                </Label>
                <Input
                  id="periodEnd"
                  type="date"
                  value={requestPeriodEnd}
                  onChange={(e) => setRequestPeriodEnd(e.target.value)}
                  className="bg-white border-mocha-200 focus-visible:ring-amber-500 h-11"
                />
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3 mt-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                최소 정산 가능 금액은 5,000 크레딧 이상입니다.
                <br />
                같은 달에 중복으로 정산을 요청할 수 없습니다.
              </p>
            </div>
          </div>
          <DialogFooter className="p-4 bg-mocha-50 border-t border-mocha-100 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsRequestModalOpen(false)}
              className="bg-white border-mocha-200 text-mocha-700 hover:bg-mocha-100"
            >
              취소
            </Button>
            <Button
              onClick={handleRequestSubmit}
              disabled={requestMutation.isPending}
              className="bg-espresso-900 text-white hover:bg-mocha-900 min-w-[100px]"
            >
              {requestMutation.isPending ? "요청 중..." : "정산 접수하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <DialogContent className="sm:max-w-[400px] glass-card border border-red-200 shadow-xl p-0 overflow-hidden">
          <div className="bg-red-50 p-6 pb-4 border-b border-red-100">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 text-red-600" />
                정산 거절
              </DialogTitle>
              <DialogDescription className="text-red-900/70 text-sm pt-1">
                정산 요청을 거절하려는 이유를 작성해주세요. 거절 시 거래는 다시
                대기 상태로 돌아갑니다.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-md">
            <Label
              htmlFor="rejectReason"
              className="text-sm font-bold text-mocha-800 mb-2 block"
            >
              거절 사유
            </Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="금액 계산 오류, 누락된 수익 등 사유를 적어주세요."
              className="bg-white border-mocha-200 focus-visible:ring-red-500 min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter className="p-4 bg-mocha-50 border-t border-mocha-100 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setRejectTarget(null)}
              className="h-9 text-xs border-mocha-200"
            >
              취소
            </Button>
            <Button
              onClick={handleRejectSubmit}
              disabled={rejectMutation.isPending}
              className="h-9 text-xs bg-red-600 text-white hover:bg-red-700"
            >
              {rejectMutation.isPending ? "처리 중..." : "거절 확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
