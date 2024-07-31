module.exports = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).send('Unauthorized: No session available');
    }
};