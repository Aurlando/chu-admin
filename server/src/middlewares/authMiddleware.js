const jwt = require("jsonwebtoken");

function parseBearerToken(authHeader) {
    if (typeof authHeader !== "string") {
        return null;
    }

    const [scheme, token] = authHeader.trim().split(" ");
    if (!scheme || !token) {
        return null;
    }

    if (scheme.toLowerCase() !== "bearer") {
        return null;
    }

    return token.trim();
}

function verifyToken(req, res, next) {
    const authHeader =
        req.headers["authorization"] || req.headers["Authorization"];
    const token = parseBearerToken(authHeader);

    if (!token) {
        return res.status(401).json({ message: "Token manquant ou malformé" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expiré" });
        }

        return res.status(403).json({ message: "Token invalide" });
    }
}

function requireRole(...roles) {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(401).json({ message: "Token manquant" });
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Accès refusé" });
        }

        next();
    };
}

const authorizeRoles = requireRole;

function optionalAuth(req, res, next) {
    const authHeader =
        req.headers["authorization"] || req.headers["Authorization"];
    const token = parseBearerToken(authHeader);

    if (!token) {
        return next();
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return next();
    }

    next();
}

module.exports = {
    verifyToken,
    requireRole,
    authorizeRoles,
    optionalAuth,
};
