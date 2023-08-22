FROM node:18 AS build

# 设置工作目录
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# 将构建好的 React 应用复制到 Nginx 容器的默认站点目录
FROM nginx:alpine
COPY ./public/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /app
