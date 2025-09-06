# 使用官方Node.js镜像作为基础镜像
FROM node:18-alpine

ENV TZ=Asia/Tashkent

# Install timezone data and set the desired time zone
RUN apk add --no-cache tzdata \
  && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
  && echo $TZ > /etc/timezone

# 设置工作目录
WORKDIR /usr/src/app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目的所有文件
COPY . .

# 暴露应用运行的端口
#EXPOSE 3001

# 启动应用
CMD ["npm", "start"]
