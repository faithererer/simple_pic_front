# 部署指南

## 前端部署

### 1. 构建项目
```bash
# 安装依赖
npm install

# 构建生产环境版本
npm run build
```

### 2. Nginx 配置

1. 安装 Nginx
```bash
# 安装 EPEL 源
sudo yum install epel-release

# 安装 Nginx
sudo yum install nginx

# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx
```

2. 配置 Nginx
```bash
# 编辑配置文件
sudo vim /etc/nginx/conf.d/media.conf
```

添加以下配置：
```nginx
server {
    listen 80;
    server_name your_domain.com;  # 替换为你的域名
    
    # 前端静态文件
    location / {
        root /var/www/media-manager/dist;
        index index.html;
        try_files $uri $uri/ /index.html;  # 支持 Vue Router 的 history 模式
    }
    
    # API 代理
    location /api/v1 {
        proxy_pass http://localhost:8083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 上传文件大小限制
    client_max_body_size 100M;
    
    # 开启 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

3. 部署前端文件
```bash
# 创建部署目录
sudo mkdir -p /var/www/media-manager

# 复制构建文件到部署目录
sudo cp -r dist/* /var/www/media-manager/dist/

# 设置权限
sudo chown -R nginx:nginx /var/www/media-manager
```

4. 检查并重启 Nginx
```bash
# 检查配置是否正确
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 后端部署

### 1. 安装 Java 环境
```bash
# 安装 OpenJDK 17
sudo yum install java-17-openjdk-devel

# 验证安装
java -version
```

### 2. 配置后端服务

1. 创建服务目录
```bash
sudo mkdir -p /opt/media-manager
sudo mkdir -p /opt/media-manager/logs
sudo mkdir -p /opt/media-manager/uploads
```

2. 创建服务用户
```bash
sudo useradd -r -s /sbin/nologin mediaapp
sudo chown -R mediaapp:mediaapp /opt/media-manager
```

3. 创建系统服务
```bash
sudo vim /etc/systemd/system/media-manager.service
```

添加以下内容：
```ini
[Unit]
Description=Media Manager Backend Service
After=network.target

[Service]
User=mediaapp
Type=simple
ExecStart=/usr/bin/java -jar /opt/media-manager/app.jar
WorkingDirectory=/opt/media-manager
Restart=always
StandardOutput=append:/opt/media-manager/logs/stdout.log
StandardError=append:/opt/media-manager/logs/stderr.log

[Install]
WantedBy=multi-user.target
```

4. 部署后端应用
```bash
# 复制 JAR 文件
sudo cp app.jar /opt/media-manager/

# 设置权限
sudo chown mediaapp:mediaapp /opt/media-manager/app.jar
sudo chmod 500 /opt/media-manager/app.jar

# 启动服务
sudo systemctl start media-manager

# 设置开机自启
sudo systemctl enable media-manager

# 查看服务状态
sudo systemctl status media-manager
```

### 3. 防火墙配置
```bash
# 开放 HTTP 端口
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 重载防火墙配置
sudo firewall-cmd --reload
```

## 维护命令

### 查看日志
```bash
# 查看 Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看后端服务日志
sudo tail -f /opt/media-manager/logs/stdout.log
```

### 服务管理
```bash
# 重启 Nginx
sudo systemctl restart nginx

# 重启后端服务
sudo systemctl restart media-manager

# 查看服务状态
sudo systemctl status nginx
sudo systemctl status media-manager
```

### 更新部署
```bash
# 更新前端
sudo cp -r dist/* /var/www/media-manager/dist/
sudo systemctl reload nginx

# 更新后端
sudo systemctl stop media-manager
sudo cp app.jar /opt/media-manager/
sudo systemctl start media-manager
```

## 注意事项

1. 确保服务器有足够的存储空间用于文件上传
2. 定期备份上传的文件和数据库
3. 监控服务器资源使用情况
4. 配置 SSL 证书以启用 HTTPS
5. 设置日志轮转防止日志文件过大 