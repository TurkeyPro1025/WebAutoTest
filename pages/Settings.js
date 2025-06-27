/**
 * 设置页面对象模型
 * 职责：
 * 1. 封装设置页面元素定位器
 * 2. 提供网络配置相关的测试方法
 * 3. 实现页面操作和断言的封装
 * 4. 支持DHCP和静态IP两种网络配置模式的测试
 * 5. 提供测试结果的截图和报告功能
 */
const { checkResultAndScreenshot } = require('../utils/util');
class SettingsPage {
    constructor(page, allure) {
        this.page = page;
        this.allure = allure;
        this.collapse = page.locator("#general-collapse");
        this.password = page.locator("#dataTest-password");
        this.submitButton = page.locator("#dataTest-login-btn");

        this.screenshot = label => checkResultAndScreenshot(this.page, this.allure, label, "Settings");
    }

    async testNetworkSettings(expect) {
        await this.collapse.click();
        await this.page.waitForTimeout(1000);
        // 检测各部分是否不为空
        const staticRadio = this.page.locator("#dataTest-static");
        const dhcpRadio = this.page.locator("#dataTest-dhcp");
        const ipaddress = this.page.locator("#dataTest-ipaddress");
        const subnet = this.page.locator("#dataTest-subnet");
        const gateway = this.page.locator("#dataTest-gateway");
        const dns = this.page.locator("#dataTest-dns");
        const applyButton = this.page.locator("#dataTest-network-apply");

        // 测试DHCP模式
        await dhcpRadio.click();
        await this.page.waitForTimeout(500);
        
        // 验证DHCP模式下IP配置项应该被禁用
        const isIpDisabled = await ipaddress.evaluate(el => el.parentElement.classList.contains('is-disabled'));
        const isSubnetDisabled = await subnet.evaluate(el => el.parentElement.classList.contains('is-disabled'));
        const isGatewayDisabled = await gateway.evaluate(el => el.parentElement.classList.contains('is-disabled'));
        const isDnsDisabled = await dns.evaluate(el => el.parentElement.classList.contains('is-disabled'));
        
        expect(isIpDisabled).toBe(true);
        expect(isSubnetDisabled).toBe(true);
        expect(isGatewayDisabled).toBe(true);
        expect(isDnsDisabled).toBe(true);
        
        // DHCP模式下点击应用按钮，验证是否有消息提示
        await applyButton.click();
        await this.screenshot("DHCP模式配置验证");

        // 测试数据集 - 包含DNS配置场景
        const networkTests = [
            {
                scenario: '常规局域网配置-谷歌DNS',
                ip: '192.168.0.1',
                subnet: '255.255.255.0',
                gateway: '192.168.0.254',
                dns: '8.8.8.8'
            },
            {
                scenario: '企业网络配置-无DNS',
                ip: '10.0.0.100',
                subnet: '255.255.0.0',
                gateway: '10.0.0.1',
                dns: ''
            },
            {
                scenario: 'B类私有网络配置-CloudflareDNS',
                ip: '172.16.0.1',
                subnet: '255.255.240.0',
                gateway: '172.16.0.254',
                dns: '1.1.1.1'
            }
        ];

        // 切换到静态IP模式进行测试
        await staticRadio.click();
        await this.page.waitForTimeout(500);

        // 测试网络配置
        for (const test of networkTests) {
            try {
                await ipaddress.fill(test.ip);
                await subnet.fill(test.subnet);
                await gateway.fill(test.gateway);
                await dns.fill(test.dns);
                await applyButton.click();
                await this.screenshot(`网络配置测试 - ${test.scenario}`);
            } catch (error) {
                await this.screenshot(`网络配置异常 - ${test.scenario}`);
                throw error;
            }
        }

        // IP地址边界测试
        const validIPs = [
            '0.0.0.0',
            '255.255.255.255',
            '192.168.0.1',
            '127.0.0.1'
        ];

        for (const ip of validIPs) {
            try {
                await ipaddress.fill(ip);
                await subnet.fill('255.255.255.0');
                await gateway.fill('192.168.0.1');
                await dns.fill(''); // 边界测试使用空DNS
                await applyButton.click();
                await this.screenshot(`IP边界值测试 - ${ip}`);
            } catch (error) {
                await this.screenshot(`IP边界值异常 - ${ip}`);
                throw error;
            }
        }
    }
}
module.exports = SettingsPage;
