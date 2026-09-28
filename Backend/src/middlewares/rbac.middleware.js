const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Utilisateur non authentifié",
            });
        }

        if (!allowedRoles.includes(req.user.usr_role)) {
            return res.status(403).json({
                success: false,
                message: "Accès refusé : rôle insuffisant",
            });
        }

        next();
    };
};

export default authorize;