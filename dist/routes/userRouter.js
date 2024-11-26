"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        image: req.body.image || "https://fakeimg.pl/80x80",
    };
    const registeredUser = yield (0, userController_1.registerUser)(userData);
    if (registeredUser.error) {
        return res.status(400).json({
            error: registeredUser.error,
        });
    }
    return res.status(201).json(registeredUser);
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = {
        email: req.body.email,
        password: req.body.password,
    };
    const loggedInUser = yield (0, userController_1.loginUser)(userData);
    if (loggedInUser === null || loggedInUser === void 0 ? void 0 : loggedInUser.error) {
        return res.status(400).json({
            error: loggedInUser.error,
        });
    }
    return res.status(200).json(loggedInUser);
}));
// Fetch logged in user
router.get("/me", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json({
        user: req.user,
    });
}));
// Fetch other users list accept logged in user add pagination
router.get("/users", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // return total pages
    const total = yield User_1.default.countDocuments({ _id: { $ne: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id } });
    const totalPages = Math.ceil(total / limit);
    const users = yield User_1.default.find({ _id: { $ne: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id } })
        .skip(skip)
        .limit(limit);
    return res.status(200).json({
        users,
        totalPages,
    });
}));
// Logout user
router.post("/logout", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        yield req.user.save();
    }
    return res.status(200).json({
        message: "User logged out successfully.",
    });
}));
// Logout user from all devices
router.post("/logoutall", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        req.user.tokens = [];
        yield req.user.save();
    }
    return res.status(200).json({
        message: "User logged out from all devices successfully.",
    });
}));
exports.default = router;
