# 运行下面的命令, 构建qwert-learner镜像
# docker build -t qwertleanerapp .
# 下面的命令运行镜像, 访问localhost:8990访问应用, 8090可修改成你未占有的端口
# docker run -d -p 8990:3000 --name qwertleanerapp qwertleanerapp:latest

FROM node:14

MAINTAINER sevenyoungairye<lel.ng.top@gmail.com>

WORKDIR /app/qwert-learn

COPY package*.json .

COPY yarn.lock .

RUN npm config set registry https://registry.npm.taobao.org

RUN npm install yarn -g --force

RUN yarn install

COPY . .

EXPOSE 3000

CMD yarn start


