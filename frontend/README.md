# 校园任务悬赏平台 - Vue3 前端开发任务规划

## 项目概述

基于 target.md 需求文档和 example.html 原型，在 Vue3 + TypeScript + Pinia + Vue Router 技术栈下，实现北京理工大学校园任务悬赏平台的完整前端。

**色彩方案**：以北理工校徽蓝（#1E56A0）为主色调，参考 example.html 的 CSS 变量设计。

---

## 技术选型

| 技术         | 版本/说明                             |
| ------------ | ------------------------------------- |
| Vue 3        | Composition API + `<script setup>`    |
| TypeScript   | 严格模式                              |
| Vue Router 4 | History 模式，路由守卫鉴权            |
| Pinia        | 全局状态管理                          |
| Element Plus | UI 组件库（与 example.html 风格接近） |
| Axios        | HTTP 请求封装                         |
| Day.js       | 日期时间处理                          |
| VueUse       | 组合式工具函数                        |

---

## 目录结构规划

```
src/
├── api/                    # 后端接口定义（留存接口占位）
│   ├── auth.ts             # 认证相关接口
│   ├── task.ts             # 任务相关接口
│   ├── user.ts             # 用户相关接口
│   ├── admin.ts            # 管理员相关接口
│   ├── notification.ts     # 通知相关接口
│   ├── finance.ts          # 积分/财务相关接口
│   └── index.ts            # Axios 实例与拦截器
├── assets/                 # 静态资源
├── components/             # 全局通用组件
│   ├── layout/
│   │   ├── UserLayout.vue      # 用户端布局（左侧导航 + 顶部栏）
│   │   └── AdminLayout.vue     # 管理员端布局
│   ├── common/
│   │   ├── NotificationBell.vue  # 顶部铃铛通知组件
│   │   ├── TaskCard.vue          # 任务卡片组件
│   │   ├── StatusTag.vue         # 状态标签组件
│   │   ├── Pagination.vue        # 分页组件
│   │   └── ConfirmDialog.vue     # 二次确认对话框
│   └── modals/
│       ├── ReportModal.vue       # 举报弹窗
│       ├── AppealModal.vue       # 申诉弹窗
│       ├── EvaluateModal.vue     # 评价弹窗
│       ├── AvatarModal.vue       # 头像修改弹窗
│       ├── NicknameModal.vue     # 昵称修改弹窗
│       ├── AnnouncementModal.vue # 公告栏修改弹窗
│       ├── RechargeModal.vue     # 充值弹窗
│       ├── WithdrawModal.vue     # 提现弹窗
│       └── CreditRestoreModal.vue # 信用分恢复申请弹窗
├── stores/                 # Pinia 状态管理
│   ├── auth.ts             # 认证状态（用户信息、token）
│   ├── task.ts             # 任务列表/详情状态
│   ├── notification.ts     # 通知状态（未读数、列表）
│   ├── user.ts             # 用户信息状态
│   └── admin.ts            # 管理员状态
├── types/                  # TypeScript 类型定义
│   ├── auth.ts
│   ├── task.ts
│   ├── user.ts
│   ├── notification.ts
│   ├── finance.ts
│   └── admin.ts
├── router/
│   └── index.ts            # 路由配置与守卫
├── utils/
│   ├── request.ts          # Axios 封装
│   ├── format.ts           # 日期/积分等格式化
│   └── validate.ts         # 表单校验规则
├── views/
│   ├── auth/
│   │   └── LoginView.vue           # /login 登录页（含管理员登录Tab）
│   ├── user/                        # 用户端页面
│   │   ├── TaskHallView.vue         # /task-hall 任务大厅
│   │   ├── TaskDetailView.vue       # /task/:taskId 任务详情
│   │   ├── PublishTaskView.vue      # /publish-task 发布任务
│   │   ├── MyTasksView.vue          # /my-tasks 我的任务
│   │   ├── MyApplicationsView.vue   # /my-applications 我的申请
│   │   ├── ProfileView.vue          # /profile 个人中心
│   │   ├── NotificationsView.vue    # /notifications 消息通知
│   │   ├── UserProfileView.vue      # /user/:userId 他人主页
│   │   └── TaskHistoryView.vue      # /task-history 任务历史
│   └── admin/                       # 管理员端页面
│       ├── AdminLoginView.vue        # /admin/login
│       ├── DashboardView.vue         # /admin/dashboard
│       ├── UsersView.vue             # /admin/users
│       ├── UserDetailView.vue        # /admin/users/:userId
│       ├── TasksView.vue             # /admin/tasks
│       ├── ReviewsView.vue           # /admin/reviews
│       ├── SettingsView.vue          # /admin/settings
│       ├── FinanceView.vue           # /admin/finance
│       ├── BroadcastView.vue         # /admin/broadcast
│       └── CategoriesView.vue        # /admin/categories
├── App.vue
├── main.ts
└── style.css
```

---

## 页面路由规划

### 用户端路由

| 路径               | 组件               | 说明                      |
| ------------------ | ------------------ | ------------------------- |
| `/login`           | LoginView          | 登录页（含管理员Tab切换） |
| `/task-hall`       | TaskHallView       | 任务大厅（需登录）        |
| `/task/:taskId`    | TaskDetailView     | 任务详情（需登录）        |
| `/publish-task`    | PublishTaskView    | 发布任务（需登录）        |
| `/my-tasks`        | MyTasksView        | 我的任务（需登录）        |
| `/my-applications` | MyApplicationsView | 我的申请（需登录）        |
| `/profile`         | ProfileView        | 个人中心（需登录）        |
| `/notifications`   | NotificationsView  | 消息通知（需登录）        |
| `/user/:userId`    | UserProfileView    | 他人主页（需登录）        |
| `/task-history`    | TaskHistoryView    | 任务历史（需登录）        |

### 管理员端路由

| 路径                   | 组件           | 说明                   |
| ---------------------- | -------------- | ---------------------- |
| `/admin/login`         | AdminLoginView | 管理员登录             |
| `/admin/dashboard`     | DashboardView  | 仪表盘（需管理员权限） |
| `/admin/users`         | UsersView      | 用户管理               |
| `/admin/users/:userId` | UserDetailView | 用户详情               |
| `/admin/tasks`         | TasksView      | 任务管理               |
| `/admin/reviews`       | ReviewsView    | 审核管理               |
| `/admin/settings`      | SettingsView   | 系统配置               |
| `/admin/finance`       | FinanceView    | 财务审计               |
| `/admin/broadcast`     | BroadcastView  | 消息广播               |
| `/admin/categories`    | CategoriesView | 分类管理               |

---

## API 接口规划（占位，待后端实现）

### 认证模块

- `GET /api/auth/oauth/redirect` — 获取学校 OAuth2.0 跳转地址
- `GET /api/auth/oauth/callback?code=` — OAuth 回调，换取平台 Token
- `POST /api/admin/auth/login` — 管理员账号密码登录
- `POST /api/auth/logout` — 退出登录

### 任务模块

- `GET /api/tasks` — 任务列表（支持筛选/排序/分页）
- `GET /api/tasks/:id` — 任务详情
- `POST /api/tasks` — 发布任务
- `PUT /api/tasks/:id` — 编辑任务
- `DELETE /api/tasks/:id` — 下架任务
- `POST /api/tasks/:id/apply` — 申请接单
- `POST /api/tasks/:id/select` — 选择中标者
- `POST /api/tasks/:id/deliver` — 提交交付物
- `POST /api/tasks/:id/confirm` — 确认完成
- `POST /api/tasks/:id/reject` — 退回修改
- `POST /api/tasks/:id/cancel` — 取消任务
- `POST /api/tasks/:id/extend` — 延长截止时间
- `POST /api/tasks/:id/appeal` — 发起申诉
- `POST /api/tasks/:id/evaluate` — 评价
- `GET /api/tasks/:id/messages` — 获取留言板消息
- `POST /api/tasks/:id/messages` — 发送留言

### 用户模块

- `GET /api/users/me` — 获取当前用户信息
- `GET /api/users/:id` — 获取他人主页信息
- `POST /api/users/avatar` — 提交头像修改申请
- `POST /api/users/nickname` — 提交昵称修改申请
- `POST /api/users/announcement` — 提交公告栏修改申请
- `GET /api/users/me/credit-log` — 信用分明细
- `GET /api/users/me/finance` — 收支明细
- `POST /api/users/me/credit-restore` — 申请恢复信用分
- `GET /api/users/me/evaluations` — 评价记录
- `GET /api/users/me/notification-settings` — 通知设置
- `PUT /api/users/me/notification-settings` — 更新通知设置

### 财务模块

- `POST /api/finance/recharge` — 充值
- `POST /api/finance/withdraw` — 提现

### 通知模块

- `GET /api/notifications` — 通知列表
- `PUT /api/notifications/:id/read` — 标记已读
- `PUT /api/notifications/read-all` — 全部标记已读
- `DELETE /api/notifications/:id` — 删除通知
- `GET /api/notifications/unread-count` — 未读数量

### 管理员模块

- `GET /api/admin/dashboard` — 仪表盘数据
- `GET /api/admin/users` — 用户列表
- `GET /api/admin/users/:id` — 用户详情
- `POST /api/admin/users/:id/freeze` — 冻结账户
- `POST /api/admin/users/:id/unfreeze` — 解冻账户
- `POST /api/admin/users/:id/credit-reset` — 重置信用分
- `GET /api/admin/tasks` — 任务列表（管理员）
- `POST /api/admin/tasks/:id/force-remove` — 强制下架
- `GET /api/admin/reviews` — 审核列表
- `POST /api/admin/reviews/:id/approve` — 审核通过
- `POST /api/admin/reviews/:id/reject` — 审核拒绝
- `POST /api/admin/appeals/:id/complete` — 申诉判定完成
- `POST /api/admin/appeals/:id/cancel` — 申诉判定取消
- `GET /api/admin/settings` — 获取系统配置
- `PUT /api/admin/settings` — 保存系统配置
- `GET /api/admin/finance/recharges` — 充值记录
- `GET /api/admin/finance/withdrawals` — 提现记录
- `GET /api/admin/finance/platform-flow` — 平台收益流水
- `GET /api/admin/finance/anomalies` — 异常交易
- `POST /api/admin/broadcast` — 发布广播
- `GET /api/admin/categories` — 分类列表
- `POST /api/admin/categories` — 新增分类
- `PUT /api/admin/categories/:id` — 编辑分类
- `DELETE /api/admin/categories/:id` — 删除分类

---

## 状态机（任务状态流转）

```
发布中 (PUBLISHING)
  → 进行中 (IN_PROGRESS)       [发布者选择中标者]
  → 已取消 (CANCELLED)         [超时无人接单 / 发布者主动下架]

进行中 (IN_PROGRESS)
  → 待确认 (PENDING_CONFIRM)   [接单者提交交付物]
  → 已取消 (CANCELLED)         [超时强制取消 / 双方协商取消]
  → 申诉中 (APPEALING)         [任意一方发起申诉]

待确认 (PENDING_CONFIRM)
  → 已完成 (COMPLETED)         [发布者确认完成 / 3天自动确认]
  → 进行中 (IN_PROGRESS)       [发布者退回修改]
  → 申诉中 (APPEALING)         [任意一方发起申诉]

申诉中 (APPEALING)
  → 已完成 (COMPLETED)         [管理员判定完成]
  → 已取消 (CANCELLED)         [管理员判定取消]
  → 进行中 (IN_PROGRESS)       [管理员判无效，继续执行]
```

---

## 关键交互逻辑说明

1. **视角切换**：用 Pinia `authStore.viewMode`（`publisher` | `taker`）持久化，影响任务大厅推荐模块和导航默认高亮。
2. **路由守卫**：未登录访问用户端 → 重定向 `/login`；非管理员访问 `/admin/*` → 重定向 `/admin/login`。
3. **通知铃铛**：全局组件，轮询或 WebSocket 获取未读数，最大显示 99+。
4. **积分冻结**：发布任务时前端计算并提示冻结金额，提交前二次确认。
5. **文件上传**：分片上传，显示进度条，不阻塞界面。
6. **留言板**：轮询或长连接，频控每分钟 5 条由前端倒计时提示。
7. **倒计时**：任务剩余时间用 `setInterval` 实时更新显示。

---

## 开发任务清单

### Phase 1：基础搭建

- [x] 创建 target.md（本文件）
- [x] 安装依赖：Element Plus、Vue Router 4、Pinia、Axios、Day.js
- [x] 配置 Vite（路径别名 @）
- [x] 配置 Element Plus 按需引入
- [x] 创建 types/ 类型定义文件
- [x] 创建 api/ 接口占位文件
- [x] 创建 stores/ Pinia 状态
- [x] 创建 router/index.ts 路由配置
- [x] 创建 UserLayout.vue 和 AdminLayout.vue

### Phase 2：认证页面

- [x] LoginView.vue（OAuth + 管理员登录Tab）

### Phase 3：用户端核心页面

- [x] TaskHallView.vue（任务大厅、筛选、推荐）
- [x] TaskDetailView.vue（多状态复合页、留言板）
- [x] PublishTaskView.vue（发布任务表单）
- [x] MyTasksView.vue（我的任务列表）
- [x] MyApplicationsView.vue（我的申请）
- [x] ProfileView.vue（个人中心，5个子标签）
- [x] NotificationsView.vue（消息通知）
- [x] UserProfileView.vue（他人主页）
- [x] TaskHistoryView.vue（任务历史）

### Phase 4：弹窗组件

- [x] ReportModal、AppealModal、EvaluateModal
- [x] AvatarModal、NicknameModal、AnnouncementModal
- [x] RechargeModal、WithdrawModal、CreditRestoreModalx

### Phase 5：管理员端页面

- [x] AdminLoginView
- [x] DashboardView（仪表盘、图表）
- [x] UsersView + UserDetailView
- [x] TasksView
- [x] ReviewsView（5个子标签）
- [x] SettingsView
- [x] FinanceView（4个子标签）
- [x] BroadcastView
- [x] CategoriesView
