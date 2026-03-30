# Hướng Dẫn Thiết Lập Appwrite Cho RentMaster Pro

Dựa trên cấu trúc dữ liệu và code tại `services/AppwriteService.ts` cũng như `types.ts`, dưới đây là hướng dẫn chi tiết từng bước để bạn thiết lập Appwrite Cloud/Local theo cách thủ công. 

> [!IMPORTANT]
> Toàn bộ các ID tuỳ chỉnh dưới đây (`RentMasterDB`, `media`, `properties`, `owners`, `schedules`) bạn cần nhập **chính xác** trong phần **"Custom ID"** lúc tạo mới, nếu không Appwrite sẽ random chuỗi ID và code trên FE sẽ không auto map được.

---

## Bước 1: Tạo Dự Án (Project)
1. Truy cập [Appwrite Cloud](https://cloud.appwrite.io/) (hoặc Localhost của bạn).
2. Clck **Create project**. Đặt tên project (Vd: *RentMaster Pro*).
3. Copy lại **Project ID** (Ví dụ: `64a7b...`) ở phần Setting project. Bạn sẽ cần nhập ID này vào biến môi trường `.env`.

---

## Bước 2: Tạo Database
1. Ở sidebar bên trái, chọn **Databases** -> **Create database**.
2. **Name**: `RentMaster DB`
3. **Database ID** (chọn Custom ID): `RentMasterDB`
4. Bấm **Create**.

---

## Bước 3: Đặt Quyền Truy Cập (Permissions)
Appwrite mặc định sẽ khoá lại, do ứng dụng chưa tích hợp hệ thống xác thực (User Account/Login) ngay lập tức lúc này, bạn cần **cấp quyền Public**:

> Tại mỗi Database / Collection bạn sắp tạo dưới đây, hãy vào **Settings** -> **Permissions**:
> Chọn **Role: Any** (hoặc `All guests / All users`).
> Đánh dấu tích vào các ô: **Read, Create, Update, Delete**.

---

## Bước 4: Tạo Các Collections & Attributes

Từ trong Database `RentMasterDB` vừa tạo, bạn cần tạo 3 Collections (bảng dữ liệu) sau. **Lưu ý phải đặt Custom ID khớp với bảng ID trong code**:

### 1. Collection: `properties`
- **Tên**: Properties
- **Collection ID** (Custom): `properties`

Sau khi tạo, sang tab **Attributes**, tạo các trường sau:

| Attribute Key | Type | Size | Array (Mảng) | Required | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `name` | String | 255 | Không | Có | Tên Bất Động Sản |
| `type` | String | 50 | Không | Không | Apartment / House / Hotel |
| `address` | String | 250 | Không | Không | |
| `description` | String | 2000 | Không | Không | |
| `structure` | String | 500 | Không | Không | |
| `condition` | String | 50 | Không | Không | New / Normal / Old |
| `status` | String | 50 | Không | Không | Rented / Available / Sold |
| `totalAssetValue` | Float / Double | - | Không | Không | Tổng giá trị tài sản |
| `imageUrl` | URL / String | 300 | Không | Không | Ảnh cover |
| `gallery` | String | 300 | **Có (Array)** | Không | Mảng ảnh gallery |
| `ownerId` | String | 150 | Không | Không | Liên kết sang Owner |
| `constructionYear` | Integer | - | Không | Không | |
| `operationStartDate` | String | 100 | Không | Không | Ngày bắt đầu hoạt động |
| `assets` | String | 2500 | Không | Không | Mảng JSON stringify |
| `tenant` | String | 3000 | Không | Không | Mảng JSON stringify |
| `utilities` | String | 1000 | Không | Không | Mảng JSON stringify |
| `rating` | Float / Double | - | Không | Không | Điểm đánh giá (0-10) |
| `propertyNotes` | String | 1000 | Không | Không | |

> **Giải thích:** Các Size cho chuỗi JSON (như `assets` 4000, `tenant` 4000) đã được tính toán nén tối đa nhằm tiết kiệm giới hạn Read/Write của CSDL nhưng vẫn CHẮC CHẮN CHƯA VƯỢT GIỚI HẠN Row Size Limit (65,535 Bytes) của MariaDB. Hãy nhập chính xác thông số này.

---

### 2. Collection: `owners`
- **Tên**: Owners
- **Collection ID** (Custom): `owners`

Tab **Attributes**:

| Attribute Key | Type | Size | Array (Mảng) | Required | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `name` | String | 150 | Không | Có | |
| `phones` | String | 50 | **Có (Array)** | Không | Danh sách sđt |
| `address` | String | 250 | Không | Không | |
| `avatarUrl` | URL / String | 300 | Không | Không | URL tự tải lên Storage |
| `idCardFront` | URL / String | 300 | Không | Không | URL tự tải lên Storage |
| `idCardBack` | URL / String | 300 | Không | Không | URL tự tải lên Storage |
| `managementStartDate` | String | 50 | Không | Không | |

---

### 3. Collection: `schedules`
- **Tên**: Schedules
- **Collection ID** (Custom): `schedules`

Tab **Attributes**:

| Attribute Key | Type | Size | Array (Mảng) | Required | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `title` | String | 250 | Không | Có | |
| `description` | String | 1000 | Không | Không | |
| `date` | String | 50 | Không | Không | YYYY-MM-DD |
| `time` | String | 50 | Không | Không | HH:mm |
| `type` | String | 50 | Không | Không | Loại sự kiện |
| `priority` | String | 50 | Không | Không | Low / Medium / High |
| `propertyId` | String | 150 | Không | Không | ID BĐS liên quan |
| `isCompleted` | Boolean | - | Không | Không | Trạng thái hoàn thành |
| `reminderMinutes` | Integer | - | Không | Không | |
| `repeat` | String | 50 | Không | Không | none, daily, ... |

---

### 4. Collection: `users`
- **Tên**: Users Profile
- **Collection ID** (Custom): `users`

*(Bảng này được sử dụng để đồng bộ thông tin `UserProfile` và mở rộng dữ liệu Account ngoài hệ thống Đăng nhập (Auth) mặc định của Appwrite)*

Tab **Attributes**:

| Attribute Key | Type | Size | Array (Mảng) | Required | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `email` | String | 255 | Không | Có | |
| `username` | String | 150 | Không | Không | |
| `name` | String | 255 | Không | Có | |
| `photo` | URL / String | 300 | Không | Không | Có thể convert tự động qua URL |
| `phone` | String | 50 | Không | Không | |
| `bio` | String | 1000 | Không | Không | |
| `isPro` | Boolean | - | Không | Không | |

---

## Bước 5: Tạo Storage Bucket (Lưu Trữ File)
1. Ở sidebar bên trái, chọn **Storage** -> **Create bucket**.
2. **Name**: `Media`
3. **Bucket ID** (dùng Custom ID): `media`
4. Cấp quyền **Permissions**
   - Chọn Role: **Any**
   - Đánh Tích (**Create, Read, Update, Delete**) giống như Data Collections ở Bước 3 để App Client (Web/Trình cắm) có thể Upload hình ảnh lên.

> [!TIP]
> **Cấu hình bổ sung cho Storage (CORS / Web Platform)**
> Để tránh bị trình duyệt chặn (Lỗi CORS) khi Web gọi API Appwrite:
> - Kéo xuống phần **Settings** của Project trong trang quản trị.
> - Chọn phần "Platform" trên project (Add Web App), đặt tên tuỳ ý.
> - Điền **Hostname** là `localhost` (nếu chạy local Dev) hoặc tên miền trang web thực tế của bạn sau này. Appwrite sẽ tự Allow CORS tương ứng.

> [!NOTE]
> **Tối Ưu Hoá Tự Động (Mới cập nhật)**
> 1. **Tiết kiệm Băng thông (Bandwidth)**: Nhờ các nâng cấp mới trong `AppwriteService.ts`, tất cả các hình ảnh tải lên Bucket này sẽ tự động được thu nhỏ (resize 1000px) và ép sang định dạng WebP (giảm 90% dung lượng) khi client lấy về hiển thị.
> 2. **Tiết kiệm Dung lượng (Storage)**: Code của chúng ta đã được tích hợp hàm `AppwriteService.deleteMedia()`, nhờ vậy các ảnh cũ không sử dụng sẽ được chủ động "dọn dẹp" chứ không biến thành rác.

---

## Bước 6: Liên kết với Source Code

Tạo (hoặc cập nhật) tệp `.env` ở thư mục gốc của project (nơi file Vite đang chạy):

```env
VITE_APPWRITE_PROJECT_ID=đổi_thành_project_id_của_bạn_ở_bước_1
VITE_APPWRITE_DATABASE_ID=RentMasterDB
VITE_APPWRITE_BUCKET_ID=media
```

*Lưu ý: Mặc định trên file `AppwriteService.ts` cả database id và bucket id đều đang được dự phòng là `RentMasterDB` và `media`. Do đó, nếu bạn tạo đúng tất cả Custom ID giống hệt phần trên, bạn chỉ cần nhập duy nhất một cấu hình thiết thực là `VITE_APPWRITE_PROJECT_ID`.*
