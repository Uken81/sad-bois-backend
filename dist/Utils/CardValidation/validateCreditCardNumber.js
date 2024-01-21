"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreditCardNumber = void 0;
const validateCreditCardNumber = (number) => {
    const regex = new RegExp('^[0-9]{13,19}$');
    if (!regex.test(number))
        return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9)
                digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
};
exports.validateCreditCardNumber = validateCreditCardNumber;
