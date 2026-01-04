import { useEffect, useRef } from "react";
import {
  loadPaymentWidget,
  type PaymentWidgetInstance,
} from "@tosspayments/payment-widget-sdk";
import type { PaymentPrepareResponse } from "@/types/payment";
import { Button } from "@/components/ui/button";

interface PaymentWidgetProps {
  prepareData: PaymentPrepareResponse;
  clientKey: string;
}

export function PaymentWidget({ prepareData, clientKey }: PaymentWidgetProps) {
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance["renderPaymentMethods"]
  > | null>(null);

  useEffect(() => {
    (async () => {
      if (!clientKey) {
        console.error("No client key provided");
        return;
      }

      // 1. 결제 위젯 초기화
      const paymentWidget = await loadPaymentWidget(
        clientKey,
        prepareData.customerKey
      );

      // 2. 결제 방법 위젯 렌더링
      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        "#payment-widget",
        { value: prepareData.amount },
        { variantKey: "DEFAULT" }
      );

      // 3. 이용약관 위젯 렌더링
      paymentWidget.renderAgreement("#agreement");

      paymentWidgetRef.current = paymentWidget;
      paymentMethodsWidgetRef.current = paymentMethodsWidget;
    })();
  }, [prepareData, clientKey]);

  const handlePayment = async () => {
    const paymentWidget = paymentWidgetRef.current;

    try {
      if (!paymentWidget) return;

      // 결제 요청
      await paymentWidget.requestPayment({
        orderId: prepareData.orderId,
        orderName: prepareData.orderName,
        successUrl: window.location.origin + prepareData.successUrl,
        failUrl: window.location.origin + prepareData.failUrl,
        customerEmail: "customer@example.com", // TODO: 실제 사용자 이메일 연동
        customerName: "StoLink User", // TODO: 실제 사용자 이름 연동
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
    }
  };

  return (
    <div className="w-full space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <div id="payment-widget" className="min-h-[400px]" />
      <div id="agreement" />
      <div className="flex justify-end pt-4">
        <Button
          onClick={handlePayment}
          size="lg"
          className="w-full bg-mocha-500 hover:bg-mocha-600"
        >
          {prepareData.amount.toLocaleString()}원 결제하기
        </Button>
      </div>
    </div>
  );
}
