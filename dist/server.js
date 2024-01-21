"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForConnection = void 0;
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const mysql2_1 = require("mysql2");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = require("dotenv");
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const news_1 = __importDefault(require("./routes/news"));
const tour_1 = __importDefault(require("./routes/tour"));
const process_order_1 = __importDefault(require("./routes/process-order"));
const orders_1 = __importDefault(require("./routes/orders"));
const util_1 = require("util");
(0, dotenv_1.config)();
let connection = null;
let connectionReady = false;
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};
const app = (0, express_1.default)();
app.use((0, cors_1.default)(corsOptions));
app.use((0, express_1.json)());
app.use((0, cookie_parser_1.default)());
//Allows x-www-form-urlencoded data from Postman to be parsed
app.use((0, express_1.urlencoded)({ extended: true }));
const initialiseDatabase = async () => {
    console.log('*****Initialising database*****');
    try {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL is not set in the environment variables');
        }
        const databaseConnection = (0, mysql2_1.createConnection)(databaseUrl);
        const connectAsync = (0, util_1.promisify)(databaseConnection.connect).bind(databaseConnection);
        await connectAsync();
        console.log('MYSQL connected....');
        return databaseConnection;
    }
    catch (error) {
        console.error('Error initialising database:', error);
        return null;
        //Todo: Maybe do a retry process. Research how to implement an exit process so backend doesnt crash.
    }
};
const startServer = async () => {
    console.log('*****starting server*****');
    try {
        const dbConnection = await initialiseDatabase();
        if (!dbConnection) {
            throw new Error('Error initialising database');
        }
        connection = dbConnection;
        connectionReady = true;
        app.use('/auth', auth_1.default);
        app.use('/products', products_1.default);
        app.use('/news', news_1.default);
        app.use('/tour', tour_1.default);
        app.use('/process-order', process_order_1.default);
        app.use('/orders', orders_1.default);
        // app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        //   if (!err) {
        //     return next();
        // }
        //   console.log(err);
        //   res.status(500).json({ error: `Internal server error: ${err}` });
        // })
        app.listen(2001, () => {
            console.log('server running');
        });
    }
    catch (error) {
        console.error('Failed to start the server:', error);
    }
};
startServer();
const waitForConnection = async () => {
    while (!connectionReady) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    //TODO: Set Rejection after a certain number of tries
    return connection;
};
exports.waitForConnection = waitForConnection;
