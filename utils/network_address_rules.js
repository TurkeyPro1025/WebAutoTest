// 范围包括精度
export const validateValRange = (val, { min, max, precision = 1 }) => {
    if (val === "" || val == undefined) {
        return false;
    }
    // 1.00E+08 error
    if (/[e\s]|([.]$)|^[.]/i.test(val.toString())) {
        return false;
    }
    const newVal = val === "" ? undefined : Number(val);
    if (!isNaN(newVal)) {
        if (typeof newVal === "number" && newVal <= max && newVal >= min) {
            const stepPrecision = getPrecision(precision);
            const _precision = getPrecision(val);
            if (_precision > stepPrecision) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }

    function getPrecision(value) {
        if (value === undefined) return 0;
        const valueString = value.toString();
        const dotPosition = valueString.indexOf(".");
        let precision = 0;
        if (dotPosition !== -1) {
            precision = valueString.length - dotPosition - 1;
        }
        return precision;
    }
};
export function createErrorRangeInfo(title, { min, max, unit }) {
    return `${title} values must be between ${min} - ${max} ${unit || ""}`;
}

export function isIp4addr(ip) {
    const reg = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return reg.test(ip);
}

/**
 * checkLanSettings
 * @description:
 * @param ip {string}
 * @param mask {string}
 * @param gateway {string}
 * @returns {{code: number, info: string}|{code: number}}
 *          code: 1  => Please enter a valid subnet mask.
 *          code: 2  => Please enter a valid IP address.
 *          code: 3  => Please enter a valid gateway.
 *          code: 4  => The IP address cannot be the same as the gateway address.
 *          code: 5  => The gateway address not at the same network(subnet), which is defined on basis of IP address and mask address.
 *          6,7: IP address or gateway address and subnet mask cannot be 255.255.255.255 when calculated by bit or, broadcast address
 *          code: 6  => Invalid IP address in the subnet
 *          code: 7  => Invalid gateway address in the subnet
 *          8,9: IP address or gateway address cannot be the same as the subnet mask when calculated by bit or
 *          code: 8,9  => Invalid IP address in the subnet
 *          code: 7  => Invalid gateway address in the subnet

 *          code: 200 => true
 */
export function checkLanSettings(ip, mask, gateway, dns) {
    if (dns && !isIp4addr(dns)) {
        return {
            code: 0,
            info: "Invalid DNS address",
        };
    }
    if (!isIp4addr(ip)) {
        return {
            code: 2,
            info: "Invalid IP address",
        };
    }
    if (!isValidIpAddress(ip)) {
        return {
            code: 2,
            info: "Invalid IP address",
        };
    }

    if (!isValidSubnetMask(mask)) {
        return {
            code: 1,
            info: "Invalid mask address",
        };
    }

    if ((gateway && !isIp4addr(gateway)) || gateway == "0.0.0.0" || !gateway) {
        return {
            code: 3,
            info: "Invalid gateway address",
        };
    }

    if (ip === gateway) {
        return {
            code: 4,
            info: "IP address and gateway address cannot be the same",
        };
    }
    if (gateway && !isSameSubnet(ip, mask, gateway)) {
        return {
            code: 5,
            info: "IP address and gateway address must be in the same subnet",
        };
    }

    if (isBroadcastIp(ip, mask)) {
        return {
            code: 6,
            info: "Invalid IP address in the subnet",
        };
    }

    if (gateway && isBroadcastIp(gateway, mask)) {
        return {
            code: 7,
            info: "Invalid gateway address in the subnet",
        };
    }

    // IP address or gateway address cannot be the same as the subnet mask when calculated by bit or
    if (!isValidIpAddressNetworkBitOr(ip, mask)) {
        return {
            code: 8,
            info: "Invalid IP address in the subnet",
        };
    }
    if (gateway && !isValidIpAddressNetworkBitOr(gateway, mask)) {
        return {
            code: 9,
            info: "Invalid gateway address in the subnet",
        };
    }

    return { code: 200 };
}

function isValidSubnetMask(subnetMask) {
    // reject 255.255.255.255, 255.255.255.254, 0.0.0.0
    if (!isIp4addr(subnetMask)) {
        return false;
    }
    if (subnetMask === "255.255.255.255" || subnetMask === "255.255.255.254" || subnetMask === "0.0.0.0") return false;
    var binarySubnetMask = subnetMask
        .split(".")
        .map(function (part) {
            return parseInt(part).toString(2).padStart(8, "0");
        })
        .join("");

    var firstZeroIndex = binarySubnetMask.indexOf("0");
    var lastOneIndex = binarySubnetMask.lastIndexOf("1");
    if (lastOneIndex === -1) return false;
    if (firstZeroIndex === -1 || lastOneIndex > firstZeroIndex) {
        return false;
    }

    return true;
}

export function isValidIpAddress(address) {
    // 0.0.0.1 �� 126.255.255.255
    // 128.0.0.0 �� 223.255.255.255
    const ipParts = address.split("/");
    if (ipParts.length > 2) return false;
    if (ipParts.length === 2) {
        const num = parseInt(ipParts[1]);
        if (num <= 0 || num > 32) {
            return false;
        }
    }
    if (ipParts[0] === "0.0.0.0" || ipParts[0] === "255.255.255.255") {
        return false;
    }

    const addrParts = ipParts[0].split(".");
    if (addrParts[0] === "127" || parseInt(addrParts[0]) > 223) {
        return false;
    }
    if (addrParts.length !== 4) return false;
    for (let i = 0; i < 4; i++) {
        if (isNaN(addrParts[i]) || addrParts[i] === "") {
            return false;
        }
        const num = parseInt(addrParts[i]);
        if (num < 0 || num > 255) {
            return false;
        }
    }
    return true;
}

export function isBroadcastIp(ipAddress, subnetMask) {
    var ipParts = ipAddress.split(".").map(Number);
    var maskParts = subnetMask.split(".").map(Number);

    // broadcast ip
    var broadcastAddressParts = [];
    for (var i = 0; i < 4; i++) {
        broadcastAddressParts.push(ipParts[i] | (~maskParts[i] & 255));
    }

    var broadcastAddress = broadcastAddressParts.join(".");
    return broadcastAddress === ipAddress;
}
function getNetworkParamsParts(ipAddr, netmask, gateway) {
    const ipCheck = ipAddr.split(".");
    const nmCheck = netmask.split(".");
    const gwCheck = gateway.split(".");

    const ipArr = [];
    const maskArr = [];
    const gatewayArr = [];

    ipArr[0] = 0xff & parseInt(ipCheck[0]);
    ipArr[1] = 0xff & parseInt(ipCheck[1]);
    ipArr[2] = 0xff & parseInt(ipCheck[2]);
    ipArr[3] = 0xff & parseInt(ipCheck[3]);

    gatewayArr[0] = 0xff & parseInt(gwCheck[0]);
    gatewayArr[1] = 0xff & parseInt(gwCheck[1]);
    gatewayArr[2] = 0xff & parseInt(gwCheck[2]);
    gatewayArr[3] = 0xff & parseInt(gwCheck[3]);

    maskArr[0] = 0xff & parseInt(nmCheck[0]);
    maskArr[1] = 0xff & parseInt(nmCheck[1]);
    maskArr[2] = 0xff & parseInt(nmCheck[2]);
    maskArr[3] = 0xff & parseInt(nmCheck[3]);
    return { ipArr, maskArr, gatewayArr };
}
function isSameSubnet(ipAddr, netmask, gateway) {
    if (isIp4addr(ipAddr) && isIp4addr(netmask) && isIp4addr(gateway)) {
        const { ipArr, maskArr, gatewayArr } = getNetworkParamsParts(ipAddr, netmask, gateway);
        if (ipArr[3] & (~maskArr[3] === 0) || ipArr[3] & (~maskArr[3] === 255)) {
            return false;
        }
        if (
            !(
                (ipArr[0] & maskArr[0]) === (gatewayArr[0] & maskArr[0]) &&
                (ipArr[1] & maskArr[1]) === (gatewayArr[1] & maskArr[1]) &&
                (ipArr[2] & maskArr[2]) === (gatewayArr[2] & maskArr[2]) &&
                (ipArr[3] & maskArr[3]) === (gatewayArr[3] & maskArr[3])
            )
        ) {
            if (gateway === "0.0.0.0") {
                return true;
            }

            // console.error('Default gateway is not at the same network(subnet), which is defined on basis of IP address and subnet mask.')
            return false;
        }
        return true;
    } else {
        // console.error('Please input correctly!')
        return false;
    }
}

// IP address or gateway address cannot be the same as the subnet mask when calculated by bit or
function isValidIpAddressNetworkBitOr(ipAddrOrGateway, netmask) {
    const { ipArr, maskArr } = getNetworkParamsParts(ipAddrOrGateway, netmask, "0.0.0.0");
    const ipBitOr = [ipArr[0] | maskArr[0], ipArr[1] | maskArr[1], ipArr[2] | maskArr[2], ipArr[3] | maskArr[3]];
    if (ipBitOr.join(".") === maskArr.join(".")) {
        return false;
    }
    return true;
}
