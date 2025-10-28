import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type UserCredential,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

export interface FirebaseAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export class FirebaseAuthService {
  // Sign in with Google using popup
  static async signInWithGooglePopup(): Promise<FirebaseUser> {
    try {
      const result: UserCredential = await signInWithPopup(
        auth,
        googleProvider
      );
      return result.user;
    } catch (error: any) {
      console.error("Google sign-in error:", error);

      // Handle specific Firebase Auth errors
      switch (error.code) {
        case "auth/popup-closed-by-user":
          throw new Error("Đăng nhập bị hủy bởi người dùng");
        case "auth/popup-blocked":
          throw new Error("Popup bị chặn. Vui lòng cho phép popup và thử lại");
        case "auth/cancelled-popup-request":
          throw new Error("Yêu cầu đăng nhập bị hủy");
        case "auth/network-request-failed":
          throw new Error("Lỗi kết nối mạng. Vui lòng kiểm tra internet");
        default:
          throw new Error("Đăng nhập Google thất bại. Vui lòng thử lại");
      }
    }
  }

  // Sign in with Google using redirect (alternative for mobile)
  static async signInWithGoogleRedirect(): Promise<void> {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error("Google redirect sign-in error:", error);
      throw new Error("Đăng nhập Google thất bại. Vui lòng thử lại");
    }
  }

  // Get redirect result after redirect sign-in
  static async getRedirectResult(): Promise<FirebaseAuthUser | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        const user = result.user;
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        };
      }
      return null;
    } catch (error: any) {
      console.error("Get redirect result error:", error);
      throw new Error("Lỗi xử lý kết quả đăng nhập");
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw new Error("Đăng xuất thất bại");
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  static onAuthStateChanged(
    callback: (user: FirebaseUser | null) => void
  ): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Convert Firebase user to our user format
  static convertFirebaseUser(firebaseUser: FirebaseUser): FirebaseAuthUser {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
    };
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}

export default FirebaseAuthService;
