import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import type {
	AdminLoginRequest,
	DriverAccount,
	DriverLoginRequest,
	UnifiedLoginRequest,
	User,
} from "../../types/auth";

export class AuthService {
	/**
	 * 통합 로그인 (아이디 형식에 따라 관리자/기사 자동 구분)
	 */
	async unifiedLogin(credentials: UnifiedLoginRequest): Promise<User> {
		const { username, password } = credentials;

		// 이메일 형식인지 확인 (@ 포함 여부)
		const isEmailFormat = username.includes("@");

		if (isEmailFormat) {
			// 이메일 형식이면 관리자 로그인 시도
			return await this.loginAdmin({ email: username, password });
		}

		// 이메일 형식이 아니면 기사 로그인 시도
		return await this.loginDriver({ userId: username, password });
	}

	/**
	 * 관리자 로그인 (Firebase 인증 사용)
	 */
	async loginAdmin(credentials: AdminLoginRequest): Promise<User> {
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				credentials.email,
				credentials.password,
			);

			return {
				id: userCredential.user.uid,
				role: "admin",
				email: userCredential.user.email || undefined,
			};
		} catch (error) {
			console.error("관리자 로그인 실패:", error);
			throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
		}
	}

	/**
	 * 기사 로그인 (Firestore에서 조회)
	 */
	async loginDriver(credentials: DriverLoginRequest): Promise<User> {
		try {
			const q = query(
				collection(db, "drivers"),
				where("userId", "==", credentials.userId),
				where("password", "==", credentials.password),
			);

			const snapshot = await getDocs(q);

			if (snapshot.empty) {
				throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
			}

			const driverDoc = snapshot.docs[0];
			const driverData = driverDoc.data() as DriverAccount;

			return {
				id: driverDoc.id,
				role: "driver",
				vehicleNumber: driverData.vehicleNumber,
				driversDbSupplier: driverData.driversDbSupplier,
			};
		} catch (error) {
			console.error("기사 로그인 실패:", error);
			if (error instanceof Error) {
				throw error;
			}
			throw new Error("로그인에 실패했습니다.");
		}
	}

	/**
	 * 로그아웃
	 */
	async logout(): Promise<void> {
		try {
			// Firebase 인증 로그아웃 (관리자인 경우)
			if (auth.currentUser) {
				await signOut(auth);
			}
		} catch (error) {
			console.error("로그아웃 실패:", error);
			// 로그아웃은 실패해도 클라이언트에서 상태를 초기화함
			throw error;
		}
	}
}
