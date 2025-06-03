export function generateDriverId(vehicleNumber: string): string {
	return `D${vehicleNumber}`;
}

export function generateDriverPassword(vehicleNumber: string): string {
	const randomNum = Math.floor(1000 + Math.random() * 9000);
	return `${vehicleNumber}${randomNum}`;
}
