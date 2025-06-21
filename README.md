# MetroPass Admin - Trang Quản Trị Hệ Thống Vé Tàu Điện

Đây là trang quản trị (Admin Dashboard) cho hệ thống MetroPass, được xây dựng bằng React, TypeScript và Material-UI. Giao diện được thiết kế để cung cấp một công cụ mạnh mẽ và trực quan cho các quản trị viên để giám sát và quản lý toàn bộ hoạt động của hệ thống.

## ✨ Tính năng nổi bật

- **Bảng điều khiển (Dashboard)**: Cung cấp cái nhìn tổng quan về các số liệu quan trọng như doanh thu, số lượng vé bán ra, và các hoạt động gần đây.
- **Quản lý Người dùng**: Xem danh sách, tìm kiếm, tạo mới, chỉnh sửa và xóa thông tin người dùng trong hệ thống.
- **Quản lý Loại vé**: Dễ dàng cấu hình các loại vé (ví dụ: vé lượt, vé tháng, vé sinh viên) với các mức giá và thời hạn khác nhau.
- **Quản lý Vé của người dùng**: Theo dõi trạng thái của tất cả các vé đã được người dùng mua (chưa sử dụng, đang hoạt động, đã hết hạn).
- **Quản lý Nhà ga**: Cập nhật thông tin chi tiết về các nhà ga trong tuyến tàu.
- **Thống kê & Báo cáo**: Các biểu đồ và bảng số liệu giúp phân tích doanh thu và xu hướng sử dụng vé.
- **Thiết kế Responsive**: Giao diện được tối ưu hóa để hoạt động tốt trên cả máy tính để bàn và các thiết bị di động.

## 🚀 Công nghệ sử dụng

- **Frontend**: React (v19+), TypeScript
- **UI Framework**: Material-UI (MUI)
- **Backend & Database**: Firebase (Firestore, Authentication)
- **Routing**: React Router DOM
- **Quản lý State**: React Context API
- **Form Management**: Formik & Yup (dự kiến hoặc có thể tích hợp)

## 🔧 Hướng dẫn cài đặt và khởi chạy

Để chạy dự án này trên máy của bạn, hãy làm theo các bước sau:

**1. Clone Repository**

```bash
git clone https://github.com/LTMB-Metro/AdminMetro.git
```

**2. Di chuyển vào thư mục dự án**

```bash
cd AdminMetro
```

**3. Cài đặt các dependencies**
Sử dụng `npm` để cài đặt tất cả các gói cần thiết.

```bash
npm install
```

**4. Cấu hình Firebase**
Tạo một file mới tại đường dẫn `src/config/firebase.ts` và thêm vào đó cấu hình Firebase của bạn.

_Ví dụ file `firebase.ts`:_

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
```

**5. Chạy ứng dụng**
Sau khi cài đặt xong, chạy lệnh sau để khởi động ứng dụng ở chế độ development.

```bash
npm start
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng trên trình duyệt.

## 📂 Cấu trúc thư mục

Dự án được tổ chức theo cấu trúc module hóa để dễ dàng bảo trì và mở rộng:

```
src
├── components/     # Các UI components tái sử dụng (Layout, Cards,...)
├── contexts/       # React Context API cho quản lý state (e.g., AuthContext)
├── models/         # Định nghĩa các interface TypeScript cho dữ liệu (User, Ticket,...)
├── pages/          # Các trang chính của ứng dụng (Dashboard, Users, Stations,...)
├── services/       # Logic giao tiếp với Firebase (CRUD operations)
├── App.tsx         # Component gốc của ứng dụng
└── index.tsx       # Điểm khởi đầu của ứng dụng React
```

## 👨‍💻 Tác giả

- **Tên**: Phan Văn Huy
- **Email**: <huy0812200415@gmail.com>
- **GitHub**: [https://github.com/LTMB-Metro](https://github.com/LTMB-Metro)

---

Cảm ơn bạn đã quan tâm đến dự án!
