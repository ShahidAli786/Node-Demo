"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware for token verification
const verifyToken = (socket, next) => {
    var _a;
    try {
        // Extract token from handshake auth or headers
        const token = ((_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token) || socket.handshake.headers["authorization"];
        if (!token) {
            return next(new Error("Authentication error: Token missing"));
        }
        // Verify the token
        jsonwebtoken_1.default.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                return next(new Error("Authentication error: Invalid token"));
            }
            // Attach decoded user information to socket
            socket.user = decoded;
            next();
        });
    }
    catch (error) {
        next(new Error("Authentication error"));
    }
};
exports.verifyToken = verifyToken;
