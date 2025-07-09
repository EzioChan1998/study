# 使用官方Nginx镜像作为基础镜像
FROM nginx:alpine

# 将构建好的前端项目复制到Nginx默认的静态文件目录
# 假设你的构建输出目录为dist，请根据实际情况调整路径
COPY ./dist /usr/share/nginx/html

# 可选：如果你需要自定义Nginx配置，可以替换默认配置文件
# COPY ./nginx.conf /etc/nginx/nginx.conf

# 暴露80端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
