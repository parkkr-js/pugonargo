export type UserType = "admin" | "driver";

export interface BaseUser {
	id: string;
	email: string;
	userType: UserType;
	lastLoginAt: string;
}

export interface AdminUser extends BaseUser {
	userType: "admin";
	name: string;
	vehicleNumber: string;
}

export interface DriverUser extends BaseUser {
	userType: "driver";
	dumpWeight: number;
	groupNumber: string;
	vehicleNumber: string;
	createdAt: string;
	passwordHash: string;
}

export type AuthUser = AdminUser | DriverUser;

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface AuthResult {
	user: AuthUser;
	token: string;
}

export interface AuthState {
	user: AuthUser | null;
	loading: boolean;
	error: string | null;
}

export const initialState: AuthState = {
	user: null,
	loading: false,
	error: null,
};
