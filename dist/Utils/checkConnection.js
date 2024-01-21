"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConnection = void 0;
const checkConnection = (connectionObj) => {
    console.log('*****checking connection*****');
    if (!connectionObj) {
        console.error('Failed to initialise connection');
        throw new Error('Failed to initialise connection');
    }
    return connectionObj;
};
exports.checkConnection = checkConnection;
