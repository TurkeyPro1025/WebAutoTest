/**
 * 实时数据WebSocket客户端
 * 功能：
 * 1. 监听和过滤特定消息
 * 2. 提供带超时的数据等待机制
 */
class WebSocketClient {
  constructor(connection) {
    this.connection = connection;
    this.messageQueue = [];
    this.connection.on('message', msg => this.messageQueue.push(JSON.parse(msg)));
  }

  async waitForData(pattern, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => 
        reject(new Error('WebSocket数据获取超时')), timeout);

      const checkMessage = () => {
        const index = this.messageQueue.findIndex(msg => 
          Object.entries(pattern).every(([k, v]) => msg[k] === v));
        if (index >= 0) {
          clearTimeout(timer);
          resolve(this.messageQueue.splice(index, 1)[0]);
        }
      };
      
      this.connection.on('message', checkMessage);
    });
  }
}

module.exports = WebSocketClient;