# API MB Bank

API cho MB Bank được xây dựng bằng Node.js, Express, TypeScript và MySQL, hỗ trợ đa tài khoản.

## Tính năng

### Tính năng MB Bank
- Đăng nhập vào MB Bank
- Kiểm tra trạng thái đăng nhập
- Lấy số dư tài khoản
- Lấy lịch sử giao dịch
- Quản lý nhiều tài khoản MB Bank
- Tự động cập nhật mật khẩu khi cần
- Nhận diện và xử lý lỗi đăng nhập

### Tính năng quản trị
- Hệ thống phân quyền (admin/user)
- Quản lý người dùng hệ thống
- Giao diện quản trị dành riêng cho admin
- Xem tất cả tài khoản MB Bank
- Kiểm tra trạng thái, số dư và lịch sử giao dịch của tất cả tài khoản

### Tính năng chung
- Tài liệu API với Swagger
- Xác thực bằng token
- Bảo mật và mã hóa mật khẩu

## Yêu cầu

### Sử dụng Docker (Khuyến nghị)
- Docker
- Docker Compose

### Cài đặt thủ công
- Node.js (>= 14)
- pnpm
- MySQL

## Cài đặt

### Sử dụng Docker (Khuyến nghị)

1. Clone repository
```bash
git clone <repository-url>
cd mb-bank
```

2. Chạy script cài đặt môi trường (cài đặt các gói cần thiết)
```bash
sudo ./setup.sh
```

3. Tạo file `.env` từ `.env.example` và điều chỉnh thông số (nếu chưa có)
```bash
cp .env.example .env
```

4. Chạy script cài đặt tự động
```bash
# Chế độ phát triển (mặc định)
./run.sh

# Chế độ production
./run.sh -p

# Dừng tất cả các dịch vụ
./run.sh -s

# Khởi động lại tất cả các dịch vụ
./run.sh -r

# Xóa tất cả dữ liệu và bắt đầu lại
./run.sh -c

# Xem logs của tất cả các dịch vụ
./run.sh -l

# Xem logs của dịch vụ API
./run.sh -l app

# Xem logs của dịch vụ MySQL
./run.sh -l mysql

# Kiểm tra trạng thái ứng dụng
./check-app.sh

# Đặt lại cơ sở dữ liệu (xóa tất cả dữ liệu)
./reset-db.sh

# Cập nhật các gói phụ thuộc
./update-deps.sh

# Xem thêm tùy chọn
./run.sh --help
```

5. Tạo tài khoản admin đầu tiên
```bash
node setup-admin.js
```
Hoặc truy cập API endpoint `/api/admin/setup` với dữ liệu POST phù hợp.

### Cài đặt thủ công (Không sử dụng Docker)

1. Clone repository
```bash
git clone <repository-url>
cd mb-bank
```

2. Cài đặt các phụ thuộc
```bash
pnpm install
```

3. Tạo file `.env` từ `.env.example` và điều chỉnh thông số
```bash
cp .env.example .env
```

4. Biên dịch TypeScript sang JavaScript
```bash
pnpm build
```

5. Khởi động ứng dụng
```bash
pnpm start
```

Để phát triển với chế độ tự động tải lại:
```bash
pnpm dev
```

## Tài liệu API

API được tài liệu hóa đầy đủ bằng Swagger. Sau khi khởi động ứng dụng, truy cập:

```
http://localhost:3000/api-docs
```

Tại đây bạn có thể:
- Xem tất cả các endpoints có sẵn
- Xem thông tin chi tiết về từng endpoint
- Kiểm thử API trực tiếp trong trình duyệt

## API Endpoints

### Quản lý tài khoản MB Bank

- `GET /api/accounts` - Lấy danh sách tất cả tài khoản
- `GET /api/accounts/:id` - Lấy thông tin tài khoản theo ID
- `POST /api/accounts` - Tạo tài khoản mới hoặc cập nhật mật khẩu nếu đã tồn tại
- `PUT /api/accounts/:id` - Cập nhật tài khoản
- `DELETE /api/accounts/:id` - Xóa tài khoản
- `GET /api/accounts/me` - Lấy thông tin tài khoản từ token

### Hoạt động MB Bank

- `POST /api/mbbank/:id/login` - Đăng nhập vào tài khoản MB Bank
- `GET /api/mbbank/:id/status` - Kiểm tra trạng thái đăng nhập
- `GET /api/mbbank/:id/balance` - Lấy số dư tài khoản
- `GET /api/mbbank/:id/transactions` - Lấy lịch sử giao dịch (với query params: accountNumber, fromDate, toDate)
- `GET /api/mbbank/:id/transactions/days` - Lấy lịch sử giao dịch theo số ngày (với query params: accountNumber, days)
- `POST /api/mbbank/:id/logout` - Đăng xuất

### Hoạt động MB Bank sử dụng token

- `GET /api/mbbank/me/status` - Kiểm tra trạng thái đăng nhập (sử dụng token)
- `GET /api/mbbank/me/balance` - Lấy số dư tài khoản (sử dụng token)
- `GET /api/mbbank/me/transactions` - Lấy lịch sử giao dịch (sử dụng token)
- `GET /api/mbbank/me/transactions/days` - Lấy lịch sử giao dịch theo số ngày (sử dụng token)

### Quản lý người dùng hệ thống

- `POST /api/users/login` - Đăng nhập vào hệ thống
- `POST /api/users` - Tạo người dùng mới
- `GET /api/users/me` - Lấy thông tin người dùng hiện tại từ token
- `GET /api/users` - Lấy danh sách tất cả người dùng (chỉ admin)
- `GET /api/users/:id` - Lấy thông tin người dùng theo ID (admin hoặc chính người dùng đó)
- `PUT /api/users/:id` - Cập nhật thông tin người dùng (admin hoặc chính người dùng đó)
- `DELETE /api/users/:id` - Xóa người dùng (chỉ admin)

### Quản trị viên (Admin)

- `POST /api/admin/setup` - Tạo tài khoản admin đầu tiên (chỉ khi chưa có admin nào)
- `GET /api/admin/accounts` - Lấy danh sách tất cả tài khoản MB Bank (chỉ admin)
- `GET /api/admin/accounts/status` - Kiểm tra trạng thái đăng nhập của tất cả tài khoản (chỉ admin)
- `GET /api/admin/accounts/balance` - Kiểm tra số dư của tất cả tài khoản (chỉ admin)

## Xác thực Token

Khi tạo tài khoản hoặc cập nhật thông tin tài khoản, API sẽ trả về một token. Token này có thể được sử dụng theo một trong ba cách sau:

### 1. Sử dụng Bearer Token trong Authorization header (Khuyến nghị)

```
Authorization: Bearer your_token_here
```

### 2. Sử dụng X-API-Key header

```
X-API-Key: your_token_here
```

### 3. Sử dụng query parameter

```
?token=your_token_here
```

Ví dụ đầy đủ:
```
GET http://localhost:3000/api/accounts/me?token=your_token_here
```

Cả ba phương thức trên đều được hỗ trợ và bạn có thể sử dụng bất kỳ phương thức nào tùy theo nhu cầu và môi trường của mình.

## Xử lý tài khoản đã tồn tại

Khi gọi API `POST /api/accounts` với thông tin tài khoản đã tồn tại:

1. Nếu mật khẩu khác với mật khẩu hiện tại:
   - Hệ thống sẽ cập nhật mật khẩu mới
   - Tự động đăng nhập lại vào MB Bank
   - Trả về token mới

2. Nếu mật khẩu giống với mật khẩu hiện tại:
   - Hệ thống sẽ kiểm tra trạng thái đăng nhập
   - Trả về token mới và thông tin trạng thái đăng nhập

## Xử lý lỗi đăng nhập

Hệ thống tự động phát hiện và xử lý các lỗi đăng nhập phổ biến:

1. **Sai tên đăng nhập hoặc mật khẩu**
   - Khi gặp lỗi "Customer is invalid" từ MB Bank, hệ thống sẽ trả về thông báo rõ ràng
   - Đề xuất người dùng cập nhật thông tin đăng nhập mới nếu cần

2. **Phiên đăng nhập hết hạn**
   - Tự động phát hiện phiên hết hạn và xử lý phù hợp
   - Thông báo cho người dùng đăng nhập lại

Mỗi phản hồi lỗi đăng nhập sẽ bao gồm trường `error_type` để ứng dụng khách có thể xử lý một cách phù hợp.

## Ví dụ sử dụng

### Tạo tài khoản mới

```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"username":"0123456789", "password":"yourpassword", "name":"Tên tài khoản"}'
```

### Lấy thông tin tài khoản bằng token (Authorization header)

```bash
curl -X GET http://localhost:3000/api/accounts/me \
  -H "Authorization: Bearer your_token_here"
```

### Lấy thông tin tài khoản bằng token (X-API-Key header)

```bash
curl -X GET http://localhost:3000/api/accounts/me \
  -H "X-API-Key: your_token_here"
```

### Lấy thông tin tài khoản bằng token (Query parameter)

```bash
curl -X GET "http://localhost:3000/api/accounts/me?token=your_token_here"
```

### Lấy số dư tài khoản bằng token

```bash
curl -X GET http://localhost:3000/api/mbbank/me/balance \
  -H "Authorization: Bearer your_token_here"
```

### Lấy lịch sử giao dịch bằng token

```bash
curl -X GET "http://localhost:3000/api/mbbank/me/transactions?accountNumber=1234567890&fromDate=01/01/2023&toDate=31/12/2023" \
  -H "Authorization: Bearer your_token_here"
```

### Lấy lịch sử giao dịch theo số ngày bằng token

```bash
curl -X GET "http://localhost:3000/api/mbbank/me/transactions/days?accountNumber=1234567890&days=7" \
  -H "Authorization: Bearer your_token_here"
```

## Phản hồi API

Khi tạo hoặc cập nhật tài khoản thành công, API sẽ trả về thông tin token và hướng dẫn sử dụng:

```json
{
  "success": true,
  "message": "Tạo tài khoản thành công",
  "data": {
    "id": 1,
    "username": "0123456789",
    "name": "Tên tài khoản",
    "status": "active",
    "token": "your_token_here"
  },
  "auth": {
    "token": "your_token_here",
    "type": "Bearer",
    "expires": "never",
    "use_with": "Authorization header hoặc X-API-Key header hoặc query parameter ?token="
  }
}
```

Khi gặp lỗi đăng nhập, phản hồi sẽ chứa thông tin chi tiết:

```json
{
  "success": false,
  "message": "Sai tên đăng nhập hoặc mật khẩu. Vui lòng cập nhật thông tin đăng nhập.",
  "error_type": "invalid_credentials"
}
```

## Docker và Docker Compose

Dự án này được thiết kế để chạy trong Docker với các dịch vụ sau:

- **app**: Ứng dụng Node.js chính
- **mysql**: Cơ sở dữ liệu MySQL

Cả hai dịch vụ đều được cấu hình để có thể truy cập từ mạng (không chỉ từ localhost), giúp bạn có thể truy cập API và cơ sở dữ liệu từ các thiết bị khác trong mạng.

### Cấu trúc thư mục

```
mb-bank/
├── src/                # Mã nguồn TypeScript
│   ├── controllers/     # Các controller xử lý logic
│   ├── models/          # Các model tương tác với database
│   ├── routes/          # Định tuyến API
│   ├── middlewares/     # Middleware xử lý request
│   ├── services/        # Các dịch vụ bên ngoài
│   ├── utils/           # Tiện ích
│   ├── config/          # Cấu hình
│   └── types/           # Định nghĩa kiểu dữ liệu
├── .env                # Biến môi trường
├── .env.example        # Mẫu biến môi trường
├── docker-compose.yml   # Cấu hình Docker Compose
├── Dockerfile          # Cấu hình Docker cho ứng dụng
├── run.sh              # Script triển khai tự động
├── setup-admin.js      # Script tạo tài khoản admin đầu tiên
├── model.onnx          # Mô hình OCR
├── main.wasm           # WebAssembly cho OCR
└── package.json        # Cấu hình Node.js
```

### Biến môi trường

Tất cả các biến môi trường được định nghĩa trong file `.env`:

- **Server**: `PORT`, `NODE_ENV`
- **Database**: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`
- **MBBank**: `PREFER_OCR_METHOD`, `SAVE_WASM`
- **Docker Ports**: `API_PORT`, `MYSQL_PORT`

### Script run.sh

Script `run.sh` cung cấp các tùy chọn sau:

```bash
./run.sh [OPTIONS]
```

**Tùy chọn**:
- `-h, --help`: Hiển thị trợ giúp
- `-d, --dev`: Chạy ở chế độ phát triển (mặc định)
- `-p, --prod`: Chạy ở chế độ production
- `-s, --stop`: Dừng tất cả các dịch vụ
- `-r, --restart`: Khởi động lại tất cả các dịch vụ
- `-c, --clean`: Xóa tất cả dữ liệu và bắt đầu lại
- `-l, --logs [service]`: Xem logs (thêm tên dịch vụ để xem logs của dịch vụ cụ thể)

**Ví dụ**:
```bash
# Chạy ở chế độ phát triển
./run.sh

# Chạy ở chế độ production
./run.sh -p

# Dừng tất cả các dịch vụ
./run.sh -s

# Xem logs của tất cả các dịch vụ
./run.sh -l

# Xem logs của dịch vụ API
./run.sh -l app

# Kiểm tra trạng thái ứng dụng
./check-app.sh

# Đặt lại cơ sở dữ liệu (xóa tất cả dữ liệu)
./reset-db.sh

# Cập nhật các gói phụ thuộc
./update-deps.sh
```

## Giấy phép

MIT