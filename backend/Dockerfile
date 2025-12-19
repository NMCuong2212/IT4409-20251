# 1. Sử dụng image Node.js làm base image
# Nên sử dụng phiên bản LTS ổn định, ví dụ node:20-alpine
FROM node:20-alpine

# 2. Đặt thư mục làm việc bên trong container
WORKDIR /app

# 3. Sao chép package.json và package-lock.json (nếu có)
# Các tệp này chứa thông tin về dependencies
COPY package*.json ./

# 4. Cài đặt các dependencies
# RUN npm install --production chỉ cài đặt dependencies cần thiết cho môi trường production
RUN npm install

# 5. Sao chép toàn bộ mã nguồn ứng dụng vào thư mục làm việc /app
COPY . .

# 6. Mở cổng mà ứng dụng của bạn lắng nghe (cổng 3001)

ENV PORT=3001
EXPOSE 3001

# 7. Định nghĩa lệnh sẽ chạy khi container khởi động
# Dùng "npm start" nếu bạn đã định nghĩa nó trong package.json
# Hoặc dùng "node tên_file_chính.js"
CMD ["node", "server.js"]
