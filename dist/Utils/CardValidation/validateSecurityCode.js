"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSecurityCode = void 0;
const validateSecurityCode = (code) => {
    const regex = /^[0-9]{3,4}$/;
    return regex.test(code);
};
exports.validateSecurityCode = validateSecurityCode;
