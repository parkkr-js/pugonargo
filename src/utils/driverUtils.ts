export function generateDriverId(
	vehicleNumber: string,
	supplier: string,
): string {
	// 매입처에서 # 제거하고 차량번호와 조합
	const cleanSupplier = supplier.replace("#", "");
	return `D${cleanSupplier}${vehicleNumber}`;
}

export function generateDriverPassword(
	vehicleNumber: string,
	supplier: string,
): string {
	// 매입처에서 # 제거하고 차량번호의 마지막 2자리만 사용
	const cleanSupplier = supplier.replace("#", "");
	const lastTwoDigits = vehicleNumber.slice(-2);
	const randomNum = Math.floor(10 + Math.random() * 90); // 2자리 랜덤
	return `${cleanSupplier}${lastTwoDigits}${randomNum}`;
}

export function checkDuplicateDriver(
	vehicleNumber: string,
	supplier: string,
	existingDrivers: Array<{
		vehicleNumber: string;
		driversDbSupplier: string;
		id: string;
	}>,
	excludeDriverId?: string,
): boolean {
	return existingDrivers.some(
		(driver) =>
			driver.vehicleNumber === vehicleNumber &&
			driver.driversDbSupplier === supplier &&
			(!excludeDriverId || driver.id !== excludeDriverId),
	);
}
