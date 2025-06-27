/**
 * Playwright核心配置
 * 配置项：
 * 1. 浏览器和测试运行参数
 * 2. 报告生成设置
 * 3. 环境相关配置
 * 4. 项目矩阵定义
 */
const { defineConfig } = require("@playwright/test");

// 浏览器配置
const config = {
    // 测试目录和超时设置
    testDir: "./tests",
    timeout: 10 * 60 * 1000,
    // 失败重试机制（可通过环境变量控制）
    retries: 1,
    expect: { timeout: 5000 },
    fullyParallel: true,
    // 使用Allure报告生成器
    reporter: [
        ["list"],
        [
            "allure-playwright",
            {
                outputFolder: "allure-results", // 原始数据目录
                detail: true, // 包含详细测试步骤
                suiteTitle: false, // 禁用自动套件标题
            },
        ],
    ],
    use: {
        // 浏览器基础配置
        headless: false, // 可视化模式运行
        viewport: { width: 2560, height: 1327 }, // 视口尺寸

        // 调试辅助配置
        actionTimeout: 10000, // 单操作超时
        trace: "retain-on-failure", // 保留失败用例的追踪
        video: {
            mode: "retain-on-failure",
            //   size: { width: 1920, height: 1080 }
        },
        screenshot: {
            mode: "only-on-failure",
            fullPage: true,
        },

        // 环境相关配置
        // baseURL: "http://localhost:8082",
        baseURL: "192.168.4.233",
        // storageState: 'auth.json', // 认证状态持久化
        contextOptions: {
            locale: "zh-CN",
            timezoneId: "Asia/Shanghai",
        },
    },
    projects: [
        {
            name: "chromium",
            use: { browserName: "chromium" },
        },
        // {
        //     name: "视频墙控制测试",
        //     testMatch: /.*VideoWall.*/,
        // },
        // {
        //     name: "网络设置测试",
        //     testMatch: /.*Network.*/,
        //     dependencies: ["视频墙控制测试"], // 指定依赖关系，确保先运行视频墙测试
        // },
    ],
};

module.exports = defineConfig(config);
