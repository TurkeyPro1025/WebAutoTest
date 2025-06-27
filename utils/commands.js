/**
 * 自定义Playwright操作扩展
 * 包含：
 * 1. 增强型表单操作方法
 * 2. 网络状态等待工具
 * 3. 常用操作的快捷实现
 */
async function clearAndType(locator, text) {
  await locator.clear();
  await locator.fill(text);
}

async function waitForNetworkIdle(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

module.exports = { clearAndType, waitForNetworkIdle }; 