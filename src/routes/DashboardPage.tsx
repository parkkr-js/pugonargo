import { useState } from "react";
import { PaymentSummaryCards } from "../features/paymentSummary/presentation/components/PaymentSummaryCards";
import YearMonthSelector from "../features/paymentSummary/presentation/components/YearMonthSelector";

export const DashboardPage = () => {
	const [selectedYearMonth, setSelectedYearMonth] = useState<string>("");

	return (
		<>
			<YearMonthSelector onYearMonthChange={setSelectedYearMonth} />
			{selectedYearMonth && (
				<PaymentSummaryCards dateRange={selectedYearMonth} />
			)}
		</>
	);
};
