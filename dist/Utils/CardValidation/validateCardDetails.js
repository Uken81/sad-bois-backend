"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCardDetails = void 0;
const validateCreditCardNumber_1 = require("./validateCreditCardNumber");
const validateExpirationDate_1 = require("./validateExpirationDate");
const validateNameOnCard_1 = require("./validateNameOnCard");
const validateSecurityCode_1 = require("./validateSecurityCode");
const validateCardDetails = (cardDetails) => {
    const { cardNumber, nameOnCard, expirationDate, securityCode } = cardDetails;
    if (!cardNumber || !nameOnCard || !expirationDate || !securityCode) {
        return { success: false, message: 'Missing form data' };
    }
    if (!(0, validateCreditCardNumber_1.validateCreditCardNumber)(cardNumber)) {
        return { success: false, type: 'cardNumber', message: 'Invalid card number' };
    }
    if (!(0, validateExpirationDate_1.validateExpirationDate)(expirationDate)) {
        return { success: false, type: 'cardExpiration', message: 'Invalid expiration date' };
    }
    if (!(0, validateSecurityCode_1.validateSecurityCode)(securityCode)) {
        return { success: false, type: 'cardSecurityCode', message: 'Invalid security code' };
    }
    if (!(0, validateNameOnCard_1.validateNameOnCard)(nameOnCard)) {
        return { success: false, type: 'nameOnCard', message: 'Invalid name on card' };
    }
    return { success: true };
};
exports.validateCardDetails = validateCardDetails;
