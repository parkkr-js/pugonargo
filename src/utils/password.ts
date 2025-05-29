// src/utils/password.ts - 비밀번호 해시화 유틸리티
import CryptoJS from "crypto-js";

export const hashPassword = (password: string): string => {
	return CryptoJS.SHA256(password).toString();
};

export const verifyPassword = (
	password: string,
	hashedPassword: string,
): boolean => {
	return hashPassword(password) === hashedPassword;
};

export const generatePassword = (): string => {
	// 기사님들이 외우기 쉬운 4자리 숫자 + 2자리 문자
	const numbers = Math.floor(1000 + Math.random() * 9000); // 1000-9999
	const letters = Math.random().toString(36).substring(2, 4).toUpperCase();
	return `${numbers}${letters}`;
};

export const generateUserId = (vehicleNumber: string): string => {
	return `D${vehicleNumber}`;
};
