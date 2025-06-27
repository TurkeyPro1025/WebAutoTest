/**
 * 混合数据源管理器
 * 职责：
 * 1. 根据环境切换数据源(API/WebSocket/静态)
 * 2. 提供统一的数据获取接口
 * 3. 实现数据源自动回退机制
 */
module.exports = {
  getTestData: async (type) => {
    // 根据环境变量选择数据源，默认使用静态数据
    const source = process.env.DATA_SOURCE || 'static';
    
    switch(source) {
      case 'api':
        // 通过API获取实时测试数据
        const http = new HttpClient(process.env.API_BASE_URL);
        return http.fetchData(`/test-data/${type}`);
        
      case 'websocket':
        // 通过WebSocket订阅实时数据流
        const ws = new WebSocketClient(process.env.WS_ENDPOINT);
        await ws.connect();
        return ws.waitForData({ dataType: type });
        
      default:
        // 回退到本地静态数据
        return require('./staticData')[type];
    }
  }
}; 