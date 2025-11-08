# 🛍️ EProject – Nền tảng Thương mại điện tử theo kiến trúc Microservices

## 📖 Giới thiệu

Dự án này mô phỏng một hệ thống thương mại điện tử hiện đại được phát triển theo kiến trúc **Microservices**, sử dụng **Node.js, Express, MongoDB** và **RabbitMQ**.  
Mỗi chức năng chính được tách biệt thành một service độc lập, đảm nhiệm vai trò riêng, giao tiếp với nhau thông qua **API Gateway** và **Message Broker** để đảm bảo tính mở rộng, tách biệt và dễ bảo trì.

---

## 🧩 Kiến trúc tổng thể

- **API Gateway (port 3003)**: Tiếp nhận request từ client, định tuyến và chuyển tiếp đến các service phù hợp.  
- **Auth Service (port 3000)**: Xử lý đăng ký, đăng nhập và xác thực người dùng thông qua JWT.  
- **Product Service (port 3001)**: Quản lý sản phẩm, tạo đơn hàng và trao đổi thông tin với Order Service qua RabbitMQ.  
- **Order Service (port 3002)**: Nhận message từ hàng đợi, xử lý và xác nhận đơn hàng.  
- **RabbitMQ**: Hệ thống truyền tin trung gian, giúp các service giao tiếp bất đồng bộ.  
- **MongoDB**: Cơ sở dữ liệu riêng biệt cho từng service, đảm bảo tính độc lập dữ liệu.

---

## 📁 Cấu trúc thư mục

```
EProject/
│
├── api-gateway/
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
│
├── auth/
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── repositories/
│       ├── services/
│       └── test/
│
├── product/
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config.js
│       ├── controllers/
│       ├── models/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       ├── test/
│       └── utils/
│
├── order/
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config.js
│       ├── models/
│       ├── services/
│       └── utils/
│
├── utils/
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🚀 Cách khởi chạy dự án

### 🧱 Yêu cầu

- Node.js >= 14  
- Docker & Docker Compose  
- MongoDB và RabbitMQ (nếu không dùng Docker)

---

### ⚙️ Cách 1: Dùng Docker (Khuyến khích)

```bash
git clone <repository-url>
cd EProject
docker-compose up --build
# hoặc chạy nền
docker-compose up -d --build
```

Các service sẽ chạy tại:

| Service | URL |
|----------|-----|
| API Gateway | http://localhost:3003 |
| Auth Service | http://localhost:3000 |
| Product Service | http://localhost:3001 |
| Order Service | http://localhost:3002 |
| RabbitMQ UI | http://localhost:15672 (admin/admin) |

---

### ⚙️ Cách 2: Chạy local (dành cho phát triển)

```bash
npm install
cd auth && npm install
cd ../product && npm install
cd ../order && npm install
cd ../api-gateway && npm install
```

Tạo file `.env` cho từng service (tham khảo mẫu có sẵn trong thư mục `src/`).  
Sau đó chạy từng service ở terminal riêng:

```bash
cd auth && npm start
cd product && npm start
cd order && npm start
cd api-gateway && npm start
```

---

## 🌐 API chính

### 🔐 Auth Service

| Method | Endpoint | Mô tả |
|--------|-----------|-------|
| POST | /auth/register | Đăng ký tài khoản mới |
| POST | /auth/login | Đăng nhập, nhận JWT |
| GET | /auth/profile | Lấy thông tin người dùng (cần token) |

### 🛒 Product Service

| Method | Endpoint | Mô tả |
|--------|-----------|-------|
| POST | /products | Tạo sản phẩm mới |
| GET | /products | Lấy danh sách sản phẩm |
| POST | /products/buy | Tạo đơn hàng |
| GET | /products/order/:id | Xem trạng thái đơn hàng |

---

## 🔄 Quy trình xử lý đơn hàng

1. Người dùng đăng nhập và nhận JWT.  
2. Gửi yêu cầu mua hàng tới `/products/buy`.  
3. Product Service gửi message đến hàng đợi `orders`.  
4. Order Service nhận message, xử lý đơn hàng.  
5. Kết quả được phản hồi lại qua RabbitMQ và gửi trả về client.

---

## 🔐 Quy trình xác thực

- Mật khẩu được hash bằng **bcryptjs** khi đăng ký.  
- Khi đăng nhập, hệ thống sinh **JWT token** chứa thông tin người dùng.  
- Các request cần bảo vệ sẽ phải đính kèm header:

```
Authorization: Bearer <token>
```

---

## 🐳 Các service Docker

| Service | Chức năng |
|----------|-----------|
| mongo | Cơ sở dữ liệu dùng cho từng microservice |
| rabbitmq | Message broker để truyền dữ liệu giữa các service |
| api-gateway | Xử lý request từ client |
| auth | Xác thực người dùng |
| product | Quản lý sản phẩm |
| order | Xử lý đơn hàng |

---

## 🛠️ Công nghệ sử dụng

- Node.js, Express  
- MongoDB, Mongoose  
- RabbitMQ, JWT, bcryptjs  
- Docker, Docker Compose  
- Mocha, Chai (Test)  
- dotenv để quản lý biến môi trường

---

## 🔍 Giám sát & Debug

- RabbitMQ UI: [http://localhost:15672](http://localhost:15672) — user: `admin`, pass: `admin`  
- MongoDB: `mongodb://localhost:27017`  

Xem logs:

```bash
docker-compose logs -f [service-name]
```

---