const allowSelfOrRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Utilisateur non authentifié",
            });
        }

        const requestedUserId = req.params.usr_id;

        const isAllowedRole = allowedRoles.includes(req.user.usr_role);

        const isSelf = req.user.usr_id === requestedUserId;

        if (!isAllowedRole && !isSelf) {
            return res.status(403).json({
                success: false,
                message: "Accès refusé",
            });
        }

        next();
    };
};

export default allowSelfOrRoles;