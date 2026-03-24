import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    const header = req.headers.authorization;
    const token =
        header?.startsWith("Bearer ") ? header.slice(7).trim() : null;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized — no token",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Unauthorized — invalid or expired token",
        });
    }
};
