# Docker 部署指南

## 使用 Docker Compose 部署（推荐）

### 1. 确保已安装 Docker 和 Docker Compose

```bash
docker --version
docker-compose --version
```

### 2. 构建并启动服务

```bash
docker-compose up -d
```

### 3. 查看运行状态

```bash
docker-compose ps
```

### 4. 查看日志

```bash
docker-compose logs -f
```

### 5. 停止服务

```bash
docker-compose down
```

### 6. 重启服务

```bash
docker-compose restart
```

## 使用 Docker 单独部署

### 1. 构建镜像

```bash
docker build -t attendance-system .
```

### 2. 运行容器

```bash
docker run -d \
  --name attendance-system \
  -p 3000:3000 \
  -v $(pwd)/server/data:/app/server/data \
  --restart unless-stopped \
  attendance-system
```

### 3. 查看日志

```bash
docker logs -f attendance-system
```

### 4. 停止容器

```bash
docker stop attendance-system
```

### 5. 删除容器

```bash
docker rm attendance-system
```

## 访问应用

启动成功后，访问: http://localhost:3000

## 数据持久化

数据保存在 `./server/data` 目录，即使容器删除，数据也不会丢失。

## 健康检查

容器内置健康检查，可以通过以下命令查看：

```bash
docker inspect --format='{{json .State.Health}}' attendance-system
```

## 生产环境建议

1. **使用反向代理**（如 Nginx）
2. **启用 HTTPS**
3. **定期备份数据目录**
4. **监控容器状态**
5. **设置资源限制**

```yaml
services:
  attendance-system:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 故障排除

### 容器无法启动

```bash
# 查看详细日志
docker logs attendance-system

# 检查端口占用
lsof -i :3000
```

### 数据未持久化

确认数据卷挂载正确：

```bash
docker inspect attendance-system | grep Mounts -A 20
```

### 无法访问服务

检查防火墙和端口映射：

```bash
# 检查容器端口
docker port attendance-system

# 测试连接
curl http://localhost:3000/api/health
```
