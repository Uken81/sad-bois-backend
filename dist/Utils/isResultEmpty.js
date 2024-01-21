"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResultEmpty = void 0;
const isResultEmpty = (results) => {
    if (!results) {
        console.error('Can not determine length of empty results.');
        return;
    }
    if (results.length === 0) {
        return true;
    }
    return false;
};
exports.isResultEmpty = isResultEmpty;
