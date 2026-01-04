import type { CreditPackage } from "@/types/payment";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CreditPackageCardProps {
  packageData: CreditPackage;
  selected: boolean;
  onSelect: (id: number) => void;
}

export function CreditPackageCard({
  packageData,
  selected,
  onSelect,
}: CreditPackageCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:border-mocha-500 hover:shadow-md",
        selected ? "border-mocha-500 bg-mocha-50 ring-1 ring-mocha-500" : ""
      )}
      onClick={() => onSelect(packageData.id)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          {packageData.name}
        </CardTitle>
        {packageData.isPopular && (
          <Badge variant="secondary" className="bg-mocha-100 text-mocha-700">
            인기
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {packageData.price.toLocaleString()}원
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          기본 {packageData.creditAmount} 크레딧
          {packageData.bonusCredit > 0 && (
            <span className="ml-1 font-medium text-green-600">
              +{packageData.bonusCredit} 보너스
            </span>
          )}
        </div>
        <div className="mt-1 text-sm font-semibold text-mocha-600">
          총 {packageData.creditAmount + packageData.bonusCredit} 크레딧
        </div>
      </CardContent>
    </Card>
  );
}
