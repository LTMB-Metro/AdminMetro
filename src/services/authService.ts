import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: any;
  phonenumber?: string;
  photoURL?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  phonenumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Register new admin user
export const registerUser = async (userData: RegisterData): Promise<User> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const firebaseUser = userCredential.user;

    // Create user document in Firestore with admin role
    const userDoc: Omit<User, "id"> = {
      email: userData.email,
      username: userData.username,
      role: "admin",
      createdAt: serverTimestamp(),
      phonenumber: userData.phonenumber || "",
      photoURL: "",
    };

    await setDoc(doc(db, "users", firebaseUser.uid), userDoc);

    return {
      id: firebaseUser.uid,
      ...userDoc,
    } as User;
  } catch (error: any) {
    console.error("Error registering user:", error);

    // Handle specific Firebase errors
    if (error.code === "auth/email-already-in-use") {
      throw new Error("Email đã được sử dụng. Vui lòng sử dụng email khác.");
    } else if (error.code === "auth/weak-password") {
      throw new Error("Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Email không hợp lệ.");
    }

    throw new Error("Đăng ký thất bại. Vui lòng thử lại.");
  }
};

// Login user and check admin role
export const loginUser = async (loginData: LoginData): Promise<User> => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginData.email,
      loginData.password
    );

    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await signOut(auth); // Sign out if no user document
      throw new Error("Tài khoản không tồn tại trong hệ thống.");
    }

    const userData = userDocSnap.data() as Omit<User, "id">;

    // Check if user has admin role
    if (userData.role !== "admin") {
      await signOut(auth); // Sign out if not admin
      throw new Error("Bạn không có quyền truy cập trang quản trị.");
    }

    return {
      id: firebaseUser.uid,
      ...userData,
    };
  } catch (error: any) {
    console.error("Error logging in:", error);

    // Handle specific Firebase errors
    if (error.code === "auth/user-not-found") {
      throw new Error("Email không tồn tại.");
    } else if (error.code === "auth/wrong-password") {
      throw new Error("Mật khẩu không đúng.");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Email không hợp lệ.");
    } else if (error.code === "auth/too-many-requests") {
      throw new Error("Quá nhiều lần thử. Vui lòng thử lại sau.");
    }

    // Re-throw custom error messages
    if (
      error.message.includes("không có quyền") ||
      error.message.includes("không tồn tại")
    ) {
      throw error;
    }

    throw new Error("Đăng nhập thất bại. Vui lòng thử lại.");
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw new Error("Đăng xuất thất bại. Vui lòng thử lại.");
  }
};

// Get current user data
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) return null;

    const userData = userDocSnap.data() as Omit<User, "id">;

    // Check admin role
    if (userData.role !== "admin") return null;

    return {
      id: firebaseUser.uid,
      ...userData,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        const userData = await getCurrentUser();
        callback(userData);
      } catch (error) {
        console.error("Error in auth state change:", error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};
