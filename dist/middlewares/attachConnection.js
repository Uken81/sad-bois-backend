"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachConnection = void 0;
const server_1 = require("../server");
const attachConnection = async (req, res, next) => {
    console.log('*****attaching connection*****');
    try {
        const connection = await (0, server_1.waitForConnection)();
        if (!connection) {
            throw new Error('Failed to get database connection');
        }
        req.dbConnection = connection;
        next();
    }
    catch (error) {
        console.error('Failed to get database connection:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.attachConnection = attachConnection;
