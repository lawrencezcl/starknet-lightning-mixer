"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
exports.formatTimestamp = formatTimestamp;
exports.parseTimestamp = parseTimestamp;
exports.sleep = sleep;
exports.retry = retry;
exports.isValidAddress = isValidAddress;
exports.isValidStarknetAddress = isValidStarknetAddress;
exports.formatAddress = formatAddress;
exports.formatAmount = formatAmount;
exports.calculatePercentage = calculatePercentage;
exports.clamp = clamp;
exports.randomBetween = randomBetween;
exports.isValidNumber = isValidNumber;
exports.formatDuration = formatDuration;
exports.formatDurationSeconds = formatDurationSeconds;
exports.delay = delay;
exports.deepClone = deepClone;
exports.removeUndefined = removeUndefined;
exports.isValidJSON = isValidJSON;
exports.safeParseJSON = safeParseJSON;
exports.safeStringifyJSON = safeStringifyJSON;
exports.randomHex = randomHex;
exports.hexToBuffer = hexToBuffer;
exports.bufferToHex = bufferToHex;
exports.sha256 = sha256;
exports.generateUUID = generateUUID;
exports.isPromise = isPromise;
exports.isEmpty = isEmpty;
exports.debounce = debounce;
exports.throttle = throttle;
function generateId(prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}
function formatTimestamp(timestamp) {
    return new Date(timestamp).toISOString();
}
function parseTimestamp(timestamp) {
    return new Date(timestamp).getTime();
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                break;
            }
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }
    throw lastError;
}
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}
function isValidStarknetAddress(address) {
    return /^0x[a-fA-F0-9]{64}$/.test(address);
}
function formatAddress(address, length = 6) {
    if (!address)
        return '';
    return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}
function formatAmount(amount, decimals = 6) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num))
        return '0';
    return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    });
}
function calculatePercentage(value, total) {
    if (total === 0)
        return 0;
    return (value / total) * 100;
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    }
    else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else {
        return `${seconds}s`;
    }
}
function formatDurationSeconds(seconds) {
    return formatDuration(seconds * 1000);
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}
function removeUndefined(obj) {
    const result = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            result[key] = obj[key];
        }
    }
    return result;
}
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    }
    catch {
        return false;
    }
}
function safeParseJSON(str, fallback) {
    try {
        return JSON.parse(str);
    }
    catch {
        return fallback;
    }
}
function safeStringifyJSON(obj) {
    try {
        return JSON.stringify(obj);
    }
    catch {
        return '{}';
    }
}
function randomHex(length = 32) {
    const bytes = new Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    }
    return '0x' + bytes.join('');
}
function hexToBuffer(hex) {
    const hexWithoutPrefix = hex.replace(/^0x/, '');
    return Buffer.from(hexWithoutPrefix, 'hex');
}
function bufferToHex(buffer) {
    return '0x' + buffer.toString('hex');
}
async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return '0x' + hashHex;
}
function generateUUID() {
    const hex = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return hex.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function isPromise(value) {
    return value && typeof value.then === 'function';
}
function isEmpty(value) {
    if (value == null)
        return true;
    if (typeof value === 'string')
        return value.length === 0;
    if (Array.isArray(value))
        return value.length === 0;
    if (typeof value === 'object')
        return Object.keys(value).length === 0;
    return false;
}
function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}
function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
//# sourceMappingURL=helpers.js.map