const fs = require("fs");
const path = require("path");

// 查询操作结果并截图
async function checkResultAndScreenshot(page, allure, operation, folder = "") {
    async function getFirstVisibleElement(page, selectors, timeout = 11000) {
        const promises = selectors.map((selector) =>
            page.waitForSelector(selector, { state: "visible", timeout }).then((element) => ({ element, selector })),
        );

        try {
            return await Promise.race(promises);
        } catch (error) {
            throw new Error(`在 ${timeout}ms 内未检测到任何元素`);
        }
    }

    // 使用示例
    const { element, selector } = await getFirstVisibleElement(page, [".el-message--success", ".el-message--warning"], 15000);

    console.log(`最先出现的元素是：${selector}`);

    // 处理文件夹路径
    let screenshotPath;
    const baseScreenshotDir = "screenshot";

    if (folder) {
        // 确保文件夹存在
        const folderPath = path.resolve(process.cwd(), baseScreenshotDir, folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        screenshotPath = path.join(folderPath, operation + "操作结果截图.png");
    } else {
        // 确保基础截图文件夹存在
        const baseFolder = path.resolve(process.cwd(), baseScreenshotDir);
        if (!fs.existsSync(baseFolder)) {
            fs.mkdirSync(baseFolder, { recursive: true });
        }
        screenshotPath = path.join(baseFolder, operation + "操作结果截图.png");
    }

    const screenshot = await page.screenshot({ path: screenshotPath, fullPage: true });
    await allure.attachment(operation + "操作结果截图", screenshot, "image/png");
}

module.exports = {
    checkResultAndScreenshot,
};
