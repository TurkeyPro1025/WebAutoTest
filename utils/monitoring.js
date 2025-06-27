/**
 * 监控系统集成模块
 * 集成Sentry错误监控平台：
 * 1. 初始化Sentry SDK
 * 2. 封装错误上报方法
 * 3. 添加上下文信息辅助调试
 */
const Sentry = require("@sentry/node");

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development", // 区分环境
    release: "test-automation@" + process.env.npm_package_version, // 关联版本
    tracesSampleRate: 0.2, // 性能追踪采样率
});

module.exports = {
    capturePlaywrightError: (errorInfo) => {
        Sentry.withScope((scope) => {
            // 添加浏览器上下文信息
            scope.setContext("browser", {
                url: errorInfo.context.url,
                viewport: errorInfo.context.viewport,
                userAgent: errorInfo.context.userAgent,
            });

            // 添加额外调试信息
            scope.setExtra("console_logs", errorInfo.context.consoleLogs);
            scope.setExtra("network_logs", errorInfo.context.networkLogs);

            // 上报错误并添加自定义标签
            Sentry.captureException(new Error(errorInfo.errorMessage), {
                tags: {
                    test_case: errorInfo.testCase,
                    error_type: errorInfo.errorType,
                    error_category: errorInfo.category,
                },
            });
        });
    },
};
