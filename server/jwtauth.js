import jwt from "jsonwebtoken";

const JWTSECRET = 'JWTSECRET';

const verifyJwt = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({'message': 'Unauthenticated'});

    try {
        const decoded = jwt.verify(token, JWTSECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({'message': 'Unauthorized'});
    }
}

export { verifyJwt };