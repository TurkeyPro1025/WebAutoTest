/**
 * Allure报告生成器
 * 功能：
 * 1. 按时间戳生成历史报告
 * 2. 自动创建目录结构
 * 3. 处理报告生成异常
 */
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

// 获取当前时间戳
const date = new Date();
const timestamp = date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false
}).replace(/\//g, '-').replace(/\s/g, '_') + '_' + 
date.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
}).replace(/:/g, '-');

// 确保allure-history目录存在
const historyDir = path.join(__dirname, "../allure-history");
if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir);
}

// 先生成报告再备份
exec("allure generate allure-results --clean -o allure-report", (err, stdout, stderr) => {
    if (err) {
        console.error(`Error generating report: ${stderr}`);
        process.exit(1);
    }
    console.log(stdout);
    
    // 报告生成后再备份
    // 如果allure-report目录存在，将其压缩并移动到allure-history
    const reportDir = path.join(__dirname, "../allure-report");
    if (fs.existsSync(reportDir)) {
        const zipPath = path.join(historyDir, `allure-report-${timestamp}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", {
            zlib: { level: 9 }, // 设置压缩级别
        });

        output.on("close", () => {
            console.log(`Allure report archived: ${zipPath}`);
        });

        archive.on("error", (err) => {
            throw err;
        });

        archive.pipe(output);
        archive.directory(reportDir, false);
        archive.finalize();
    }
    
    // 最后打开报告
    exec("allure open allure-report", (err, stdout, stderr) => {
        if (err) {
            console.error(`Error opening report: ${stderr}`);
            process.exit(1);
        }
        console.log(stdout);
    });
});

function clearAllureResults() {
    // 清空allure-results目录
    const resultsDir = path.join(__dirname, "../allure-results");
    if (fs.existsSync(resultsDir)) {
        // 递归删除目录内容
        fs.rmSync(resultsDir, { recursive: true, force: true });
        // 重新创建空目录
        fs.mkdirSync(resultsDir);
        console.log("Allure测试结果目录已清空");
    }
}

// 添加检查allure-results目录是否有内容的代码
const resultsDir = path.join(__dirname, "../allure-results");
if (fs.existsSync(resultsDir)) {
    const files = fs.readdirSync(resultsDir);
    if (files.length === 0) {
        console.warn("警告：allure-results目录为空，没有测试结果可以生成报告");
    } else {
        console.log(`发现${files.length}个测试结果文件`);
    }
} else {
    console.error("错误：allure-results目录不存在");
    // 创建目录
    fs.mkdirSync(resultsDir);
}

// 监听进程退出事件清空allure-results目录
process.on('exit', () => {
    console.log('程序即将退出，正在清理allure-results目录...');
    clearAllureResults();
});
process.on('SIGINT', () => {
    console.log('接收到终止信号，正在清理allure-results目录...');
    clearAllureResults();
    process.exit(0); // 退出程序
});
module.exports = exec;
