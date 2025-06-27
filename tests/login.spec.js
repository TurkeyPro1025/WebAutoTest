/**
 * 登录功能测试套件
 * 包含测试场景：
 * 1. 管理员登录验证
 * 2. 循环压力测试
 * 3. 动态数据驱动测试
 * 4. 基础流程步骤验证
 */
const { test, expect } = require("@playwright/test");
const { allure } = require('allure-playwright');
const LoginPage = require("../pages/Login");
const SettingsPage = require("../pages/Settings");
const ControlPage = require("../pages/Control");
const users = require("../test-data/users");
const { runWithRetry } = require("../utils/loopUtils");
const WebSocketClient = require("../utils/websocketClient");
// const monitoring = require('../utils/monitoring');

test.beforeEach(async ({ page }, testInfo) => {
    // 监听XMLHttpRequest
    const interceptedRequests = [];
    await page
        .route("**/*", (route, request) => {
            if (request.resourceType() === "xhr") {
                interceptedRequests.push({
                    url: request.url(),
                    method: request.method(),
                    headers: request.headers(),
                    postData: request.postData(),
                });
            }
            route.continue();
        })
        .catch((error) => {
            console.error(`Error intercepting request: ${error.message}`);
        });

    // 监听WebSocket消息
    const interceptedWebSocketMessages = [];
    page.on("websocket", (ws) => {
        ws.on("message", (data) => {
            interceptedWebSocketMessages.push({
                type: "received",
                data: data,
            });
        });
    });

    allure.attachment("intercepted_requests", {
        body: JSON.stringify(interceptedRequests, null, 2),
        contentType: "application/json",
    });

    allure.attachment("intercepted_websocket_messages", {
        body: JSON.stringify(interceptedWebSocketMessages, null, 2),
        contentType: "application/json",
    });
});

// test("Settings网络设置测试 @Network", async ({ page }) => {
//     const loginPage = new LoginPage(page);
//     await loginPage.navigate();
//     await loginPage.login(users.admin.username, users.admin.password);

//     // 确保登录成功后跳转到仪表盘页面
//     await expect(page).toHaveURL(/overview/);

//     await allure.step('验证overview页面元素', async () => {
//         // 截图并保存
//         const screenshot = await page.screenshot({ path: './screenshot/Overview/Overview页面截图.png', fullPage: true });
//         // 将截图附加到Allure报告
//         await allure.attachment('Overview页面截图', screenshot, 'image/png');
//     });

//     // 继续添加其他页面的测试逻辑
//     // 例如，导航到其他页面并进行测试

//     // 导航到设置页面
//     await page.locator('#navigate-to-setting').click();
//     await expect(page).toHaveURL(/setting/);

//     // 测试
//     await test.step('验证setting页面元素', async () => {
//         const settingsPage = new SettingsPage(page, allure);
//         await settingsPage.testNetworkSettings(expect);
//     });
// });

test("视频墙控制测试 @VideoWall", async ({ page }) => {
    // 登录
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await page.waitForTimeout(3000);
    await loginPage.login(users.admin.username, users.admin.password);
    
    // 确保登录成功后跳转到仪表盘页面
    await expect(page).toHaveURL(/overview/);

    // 导航到控制页面
    await page.locator('#navigate-to-control').click();
    await expect(page).toHaveURL(/control/);

    // 测试视频墙设置
    const controlPage = new ControlPage(page, allure);
    await controlPage.testVideoWallSettings(expect);
});


test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === "failed") {
        // 添加浏览器日志（保持不变）
        const logs = await page.evaluate(() =>
            performance.getEntries().map((entry) => ({
                name: entry.name,
                type: entry.initiatorType,
                duration: entry.duration,
            })),
        );

        // 替换废弃的 metrics() 方法
        const performanceMetrics = await page.evaluate(() => ({
            timing: performance.timing.toJSON(),
            memory: performance.memory,
        }));

        // 生成错误报告
        const errorReport = {
            test: testInfo.title,
            duration: testInfo.duration,
            retry: testInfo.retry,
            attachments: testInfo.attachments.map((a) => a.name),
            performance: {
                logs,
                metrics: performanceMetrics, // 使用新的性能指标
                memory: performanceMetrics.memory.usedJSHeapSize,
            },
        };

        await testInfo.attach("error_report", {
            body: JSON.stringify(errorReport, null, 2),
            contentType: "application/json",
        });
    }
});
