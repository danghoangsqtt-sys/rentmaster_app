# Hướng Dẫn Đóng Gói App Mobile (Android & iOS)

Do dự án RentMaster Pro của bạn đang sử dụng **Capacitor**, kiến trúc này cho phép gói lớp React/Web vào bên trong một khung ứng dụng Native. Dưới đây là các bước quy chuẩn để bạn đóng gói và gửi cho khách:

## 1. Chuẩn bị dữ liệu Web
Bất kể bạn muốn build ra hệ điều hành nào, bước đầu tiên luôn là đóng gói source web mới nhất:
```bash
npm run build
```
Lệnh này sẽ tạo ra thư mục `dist` (chứa toàn bộ Code Vite đã thu nhỏ).

---

## 2. Dành cho ANDROID (Gửi file đuôi `.apk` cực kỳ dễ)

Hệ điều hành Android cho phép người dùng tự do cài đặt app từ bên ngoài (Side-loading) cực kỳ dễ dàng.

**Bước 1**: Cập nhật code web mới vào lõi Android:
```bash
npx cap sync android
```

**Bước 2**: Mở project bằng Android Studio:
```bash
npx cap open android
```
*(Yêu cầu máy tính của bạn đã tải và cài đặt Android Studio).*

**Bước 3**: Export ra file gửi cho khách hàng:
- Tại cửa sổ Android Studio, sau khi nó load xong các thông số gradle (nhìn góc dưới bên phải), bạn click lên thanh Menu trên cùng:
- Chọn **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
- Chờ khoảng 1-2 phút, góc dưới sẽ hiện một popup thông báo thành công. Click vào nút màu xanh **"locate"** trên popup đó.
- Thư mục sẽ mở ra và chứa một file tên là `app-debug.apk`. 
- **Hoàn tất:** Bạn lấy file `.apk` này gửi thẳng qua Zalo/Drive cho khách hàng. Điện thoại Android bấm vào file sẽ hỏi cấp quyền và cài thành ứng dụng độc lập trên máy ngay lập tức.

---

## 3. Dành cho iOS (iPhone) - BẮT BUỘC ĐỌC KỸ

Việc build 1 file `.ipa` của iPhone để gửi cho bất cứ ai cài đặt là **ĐIỀU KHÔNG THỂ** theo cơ chế bảo mật nghiêm ngặt của Apple. Họ không cho phép cài đặt app ngoài giống Android (trừ khi iPhone đã bị Jailbreak/Dùng AltStore rất phức tạp).

Để khách hàng dùng trên iPhone, bạn có **2 Lựa chọn**:

### Lựa chọn A: Xuất bản PWA (Lối đi khôn ngoan và tiết kiệm 100%)
Vì ứng dụng của bạn làm bằng Web (Vite React). Bạn hoàn toàn có thể bỏ qua bước Build Native phức tạp trên iOS.
1. Bạn đưa source code web (thư mục `dist`) đẩy lên Vercel, Netlify hoặc Hosting của riêng bạn. (Tạo 1 đường link vd: `app.rentmaster.vn`).
2. Gửi đường link cho khách mở trên trình duyệt Safari của iPhone.
3. Hướng dẫn khách bấm nút **Share** (Chia sẻ) ở trình duyệt -> Chọn **Add to Home Screen** (Thêm vào DHC / Thêm vào Cửa sổ chính).
4. 🎉 Lập tức trang web sẽ biến thành 1 App Icon trên màn hình iPhone y như được tải về từ AppStore. Không có thanh địa chỉ trình duyệt, hoạt động siêu mượt trên iOS.

### Lựa chọn B: Build Native (Gửi lên TestFlight / AppStore)
Nếu bạn vẫn **bắt buộc** phải là ứng dụng cài từ ngoài vào cho giống thật nhất. Bạn sẽ cần:
1. Một chiếc máy tính Macbook (để chạy XCode).
2. Trả phí **99$/Năm** để mua Tài khoản Apple Developer.
3. Chạy `npx cap sync ios` và `npx cap open ios` để mở XCode.
4. Push file lên hệ thống **TestFlight** của Apple bằng XCode.
5. Khách hàng của bạn sẽ phải tải app TestFlight từ AppStore, sau đó click vào Link Mời của bạn để cài đặt app Beta vào máy.

> **💡 Lời khuyên:** Với hệ thống quản trị nội bộ nhà trọ như thế này, **Android thì bạn gửi file `.apk`**, còn **với iPhone thì hãy dùng Lựa chọn A (PWA)** là phương án nhanh-gọn-lẹ và xịn xò nhất tính đến thời điểm hiện tại.
