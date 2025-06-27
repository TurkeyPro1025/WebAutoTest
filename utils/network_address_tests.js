/**
 * 网络地址校验测试用例
 *
 * 基于src/utils/util.js中的校验规则编写
 * 包含常规测试用例和边界测试用例
 */

// 导入校验函数
import { checkLanSettings, isIp4addr, isValidIpAddress, isValidSubnetMask } from '../src/utils/network_address_rules';

// 常规有效测试用例
const validTestCases = [
    {
        scenario: "常规有效配置1",
        ip: "192.168.1.100",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 200,
    },
    {
        scenario: "常规有效配置2",
        ip: "10.0.0.10",
        mask: "255.0.0.0",
        gateway: "10.0.0.1",
        dns: "114.114.114.114",
        expectedCode: 200,
    },
    {
        scenario: "常规有效配置3",
        ip: "172.16.10.100",
        mask: "255.255.0.0",
        gateway: "172.16.0.1",
        dns: "1.1.1.1",
        expectedCode: 200,
    },
];

// IP地址边界测试用例
const ipBoundaryTestCases = [
    {
        scenario: "IP无效-格式错误",
        ip: "192.168.1",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 2,
    },
    {
        scenario: "IP无效-包含非法字符",
        ip: "192.168.1.1a",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 2,
    },
    {
        scenario: "IP无效-数值超出范围",
        ip: "192.168.1.256",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 2,
    },
    {
        scenario: "IP无效-为0.0.0.0",
        ip: "0.0.0.0",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 2,
    },
    {
        scenario: "IP无效-为255.255.255.255",
        ip: "255.255.255.255",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 2,
    },
    {
        scenario: "IP无效-首位为127",
        ip: "127.0.0.1",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 2,
    },
    {
        scenario: "IP无效-首位为224",
        ip: "224.0.0.1",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 2,
    },
];

// 子网掩码边界测试用例
const maskBoundaryTestCases = [
    {
        scenario: "掩码无效-格式错误",
        ip: "192.168.1.100",
        mask: "255.255.255",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 1,
    },
    {
        scenario: "掩码无效-为0.0.0.0",
        ip: "192.168.1.100",
        mask: "0.0.0.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 1,
    },
    {
        scenario: "掩码无效-为255.255.255.255",
        ip: "192.168.1.100",
        mask: "255.255.255.255",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 1,
    },
    {
        scenario: "掩码无效-为255.255.255.254",
        ip: "192.168.1.100",
        mask: "255.255.255.254",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 1,
    },
    {
        scenario: "掩码无效-1和0不连续",
        ip: "192.168.1.100",
        mask: "255.255.0.255",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 1,
    },
    {
        scenario: "掩码有效-边界值",
        ip: "192.168.1.100",
        mask: "128.0.0.0",
        gateway: "192.0.0.1",
        dns: "8.8.8.8",
        expectedCode: 200,
    },
];

// 网关边界测试用例
const gatewayBoundaryTestCases = [
    {
        scenario: "网关无效-格式错误",
        ip: "192.168.1.100",
        mask: "255.255.255.0",
        gateway: "192.168.1",
        dns: "8.8.8.8",
        expectedCode: 3,
    },
    {
        scenario: "网关无效-为0.0.0.0",
        ip: "192.168.1.100",
        mask: "255.255.255.0",
        gateway: "0.0.0.0",
        dns: "8.8.8.8",
        expectedCode: 3,
    },
    {
        scenario: "网关无效-与IP相同",
        ip: "192.168.1.100",
        mask: "255.255.255.0",
        gateway: "192.168.1.100",
        dns: "8.8.8.8",
        expectedCode: 4,
    },
    {
        scenario: "网关无效-不在同一子网",
        ip: "192.168.1.100",
        mask: "255.255.255.0",
        gateway: "192.168.2.1",
        dns: "8.8.8.8",
        expectedCode: 5,
    },
    {
        scenario: "网关无效-是广播地址",
        ip: "192.168.1.100",
        mask: "255.255.255.0",
        gateway: "192.168.1.255",
        dns: "8.8.8.8",
        expectedCode: 7,
    },
];

// DNS边界测试用例
const dnsBoundaryTestCases = [
    {
        scenario: "DNS无效-格式错误",
        ip: "192.168.1.100",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8",
        expectedCode: 0,
    },
    {
        scenario: "DNS无效-包含非法字符",
        ip: "192.168.1.100",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8a",
        expectedCode: 0,
    },
];

// 广播地址测试用例
const broadcastIpTestCases = [
    {
        scenario: "IP无效-是广播地址",
        ip: "192.168.1.255",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 6,
    },
    {
        scenario: "不同掩码下的广播地址测试",
        ip: "192.168.1.127",
        mask: "255.255.255.128",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 200,
    },
    {
        scenario: "IP无效-是广播地址(255.255.252.0)",
        ip: "10.0.3.255",
        mask: "255.255.252.0",
        gateway: "10.0.0.1",
        dns: "8.8.8.8",
        expectedCode: 6,
    },
];

// 按位或运算测试用例
const bitOrTestCases = [
    {
        scenario: "IP无效-与掩码按位或等于掩码",
        ip: "0.0.0.0",
        mask: "255.255.255.0",
        gateway: "192.168.1.1",
        dns: "8.8.8.8",
        expectedCode: 8,
    },
    {
        scenario: "网关无效-与掩码按位或等于掩码",
        ip: "192.168.1.100",
        mask: "255.255.255.0",
        gateway: "0.0.0.0",
        dns: "8.8.8.8",
        expectedCode: 9,
    },
];

// 组合所有测试用例
const allTestCases = [
    ...validTestCases,
    ...ipBoundaryTestCases,
    ...maskBoundaryTestCases,
    ...gatewayBoundaryTestCases,
    ...dnsBoundaryTestCases,
    ...broadcastIpTestCases,
    ...bitOrTestCases,
];

/**
 * 运行测试用例函数
 * 将此函数与checkLanSettings一起使用可执行测试
 */
function runTests() {
    console.log("开始执行网络地址校验测试...");
    let passedCount = 0;
    let failedCount = 0;

    allTestCases.forEach((testCase) => {
        const result = checkLanSettings(testCase.ip, testCase.mask, testCase.gateway, testCase.dns);
        const passed = result.code === testCase.expectedCode;

        if (passed) {
            passedCount++;
            console.log(`✅ 测试通过: ${testCase.scenario}`);
        } else {
            failedCount++;
            console.error(`❌ 测试失败: ${testCase.scenario}`);
            console.error(`  预期: ${testCase.expectedCode}, 实际: ${result.code}`);
            console.error(`  错误信息: ${result.info}`);
        }
    });

    console.log(`测试完成: 通过 ${passedCount}, 失败 ${failedCount}, 总计 ${allTestCases.length}`);
}

// 导出测试用例和运行函数
export {
    allTestCases,
    validTestCases,
    ipBoundaryTestCases,
    maskBoundaryTestCases,
    gatewayBoundaryTestCases,
    dnsBoundaryTestCases,
    broadcastIpTestCases,
    bitOrTestCases,
    runTests,
};
