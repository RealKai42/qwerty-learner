# 运行下面的命令, 构建qwerty-learner镜像
# docker build -t qwertylearner .
# 下面的命令运行镜像, 访问localhost:8990访问应用, 8990可修改成你未占有的端口
# docker run -d -p 8990:3000 --name qwertylearnerapp qwertylearner:latest

FROM node:14

LABEL maintainer="sevenyoungairye <lel.ng.top@gmail.com>"

WORKDIR /app/qwerty-learner

COPY package*.json .

COPY yarn.lock .

RUN npm config set registry https://registry.npm.taobao.org

RUN npm install yarn -g --force

RUN yarn install

COPY . .

EXPOSE 5173

CMD yarn start --host=0.0.0.0


