"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNameOnCard = void 0;
const validateNameOnCard = (name) => {
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(name) && name.trim().length > 0;
};
exports.validateNameOnCard = validateNameOnCard;
