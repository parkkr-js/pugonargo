// src/features/drivers/domain/services/DriverService.ts
import {
	Timestamp,
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "../../../../firebase/firebaseConfig";
import { generatePassword, generateUserId } from "../../../../utils/password";
import type {
	CreateDriverRequest,
	CreateDriverResponse,
	Driver,
	UpdateDriverRequest,
} from "../entities/Driver";
import type { DriverRepository } from "../interfaces/DriverRepository";

// 🔥 Firebase 문서 데이터 타입 정의
interface FirebaseDriverDoc {
	userId: string;
	vehicleNumber: string;
	group: string;
	dumpWeight: number;
	password: string;
	createdAt: Timestamp;
	updatedAt?: Timestamp;
}

const serializeTimestamp = (
	timestamp: Timestamp | undefined,
): string | undefined => {
	return timestamp?.toDate()?.toISOString();
};

const serializeTimestampRequired = (
	timestamp: Timestamp | undefined,
): string => {
	return timestamp?.toDate()?.toISOString() || new Date().toISOString();
};

export class DriverService implements DriverRepository {
	private readonly collectionName = "drivers";

	async getAllDrivers(): Promise<Driver[]> {
		try {
			const q = query(
				collection(db, this.collectionName),
				orderBy("vehicleNumber", "asc"),
			);
			const querySnapshot = await getDocs(q);

			return querySnapshot.docs.map((docSnapshot) => {
				const data = docSnapshot.data() as FirebaseDriverDoc;

				return {
					id: docSnapshot.id,
					userId: data.userId,
					vehicleNumber: data.vehicleNumber,
					group: data.group,
					dumpWeight: data.dumpWeight,
					password: data.password,
					createdAt: serializeTimestampRequired(data.createdAt),
					updatedAt: serializeTimestamp(data.updatedAt),
				} satisfies Driver;
			});
		} catch (error) {
			console.error("기사 목록 조회 실패:", error);
			throw new Error("기사 목록을 불러오는데 실패했습니다.");
		}
	}

	async checkVehicleNumberExists(vehicleNumber: string): Promise<boolean> {
		try {
			const q = query(
				collection(db, this.collectionName),
				where("vehicleNumber", "==", vehicleNumber),
			);
			const querySnapshot = await getDocs(q);
			return !querySnapshot.empty;
		} catch (error) {
			console.error("차량번호 중복 확인 실패:", error);
			throw new Error("차량번호 중복 확인에 실패했습니다.");
		}
	}

	async createDriver(data: CreateDriverRequest): Promise<CreateDriverResponse> {
		try {
			const exists = await this.checkVehicleNumberExists(data.vehicleNumber);
			if (exists) {
				throw new Error(`이미 등록된 차량번호(${data.vehicleNumber})입니다.`);
			}

			const userId = generateUserId(data.vehicleNumber);
			const password = generatePassword();
			const now = new Date();

			// 🔥 Firebase에 저장할 데이터 (Timestamp 사용)
			const newDriverData: Omit<
				FirebaseDriverDoc,
				"updatedAt" | "lastLoginAt"
			> = {
				userId,
				vehicleNumber: data.vehicleNumber,
				group: data.group,
				dumpWeight: data.dumpWeight,
				password,
				createdAt: Timestamp.fromDate(now),
			};

			const docRef = await addDoc(
				collection(db, this.collectionName),
				newDriverData,
			);

			const driver: Driver = {
				id: docRef.id,
				userId,
				vehicleNumber: data.vehicleNumber,
				group: data.group,
				dumpWeight: data.dumpWeight,
				password,
				createdAt: now.toISOString(),
			};

			return { driver, password };
		} catch (error: unknown) {
			console.error("기사 생성 실패:", error);
			if (
				error instanceof Error &&
				error.message.includes("이미 등록된 차량번호")
			) {
				throw error;
			}
			throw new Error("기사 생성 중 오류가 발생했습니다.");
		}
	}

	async updateDriver(data: UpdateDriverRequest): Promise<Driver> {
		try {
			const driverRef = doc(db, this.collectionName, data.id);

			// 🔥 업데이트할 데이터 준비
			const updateData: Partial<FirebaseDriverDoc> = {};

			if (data.vehicleNumber !== undefined) {
				updateData.vehicleNumber = data.vehicleNumber;
			}
			if (data.group !== undefined) {
				updateData.group = data.group;
			}
			if (data.dumpWeight !== undefined) {
				updateData.dumpWeight = data.dumpWeight;
			}

			updateData.updatedAt = Timestamp.fromDate(new Date());

			await updateDoc(driverRef, updateData);

			// 🔥 업데이트된 문서 다시 조회해서 정확한 데이터 반환
			const updatedDoc = await getDoc(driverRef);
			if (!updatedDoc.exists()) {
				throw new Error("수정된 기사 정보를 찾을 수 없습니다.");
			}

			const updatedData = updatedDoc.data() as FirebaseDriverDoc;

			return {
				id: data.id,
				userId: updatedData.userId,
				vehicleNumber: updatedData.vehicleNumber,
				group: updatedData.group,
				dumpWeight: updatedData.dumpWeight,
				password: updatedData.password,
				createdAt: serializeTimestampRequired(updatedData.createdAt),
				updatedAt: serializeTimestamp(updatedData.updatedAt),
			} satisfies Driver;
		} catch (error: unknown) {
			console.error("기사 수정 실패:", error);
			if (
				error instanceof Error &&
				error.message.includes("이미 등록된 차량번호")
			) {
				throw error; // 중복 차량번호 에러는 그대로 전달
			}
			throw new Error("기사 정보 수정 중 오류가 발생했습니다.");
		}
	}

	async deleteDriver(driverId: string): Promise<void> {
		try {
			const driverRef = doc(db, this.collectionName, driverId);
			await deleteDoc(driverRef);
		} catch (error: unknown) {
			console.error("기사 삭제 실패:", error);
			throw error instanceof Error
				? error
				: new Error("기사를 삭제하는데 실패했습니다.");
		}
	}
}
