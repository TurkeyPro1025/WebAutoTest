/**
 * 测试用户数据配置
 * 功能：
 * 1. 定义不同角色的测试用户凭证
 * 2. 支持从环境变量读取敏感信息
 * 3. 提供统一的用户数据访问入口
 */
module.exports = {
  admin: {
    username: process.env.ADMIN_USER || 'admin',
    password: process.env.ADMIN_PWD || '123456',
    role: 'administrator'
  },
  guest: {
    username: 'guest',
    password: 'Welcome123',
    role: 'guest'
  }
}; 