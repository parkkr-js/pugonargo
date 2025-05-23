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
import {
	generatePassword,
	generateUserId,
	hashPassword,
} from "../../../../utils/password";
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
	groupNumber: number;
	dumpWeight: number;
	passwordHash: string;
	createdAt: Timestamp;
	updatedAt?: Timestamp;
}

// 🔥 Date 직렬화 헬퍼 함수
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
					groupNumber: data.groupNumber,
					dumpWeight: data.dumpWeight,
					passwordHash: data.passwordHash,
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
				throw new Error("이미 존재하는 차량번호입니다.");
			}

			const userId = generateUserId(data.vehicleNumber);
			const password = generatePassword();
			const passwordHash = hashPassword(password);
			const now = new Date();

			// 🔥 Firebase에 저장할 데이터 (Timestamp 사용)
			const newDriverData: Omit<
				FirebaseDriverDoc,
				"updatedAt" | "lastLoginAt"
			> = {
				userId,
				vehicleNumber: data.vehicleNumber,
				groupNumber: data.groupNumber,
				dumpWeight: data.dumpWeight,
				passwordHash,
				createdAt: Timestamp.fromDate(now),
			};

			const docRef = await addDoc(
				collection(db, this.collectionName),
				newDriverData,
			);

			// 🔥 반환할 데이터 (string 타입으로 직렬화)
			const driver: Driver = {
				id: docRef.id,
				userId,
				vehicleNumber: data.vehicleNumber,
				groupNumber: data.groupNumber,
				dumpWeight: data.dumpWeight,
				passwordHash,
				createdAt: now.toISOString(),
			};

			return { driver, password };
		} catch (error: unknown) {
			console.error("기사 생성 실패:", error);
			throw error instanceof Error
				? error
				: new Error("기사를 추가하는데 실패했습니다.");
		}
	}

	async updateDriver(data: UpdateDriverRequest): Promise<Driver> {
		try {
			const driverRef = doc(db, this.collectionName, data.id);

			// 🔥 업데이트할 데이터 준비
			const updateData: Partial<FirebaseDriverDoc> = {};

			if (data.groupNumber !== undefined) {
				updateData.groupNumber = data.groupNumber;
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
				groupNumber: updatedData.groupNumber,
				dumpWeight: updatedData.dumpWeight,
				passwordHash: updatedData.passwordHash,
				createdAt: serializeTimestampRequired(updatedData.createdAt),
				updatedAt: serializeTimestamp(updatedData.updatedAt),
			} satisfies Driver;
		} catch (error: unknown) {
			console.error("기사 수정 실패:", error);
			throw error instanceof Error
				? error
				: new Error("기사 정보를 수정하는데 실패했습니다.");
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
