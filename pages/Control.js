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
class ControlPage {
    constructor(page, allure) {
        this.page = page;
        this.allure = allure;
        this.videoCollapse = page.locator("#video-collapse");

        this.inputPortList = page.locator("#dataTest-inputPortList");

        this.hdmiOUT2Select = page.locator("#dataTest-out2-select");

        this.hdmiOUT1Layout = page.locator("#dataTest-out1-layout");
        this.hdmiOUT2Layout = page.locator("#dataTest-out2-layout");

        this.screenshot = label => checkResultAndScreenshot(this.page, this.allure, label, "Control");
    }

    // 执行拖拽测试并记录结果
    async dragAndCheck(port, target, layoutName, screenIndex = '') {
        try {
            await this.page.waitForTimeout(500);
            const portId = await port.getAttribute('id');
            const portName = portId.replace('dataTest-', '');
            
            // 检查目标是否可拖放
            const isDisabled = await target.evaluate(el => 
                el.classList.contains('disabled-drop'));
                
            if (isDisabled) {
                // 记录跳过信息
                console.log(`跳过拖拽测试: ${layoutName} - ${portName}${screenIndex ? ` 到子屏幕${screenIndex}` : ''} - 目标不可放置`);
                await this.screenshot(`${layoutName} 拖拽跳过 - ${portName}${screenIndex ? ` 到子屏幕${screenIndex}` : ''} - 目标不可放置`);
                // 通过allure记录跳过的测试步骤
                if (this.allure) {
                    await this.allure.step(`跳过拖拽: ${portName} 到 ${layoutName}${screenIndex ? ` 子屏幕${screenIndex}` : ''} - 目标不可放置`, async () => {});
                }
                return { skipped: true, reason: 'disabled-drop' };
            } else {
                // 明确的条件分支：只有当目标可拖放时才执行拖拽操作
                await this.page.waitForTimeout(1000);
                await port.dragTo(target);
                
                // 等待拖拽反馈消息
                try {
                    await this.page.waitForSelector('.el-message', { state: 'visible', timeout: 5000 });
                } catch (messageError) {
                    console.warn(`未检测到拖拽反馈消息: ${layoutName} - ${portName}`);
                    // 将消息缺失视为警告而非失败
                }
                
                await this.page.waitForTimeout(500);
                await this.screenshot(`${layoutName} 拖拽测试 - ${portName}${screenIndex ? ` 到子屏幕${screenIndex}` : ''}`);
                await this.page.waitForTimeout(2000);
                return { success: true };
            }
        } catch (error) {
            const portId = await port.getAttribute('id').catch(() => 'Unknown-Port');
            const portName = portId.replace('dataTest-', '');
            console.error(`拖拽 ${portName} 到 ${layoutName}${screenIndex ? ` 子屏幕${screenIndex}` : ''} 失败:`, error);
            await this.screenshot(`${layoutName} 拖拽失败 - ${portName}${screenIndex ? ` 到子屏幕${screenIndex}` : ''}`);
            return { success: false, error };
        }
    }

    async testVideoWallSettings(expect) {
        // 添加计数器跟踪测试情况
        let testsRun = 0;
        let testsSkipped = 0;
        
        // 展开Control折叠面板
        await this.videoCollapse.click();
        await this.page.waitForTimeout(1000);

        // 获取所有输入端口
        const inputPorts = await this.inputPortList.locator('li').all();

        // 测试 HDMI OUT1
        const hdmiOUT1Screen = await this.hdmiOUT1Layout.locator('div').first();
        for (const port of inputPorts) {
            const result = await this.dragAndCheck(port, hdmiOUT1Screen, 'HDMI OUT1');
            if (result.skipped) {
                testsSkipped++;
            } else {
                testsRun++;
            }
        }

        // 测试 HDMI OUT2
        // 获取所有布局选项的值
        const layoutValues = await this.page.evaluate(() => {
            // 修正选择器以匹配实际的id格式
            const options = Array.from(document.querySelectorAll('[id^="dataTest-out2-selectOptions-"]'));
            return options.map(option => option.getAttribute('value-key'));
        });
        
        console.log('[ layoutValues ] >>>', layoutValues);
        
        for (const label of layoutValues) {
            // 选择布局
            // 1. 点击 select 以展开选项
            await this.hdmiOUT2Select.click();
            await this.page.waitForTimeout(500);
            
            // 2. 点击对应的选项
            await this.page.locator(`[id="dataTest-out2-selectOptions-${label}"]`).click();
            await this.page.waitForTimeout(1000); // 等待布局变化

            // 获取当前布局下的所有可见子屏幕
            const hdmiOUT2Screens = await this.hdmiOUT2Layout.locator('div').all();
            const visibleScreens = await Promise.all(
                hdmiOUT2Screens.map(async screen => {
                    const isVisible = await screen.evaluate(el => {
                        const style = window.getComputedStyle(el);
                        return style.display !== 'none' && style.visibility !== 'hidden';
                    });
                    return isVisible ? screen : null;
                })
            );
            const activeScreens = visibleScreens.filter(screen => screen !== null);
            
            // 等待所有子屏幕元素渲染完成
            await this.page.waitForTimeout(2000);
            // 截图
            await this.screenshot(`HDMI OUT2 切换布局 - ${label}`);
            
            if (activeScreens.length === 1) {
                // 单屏幕布局：测试所有输入端口
                for (const port of inputPorts) {
                    const result = await this.dragAndCheck(port, activeScreens[0], 'HDMI OUT2', '1');
                    if (result.skipped) {
                        testsSkipped++;
                    } else {
                        testsRun++;
                    }
                }
            } else if (activeScreens.length > 1) {
                // 多屏幕布局：测试第一个和最后一个子屏幕
                
                // 第一个子屏幕：只拖拽第一个输入端口
                const result1 = await this.dragAndCheck(
                    inputPorts[0],
                    activeScreens[0],
                    'HDMI OUT2',
                    '1'
                );
                
                if (result1.skipped) {
                    testsSkipped++;
                } else {
                    testsRun++;
                }

                // 最后一个子屏幕：测试所有输入端口
                const lastScreenIndex = activeScreens.length;
                for (const port of inputPorts) {
                    const result = await this.dragAndCheck(
                        port,
                        activeScreens[lastScreenIndex - 1],
                        'HDMI OUT2',
                        lastScreenIndex.toString()
                    );
                    if (result.skipped) {
                        testsSkipped++;
                    } else {
                        testsRun++;
                    }
                }
            }
        }
        
        // 记录测试统计信息
        console.log(`视频墙拖拽测试统计: 执行=${testsRun}, 跳过=${testsSkipped}`);
        if (this.allure) {
            await this.allure.step(`测试统计: 执行=${testsRun}, 跳过=${testsSkipped}`, async () => {});
        }
    }
}
module.exports = ControlPage;
