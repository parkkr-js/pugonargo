export class DriverError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly details?: unknown,
	) {
		super(message);
		this.name = "DriverError";
	}
}

export const DriverErrorCodes = {
	DUPLICATE_VEHICLE_NUMBER: "DUPLICATE_VEHICLE_NUMBER",
	INVALID_VEHICLE_NUMBER: "INVALID_VEHICLE_NUMBER",
	INVALID_GROUP: "INVALID_GROUP",
	INVALID_DUMP_WEIGHT: "INVALID_DUMP_WEIGHT",
	NOT_FOUND: "NOT_FOUND",
	UNKNOWN: "UNKNOWN",
} as const;
