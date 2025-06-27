/**
 * 测试循环执行工具
 * 功能：
 * 1. 提供带重试机制的测试执行
 * 2. 支持自定义迭代次数
 * 3. 记录每次迭代的详细日志
 */
async function runWithRetry(testFunc, times = 3) {
  for (let i = 1; i <= times; i++) {
    try {
      console.log(`开始第 ${i}/${times} 次迭代测试`);
      await testFunc(i);
    } catch (error) {
      console.error(`第 ${i} 次迭代失败: ${error.message}`);
      if (i === times) throw error;
    }
  }
}

module.exports = { runWithRetry }; 