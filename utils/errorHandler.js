/**
 * 测试错误处理中心
 * 功能：
 * 1. 捕获测试失败时的页面状态
 * 2. 收集浏览器控制台日志
 * 3. 生成错误唯一指纹用于追踪
 * 4. 附加错误上下文到测试报告
 */
module.exports = {
  captureError: async ({ page, testInfo }, error) => {
    // 捕获当前页面URL和源码
    const currentUrl = page.url();
    const pageSource = await page.content();
    
    // 将页面源码作为附件添加到Allure报告
    await testInfo.attach('page_source', {
      body: pageSource,
      contentType: 'text/html'
    });
    
    // 通过evaluate获取浏览器控制台日志
    // 需要提前在页面注入console监听脚本
    const consoleLogs = await page.evaluate(() => {
      return window.consoleLogs || [];
    });
    
    // 生成简化的错误指纹用于快速识别同类错误
    // 截取前100字符防止过长
    const errorFingerprint = `${error.message}-${currentUrl}`.substring(0, 100);
    
    return {
      timestamp: new Date().toISOString(),
      testCase: testInfo.title,
      errorType: error.constructor.name, // 获取错误类型名称
      errorMessage: error.message,
      stackTrace: error.stack,
      context: {
        url: currentUrl,
        viewport: page.viewportSize(), // 当前视窗尺寸
        userAgent: page.evaluate(() => navigator.userAgent), // 浏览器UA信息
        consoleLogs,
        networkLogs: testInfo.attachments
          .filter(a => a.name === 'network')
          .map(a => a.body)
      },
      fingerprint: errorFingerprint
    };
  }
}; 