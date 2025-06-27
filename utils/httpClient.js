/**
 * 测试用HTTP客户端
 * 职责：
 * 1. 封装REST API请求
 * 2. 管理认证令牌
 * 3. 提供统一的数据获取接口
 */
const { request } = require('@playwright/test');

class HttpClient {
  constructor(baseURL) {
    // 初始化基础URL和认证令牌
    this.baseURL = baseURL;
    this.token = null;
  }

  async fetchData(endpoint, options = {}) {
    // 创建带认证的上下文
    const context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        Authorization: this.token ? `Bearer ${this.token}` : '' // 携带令牌
      }
    });

    // 发送GET请求并确保成功状态码
    const response = await context.get(endpoint, {
      failOnStatusCode: true, // 非2xx状态码抛出异常
      ...options
    });
    
    return response.json(); // 自动解析JSON响应
  }

  async authenticate(credentials) {
    const context = await request.newContext();
    const response = await context.post(`${this.baseURL}/auth`, { data: credentials });
    this.token = (await response.json()).accessToken;
  }
}

module.exports = HttpClient;