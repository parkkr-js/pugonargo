class FirestoreReadCounter {
	private static instance: FirestoreReadCounter;
	private readCount = 0;
	private operationLogs: Array<{
		operation: string;
		count: number;
		timestamp: Date;
	}> = [];

	private constructor() {}

	static getInstance(): FirestoreReadCounter {
		if (!FirestoreReadCounter.instance) {
			FirestoreReadCounter.instance = new FirestoreReadCounter();
		}
		return FirestoreReadCounter.instance;
	}

	increment(count = 1, operation = "unknown"): void {
		this.readCount += count;
		this.operationLogs.push({
			operation,
			count,
			timestamp: new Date(),
		});
	}

	getTotalReads(): number {
		return this.readCount;
	}

	getOperationLogs(): Array<{
		operation: string;
		count: number;
		timestamp: Date;
	}> {
		return this.operationLogs;
	}

	reset(): void {
		this.readCount = 0;
		this.operationLogs = [];
		// console.log("[Firestore Read] Counter reset");
	}

	printSummary(): void {
		console.group("Firestore Read Operations Summary");
		// console.log(`Total Reads: ${this.readCount}`);
		console.table(this.operationLogs);
		console.groupEnd();
	}
}

export const readCounter = FirestoreReadCounter.getInstance();
