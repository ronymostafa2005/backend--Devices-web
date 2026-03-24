import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
//---------------------------------------------------------
const signToken = (userId) =>
    jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const toPublicUser = (doc) => ({
    id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
});

const validationMessage = (err) => {
    if (err?.name === "ValidationError" && err.errors) {
        const first = Object.values(err.errors)[0];
        return first?.message || "Invalid input";
    }
    return null;
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }
        if (password.length > 256) {
            return res.status(400).json({
                success: false,
                message: "Password must be at most 256 characters",
            });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });

        return res.status(201).json({
            success: true,
            message: "Registered successfully",
            data: {
                user: toPublicUser(user),
                token: signToken(user._id.toString()),
            },
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already in use",
            });
        }
        const vMsg = validationMessage(err);
        if (vMsg) {
            return res.status(400).json({
                success: false,
                message: vMsg,
            });
        }
        console.error("register error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Logged in",
            data: {
                user: toPublicUser(user),
                token: signToken(user._id.toString()),
            },
        });
    } catch (err) {
        const vMsg = validationMessage(err);
        if (vMsg) {
            return res.status(400).json({
                success: false,
                message: vMsg,
            });
        }
        console.error("login error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: { user: toPublicUser(user) },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};
