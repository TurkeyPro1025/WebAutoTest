/**
 * 登录页面对象模型
 * 职责：
 * 1. 封装登录页面元素定位器
 * 2. 提供页面导航和登录操作
 * 3. 隔离页面结构变化对测试用例的影响
 */
class LoginPage {
    constructor(page) {
        this.page = page;
        this.username = page.locator("#dataTest-username");
        this.password = page.locator("#dataTest-password");
        this.submitButton = page.locator("#dataTest-login-btn");
    }
    
    async navigate() {
        await this.page.goto("http://192.168.4.233/");
        // 等待URL包含#/，确保重定向完成
        await this.page.waitForURL(/.*\/#\//);
        // 在测试中最大化窗口
        await this.page.evaluate(() => {
            window.moveTo(0, 0);
            window.resizeTo(screen.width, screen.height);
        });
    }

    async login(username, password) {
        await this.username.fill(username);
        await this.password.fill(password);
        await this.submitButton.click();
        
        await this.page.waitForTimeout(1000);
        // 检查是否出现修改密码弹窗
        const newPasswordVisible = await this.page.locator("#dataTest-newPwd").isVisible()
            .catch(() => false); // 如果元素不存在，返回false
        
        // 如果出现修改密码弹窗，则处理密码修改
        if (newPasswordVisible) {
            // 假设我们使用与原密码不同的新密码
            const newPassword = "123456"; // 或者其他新密码规则
            
            // 填写新密码和确认密码
            await this.page.locator("#dataTest-newPwd").fill(newPassword);
            await this.page.locator("#dataTest-confirmPwd").fill(newPassword);
            
            // 点击确认修改按钮
            await this.page.locator("#dataTest-apply-btn").click();
            
            // 可以选择记录新密码，以便在后续测试中使用
            console.log(`密码已更新为: ${newPassword}`);
        }
        
        // 等待跳转完成
        await this.page.waitForURL(/overview/);
    }
    
}
module.exports = LoginPage;
