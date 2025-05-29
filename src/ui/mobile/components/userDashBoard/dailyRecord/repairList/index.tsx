// src/ui/mobile/components/userDashBoard/FuelList.tsx
import { PlusOutlined } from "@ant-design/icons";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { App, Button, Card, Input, Spin, Typography } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUserVehicleNumber } from "../../../../../../features/auth/application/selectors/authSelector";
import {
	useCreateFuelRecordMutation,
	useDeleteFuelRecordsMutation,
	useGetFuelRecordsQuery,
} from "../../../../../../features/fuel/api/fuel.api";
import { selectFuelStatistics } from "../../../../../../features/fuel/selectors/fuel.selectors";
import type { RootState } from "../../../../../../store";

const { Text } = Typography;

interface FuelListProps {
	selectedDate: string; // 'yyyy-mm-dd' 형식
}

interface FuelFormData {
	fuelPrice: number;
	fuelAmount: number;
}

export const FuelList = ({ selectedDate }: FuelListProps) => {
	const { message } = App.useApp();
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [formData, setFormData] = useState<FuelFormData>({
		fuelPrice: 0,
		fuelAmount: 0,
	});
	const [priceInput, setPriceInput] = useState("");
	const [amountInput, setAmountInput] = useState("");

	const vehicleNumber = useSelector(selectCurrentUserVehicleNumber);

	// ✅ 주유 기록 조회 추가
	const {
		data: fuelRecords = [],
		isLoading: isFuelRecordsLoading,
		error: fuelRecordsError,
	} = useGetFuelRecordsQuery(
		{ vehicleNumber, date: selectedDate },
		{ skip: !vehicleNumber || !selectedDate },
	);

	const statistics = useSelector((state: RootState) =>
		selectFuelStatistics(state, {
			vehicleNumber: vehicleNumber,
			date: selectedDate,
		}),
	);

	const [createFuelRecord, { isLoading: isCreating }] =
		useCreateFuelRecordMutation();
	const [deleteFuelRecords, { isLoading: isDeleting }] =
		useDeleteFuelRecordsMutation();

	const handleInputChange = (field: keyof FuelFormData, value: string) => {
		const numericValue = Number.parseInt(value) || 0;

		if (numericValue < 0) return;

		if (field === "fuelPrice") {
			setPriceInput(value);
			setFormData((prev) => ({ ...prev, fuelPrice: numericValue }));
		} else {
			setAmountInput(value);
			setFormData((prev) => ({ ...prev, fuelAmount: numericValue }));
		}
	};

	const resetForm = () => {
		setFormData({ fuelPrice: 0, fuelAmount: 0 });
		setPriceInput("");
		setAmountInput("");
		setIsFormVisible(false);
	};

	const handleSave = async () => {
		try {
			if (formData.fuelPrice <= 0 || formData.fuelAmount <= 0) {
				message.error("단가와 주유량을 모두 입력해주세요.");
				return;
			}

			await createFuelRecord({
				vehicleNumber,
				date: selectedDate,
				fuelPrice: formData.fuelPrice,
				fuelAmount: formData.fuelAmount,
			}).unwrap();

			message.success("주유 내역이 저장되었습니다.");
			resetForm();
		} catch (error) {
			if (error && typeof error === "object" && "status" in error) {
				const fetchError = error as FetchBaseQueryError;
				switch (fetchError.status) {
					case 400:
						message.error("잘못된 요청입니다. 입력값을 확인해주세요.");
						break;
					case 401:
						message.error("인증이 필요합니다. 다시 로그인해주세요.");
						break;
					case 403:
						message.error("권한이 없습니다.");
						break;
					case 404:
						message.error("요청한 리소스를 찾을 수 없습니다.");
						break;
					case 500:
						message.error(
							"서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
						);
						break;
					default:
						message.error(`저장에 실패했습니다. (${fetchError.status})`);
				}
			} else if (error && typeof error === "object" && "message" in error) {
				const serializedError = error as SerializedError;
				message.error(
					serializedError.message || "알 수 없는 오류가 발생했습니다.",
				);
			} else {
				message.error("저장에 실패했습니다. 다시 시도해주세요.");
			}
			console.error("Fuel record creation error:", error);
		}
	};

	const handleDelete = async () => {
		try {
			await deleteFuelRecords({
				vehicleNumber,
				date: selectedDate,
			}).unwrap();

			message.success("주유 내역이 삭제되었습니다.");
		} catch (error) {
			if (error && typeof error === "object" && "status" in error) {
				const fetchError = error as FetchBaseQueryError;
				switch (fetchError.status) {
					case 400:
						message.error("잘못된 요청입니다.");
						break;
					case 401:
						message.error("인증이 필요합니다. 다시 로그인해주세요.");
						break;
					case 403:
						message.error("권한이 없습니다.");
						break;
					case 404:
						message.error("삭제할 주유 내역을 찾을 수 없습니다.");
						break;
					case 500:
						message.error(
							"서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
						);
						break;
					default:
						message.error(`삭제에 실패했습니다. (${fetchError.status})`);
				}
			} else if (error && typeof error === "object" && "message" in error) {
				const serializedError = error as SerializedError;
				message.error(
					serializedError.message || "알 수 없는 오류가 발생했습니다.",
				);
			} else {
				message.error("삭제에 실패했습니다. 다시 시도해주세요.");
			}
			console.error("Fuel record deletion error:", error);
		}
	};

	const isFormValid = formData.fuelPrice > 0 && formData.fuelAmount > 0;
	const totalCost = formData.fuelPrice * formData.fuelAmount;
	const hasRecords = fuelRecords.length > 0;

	// ✅ 로딩과 에러 상태 수정
	const overallLoading = isFuelRecordsLoading || isCreating || isDeleting;
	const overallError = fuelRecordsError;

	if (overallLoading) {
		return (
			<div className="flex justify-center items-center py-8">
				<Spin size="large" />
			</div>
		);
	}

	if (overallError) {
		let errorMessage = "데이터를 불러오는데 실패했습니다.";

		if (process.env.NODE_ENV === "development") {
			if (typeof overallError === "object" && overallError !== null) {
				if ("status" in overallError) {
					const fetchError = overallError as FetchBaseQueryError;
					if (fetchError.status === "FETCH_ERROR" && fetchError.error) {
						errorMessage = `Fetch error: ${fetchError.error}`;
					} else if ("data" in fetchError && fetchError.data !== undefined) {
						errorMessage = `API error (${fetchError.status})`;
					} else {
						errorMessage = `HTTP status: ${fetchError.status}`;
					}
				} else if (
					"message" in overallError &&
					typeof overallError.message === "string"
				) {
					errorMessage = `Client error: ${overallError.message}`;
				}
			}
			console.error("Overall Error:", overallError);
		}

		return (
			<div className="text-center py-8">
				<Text type="secondary">{errorMessage}</Text>
			</div>
		);
	}

	if (!vehicleNumber) {
		return (
			<div className="text-center py-8">
				<Text type="secondary">해당 기능은 기사님만 이용 가능합니다.</Text>
			</div>
		);
	}

	return (
		<div className="w-full max-w-md mx-auto space-y-4">
			<Card
				title="주유 내역"
				size="small"
				className="w-full"
				styles={{
					body: {
						padding: "16px",
					},
				}}
			>
				{/* 🎯 기존 주유 내역 표시 */}
				{!hasRecords ? (
					<div className="text-center py-4">
						<Text type="secondary">아직 입력된 주유 내역이 없습니다.</Text>
					</div>
				) : (
					<div className="space-y-3">
						{fuelRecords.map((record) => (
							<div
								key={record.id}
								className="border-b pb-3 last:border-b-0 last:pb-0"
							>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="flex justify-between">
										<Text>단가</Text>
										<Text>{record.fuelPrice.toLocaleString()} 원</Text>
									</div>
									<div className="flex justify-between">
										<Text>주유량</Text>
										<Text>{record.fuelAmount} ℓ</Text>
									</div>
								</div>
								<div className="flex justify-between mt-2 font-medium">
									<Text>총 주유비</Text>
									<Text>{record.totalFuelCost.toLocaleString()} 원</Text>
								</div>
							</div>
						))}

						{/* 🎯 여러 개 기록이 있을 때 합계 표시 */}
						{hasRecords && fuelRecords.length > 1 && (
							<div className="border-t pt-3 mt-3">
								<div className="flex justify-between font-medium text-base">
									<Text strong>합계</Text>
									<Text strong>{statistics.totalCost.toLocaleString()} 원</Text>
								</div>
							</div>
						)}
					</div>
				)}

				{/* 🎯 새로운 주유 내역 입력 폼 */}
				{isFormVisible && (
					<div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
						<div className="grid grid-cols-2 gap-2">
							<div>
								<Text className="block mb-1">단가</Text>
								<Input
									type="number"
									min="0"
									value={priceInput}
									onChange={(e) =>
										handleInputChange("fuelPrice", e.target.value)
									}
									placeholder="단가 입력"
									suffix="원"
								/>
							</div>
							<div>
								<Text className="block mb-1">주유량</Text>
								<Input
									type="number"
									min="0"
									value={amountInput}
									onChange={(e) =>
										handleInputChange("fuelAmount", e.target.value)
									}
									placeholder="주유량 입력"
									suffix="ℓ"
								/>
							</div>
						</div>

						<div className="flex justify-between items-center">
							<Text>총 주유비</Text>
							<Text strong>{totalCost.toLocaleString()} 원</Text>
						</div>
					</div>
				)}

				{/* 🎯 버튼 영역 */}
				<div className="mt-4 space-y-2">
					{/* 추가하기 버튼 (항상 표시) */}
					<Button
						type="text"
						icon={<PlusOutlined />}
						onClick={() => setIsFormVisible(!isFormVisible)}
						className="w-full"
						style={{ color: "#666" }}
					>
						추가하기
					</Button>

					{/* 저장하기 버튼 */}
					{isFormVisible ? (
						<Button
							type="primary"
							onClick={handleSave}
							loading={isCreating}
							disabled={!isFormValid}
							className="w-full"
							style={{ backgroundColor: "#1E266F" }}
						>
							저장하기
						</Button>
					) : (
						hasRecords && (
							<Button
								type="primary"
								onClick={handleDelete}
								loading={isDeleting}
								className="w-full"
								style={{ backgroundColor: "#1E266F" }}
							>
								저장하기
							</Button>
						)
					)}
				</div>
			</Card>
		</div>
	);
};
