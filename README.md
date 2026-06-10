# Micro-task Bounty Platform

校园微任务悬赏平台 — 用户可以发布悬赏任务，接单者申请并完成交付，获得积分报酬。

## 技术栈

| 层 | 技术 |
|---|---|
| 后端 | Spring Boot 3.5, Java 17, JPA/Hibernate, MySQL 8.0 |
| 前端 | Vue 3, Vite, Element Plus, Pinia, Vue Router |
| 安全 | Spring Security + JWT, BCrypt 密码加密 |

## 环境要求

- **JDK 17+**（推荐 OpenJDK 17）
- **Maven 3.9+**
- **Node.js 20+** 和 npm
- **MySQL 8.0**

## 项目结构

```
├── backend/          # Spring Boot 后端
│   └── src/main/java/com/firstteam/taskbountyplatform/
│       ├── auth/         # 认证（登录/注册/JWT）
│       ├── user/         # 用户管理
│       ├── task/         # 任务发布、申请、状态流转
│       ├── point/        # 积分账户与流水
│       ├── credit/       # 信用分管理
│       ├── delivery/     # 交付物
│       ├── review/       # 评价
│       ├── notification/ # 站内通知
│       ├── report/       # 举报
│       ├── admin/        # 管理员后台
│       ├── scheduler/    # 定时任务（超时、清理）
│       └── config/       # Spring 配置
├── frontend/         # Vue 3 前端
│   └── src/
│       ├── views/        # 页面组件
│       ├── components/   # 通用组件
│       ├── api/          # API 请求层
│       ├── stores/       # Pinia 状态管理
│       ├── router/       # 路由配置
│       └── utils/        # 工具函数
└── build.sh          # 一键构建启动脚本
```

## 快速开始

### 1. 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS test
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 2. 配置数据库连接

编辑 `backend/src/main/resources/application.properties`：

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/test?characterEncoding=utf-8
spring.datasource.username=root
spring.datasource.password=你的密码
```

### 3. 构建前端

```bash
cd frontend
npm install
npm run build
```

构建产物输出到 `frontend/dist/`。

### 4. 启动后端

后端启动时会自动将 `frontend/dist/` 拷贝到静态资源目录，前端和后端运行在同一个端口。

```bash
cd backend
mvn spring-boot:run
```

或者使用项目根目录下的一键脚本：

```bash
bash build.sh
```

### 5. 访问

打开浏览器访问 **http://localhost:8080**

## 默认配置

| 配置项 | 默认值 | 说明 |
|---|---|---|
| 服务端口 | 8080 | `application.yml` 中修改 |
| 数据库名 | test | `application.properties` 中修改 |
| JWT 有效期 | 24 小时 | `application.yml` → jwt.expiration |
| 新用户积分 | 1000 | `application.yml` → platform.initial-points |
| 初始信用分 | 80 | `application.yml` → platform.credit.initial-score |
| 任务自动取消 | 14 天 | `application.yml` → platform.task.auto-cancel-days |
| 附件大小限制 | 20MB | `application.yml` → spring.servlet.multipart |
| 交付物大小限制 | 30MB | `application.yml` → spring.servlet.multipart |

## 注册与登录

项目使用用户名 + 密码方式注册登录。

- 注册：`POST /api/auth/register` — 需要 `username`、`password`、`nickname`
- 登录：`POST /api/auth/login` — 需要 `username`、`password`
- 管理员需直接在数据库中设置 `role = 'ADMIN'`

## 主要 API

| 路径 | 方法 | 说明 |
|---|---|---|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/tasks` | GET | 任务大厅列表 |
| `/api/tasks/{id}` | GET | 任务详情 |
| `/api/tasks` | POST | 发布任务 |
| `/api/tasks/{id}/apply` | POST | 申请接单 |
| `/api/tasks/{id}/applications` | GET | 查看申请列表 |
| `/api/tasks/{id}/applications/{appId}/award` | POST | 选择中标者 |
| `/api/tasks/{id}/messages` | GET | 获取留言 |
| `/api/my/tasks` | GET | 我发布的任务 |
| `/api/my/applications` | GET | 我的申请记录 |
| `/api/public/categories` | GET | 任务分类列表 |
| `/api/admin/auth/login` | POST | 管理员登录 |

所有 `/api/**` 路径（除 `/api/auth/**` 和 `/api/public/**` 外）需要携带 JWT token：
```
Authorization: Bearer <token>
```
