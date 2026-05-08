# 模玩展邀请函管理系统

一个完整的模玩展邀请函申请、审核与核销管理系统。

## 功能特性

### 用户端
- 📝 在线申请邀请函（填写姓名、手机号、邮箱、企业/学校、身份证号、随行人员）
- 🔍 实时查询申请状态
- 🎫 审核通过后自动生成入场二维码
- ✅ 支持移动端访问

### 管理端
- 📋 查看所有申请列表
- 🔍 按状态筛选（待审核/已通过/已拒绝）
- ✓ 审核申请（通过/拒绝）
- 📊 实时统计数据

### 核销端
- 📷 二维码扫描核销
- ⌨️ 手动输入核销码
- 🔒 防止重复核销
- 📱 实时反馈核销结果

## 技术栈

- **前端**: Next.js 15 + React 18 + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **二维码**: qrcode.react
- **扫码**: zxing-library

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   └── tickets/       # 门票相关 API
│   │       ├── route.ts           # 创建/获取门票
│   │       ├── [id]/              # 获取门票详情
│   │       ├── phone/             # 通过手机号查询
│   │       └── redeem/            # 核销门票
│   ├── admin/             # 管理后台页面
│   ├── redeem/            # 核销页面
│   ├── status/            # 状态查询页面
│   ├── page.tsx           # 首页（申请表单）
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── lib/                   # 工具库
│   ├── prisma.ts          # Prisma 客户端
│   └── types.ts           # TypeScript 类型定义
├── prisma/
│   └── schema.prisma      # 数据库模型定义
└── package.json
```

## 数据库模型

### Ticket 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键（CUID） |
| name | String | 姓名 |
| phone | String | 手机号 |
| email | String? | 邮箱（可选） |
| status | Enum | 状态：PENDING/APPROVED/REJECTED |
| verificationCode | String? | 核销码（审核通过后生成） |
| isRedeemed | Boolean | 是否已核销 |
| redeemedAt | DateTime? | 核销时间 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |
| reviewedAt | DateTime? | 审核时间 |
| reviewedBy | String? | 审核员 |
| rejectReason | String? | 拒绝原因 |

## API 接口

### 创建门票申请
```
POST /api/tickets
{
  "name": "张三",
  "phone": "13800138000",
  "email": "example@email.com"  // 可选
}
```

### 查询申请状态
```
GET /api/tickets/phone/{phone}
```

### 获取门票列表（管理员）
```
GET /api/tickets?status=PENDING
```

### 审核门票
```
POST /api/tickets/{id}/review
{
  "action": "approve",  // 或 "reject"
  "reviewerName": "管理员",
  "rejectReason": "原因"  // 拒绝时可选
}
```

### 核销门票
```
POST /api/tickets/redeem
{
  "verificationCode": "ABC-123-XYZ"
}
```

## 安全性

- ✅ 防止重复申请（同一手机号只能有一个待审核/已通过的申请）
- ✅ 防止重复核销
- ✅ 手机号格式验证
- ✅ 唯一核销码生成
- ✅ 状态检查（只能审核待审核的申请）
- ✅ SQL 注入防护（使用 Prisma ORM）

## 使用说明

### 用户申请流程
1. 访问首页填写申请表单
2. 提交后跳转到状态查询页面
3. 等待管理员审核
4. 审核通过后自动显示二维码
5. 活动当天出示二维码入场

### 管理员审核流程
1. 访问 /admin 管理后台
2. 输入审核员姓名
3. 查看待审核申请列表
4. 点击"审核"按钮进行通过或拒绝操作

### 核销流程
1. 访问 /redeem 核销页面
2. 点击"启动扫码"使用摄像头扫描二维码
3. 或手动输入核销码
4. 系统自动验证并完成核销

## 许可证

MIT
