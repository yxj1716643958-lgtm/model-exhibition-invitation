// 数据库初始化脚本
// 运行：node scripts/init-db.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 检查数据库连接
  await prisma.$connect()
  console.log('✓ 数据库连接成功')

  // 创建示例数据（可选）
  // await prisma.ticket.create({
  //   data: {
  //     name: '示例用户',
  //     phone: '13800138000',
  //     email: 'example@email.com',
  //     status: 'PENDING'
  //   }
  // })

  console.log('✓ 数据库初始化完成')
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
