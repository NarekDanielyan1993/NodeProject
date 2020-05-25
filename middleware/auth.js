module.exports = (req, res, next) => {
    if(!req.session.isLOggedIn) {
        return res.redirect("/login")
    }
    next();
}