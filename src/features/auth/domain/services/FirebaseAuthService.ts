import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	serverTimestamp,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "../../../../firebase/firebaseConfig";
import { verifyPassword } from "../../../../utils/password";
import type {
	AdminUser,
	AuthUser,
	DriverUser,
	LoginCredentials,
} from "../entities/AuthTypes";
import type { IAuthRepository } from "../interfaces/IAuthRepository";

export class FirebaseAuthService implements IAuthRepository {
	private auth = getAuth();

	async authenticate(credentials: LoginCredentials): Promise<AuthUser> {
		const { email, password } = credentials;

		// 관리자 사용자 조회 시도
		const adminUser = await this.findAdminUserByEmail(email);
		if (adminUser) {
			// Firebase 인증
			const userCredential = await signInWithEmailAndPassword(
				this.auth,
				email,
				password,
			);
			await this.updateLastLoginAt(userCredential.user.uid);
			return adminUser;
		}

		// 기사 사용자 조회 시도
		const driverUser = await this.findDriverUserByUserId(email);
		if (driverUser) {
			// 비밀번호 검증
			if (!verifyPassword(password, driverUser.passwordHash)) {
				throw new Error("비밀번호가 일치하지 않습니다.");
			}
			await this.updateLastLoginAt(driverUser.id);
			return driverUser;
		}

		throw new Error("사용자 정보를 찾을 수 없습니다.");
	}

	async logout(): Promise<void> {
		await signOut(this.auth);
	}

	async restoreSession(): Promise<AuthUser | null> {
		const currentUser = this.auth.currentUser;
		if (!currentUser) {
			return null;
		}

		const userId = currentUser.uid;

		// 관리자 사용자 조회 시도
		const adminUser = await this.findAdminUser(userId);
		if (adminUser) {
			return adminUser;
		}

		// 기사 사용자 조회 시도
		const driverUser = await this.findDriverUser(userId);
		if (driverUser) {
			return driverUser;
		}

		// 사용자를 찾을 수 없는 경우 로그아웃
		await signOut(this.auth);
		return null;
	}

	private async findAdminUserByEmail(email: string): Promise<AdminUser | null> {
		const adminQuery = query(
			collection(db, "adminUser"),
			where("email", "==", email),
		);
		const querySnapshot = await getDocs(adminQuery);

		if (querySnapshot.empty) {
			return null;
		}

		const adminDoc = querySnapshot.docs[0];
		const adminData = adminDoc.data();

		return {
			id: adminDoc.id,
			email: adminData.email,
			userType: "admin",
			name: adminData.name,
			vehicleNumber: "관리자",
			lastLoginAt:
				adminData.lastLoginAt?.toDate().toISOString() ||
				new Date().toISOString(),
		};
	}

	private async findDriverUserByUserId(
		userId: string,
	): Promise<DriverUser | null> {
		const driverQuery = query(
			collection(db, "drivers"),
			where("userId", "==", userId),
		);
		const querySnapshot = await getDocs(driverQuery);

		if (querySnapshot.empty) {
			return null;
		}

		const driverDoc = querySnapshot.docs[0];
		const driverData = driverDoc.data();

		return {
			id: driverDoc.id,
			email: driverData.email,
			userType: "driver",
			dumpWeight: driverData.dumpWeight,
			groupNumber: driverData.groupNumber,
			vehicleNumber: driverData.vehicleNumber,
			createdAt: driverData.createdAt.toDate().toISOString(),
			lastLoginAt:
				driverData.lastLoginAt?.toDate().toISOString() ||
				new Date().toISOString(),
			passwordHash: driverData.passwordHash,
		};
	}

	private async findAdminUser(userId: string): Promise<AdminUser | null> {
		const adminDoc = await getDoc(doc(db, "adminUser", userId));
		if (!adminDoc.exists()) {
			return null;
		}

		const adminData = adminDoc.data();
		return {
			id: userId,
			email: adminData.email,
			userType: "admin",
			name: adminData.name,
			vehicleNumber: "관리자",
			lastLoginAt:
				adminData.lastLoginAt?.toDate().toISOString() ||
				new Date().toISOString(),
		};
	}

	private async findDriverUser(userId: string): Promise<DriverUser | null> {
		const driverDoc = await getDoc(doc(db, "drivers", userId));
		if (!driverDoc.exists()) {
			return null;
		}

		const driverData = driverDoc.data();
		return {
			id: userId,
			email: driverData.email,
			userType: "driver",
			dumpWeight: driverData.dumpWeight,
			groupNumber: driverData.groupNumber,
			vehicleNumber: driverData.vehicleNumber,
			createdAt: driverData.createdAt.toDate().toISOString(),
			lastLoginAt:
				driverData.lastLoginAt?.toDate().toISOString() ||
				new Date().toISOString(),
			passwordHash: driverData.passwordHash,
		};
	}

	private async updateLastLoginAt(userId: string): Promise<void> {
		const currentUser = this.auth.currentUser;
		if (!currentUser) {
			throw new Error("인증된 사용자가 없습니다.");
		}

		// 관리자 사용자인지 확인
		const adminDoc = await getDoc(doc(db, "adminUser", userId));
		if (adminDoc.exists()) {
			await updateDoc(doc(db, "adminUser", userId), {
				lastLoginAt: serverTimestamp(),
			});
			return;
		}

		// 기사 사용자인지 확인
		const driverDoc = await getDoc(doc(db, "drivers", userId));
		if (driverDoc.exists()) {
			await updateDoc(doc(db, "drivers", userId), {
				lastLoginAt: serverTimestamp(),
			});
			return;
		}

		throw new Error("사용자 정보를 찾을 수 없습니다.");
	}
}
