module.exports.loggedInCheck = (req, res, next) => {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        next();
    }
};
module.exports.loggedOutCheck = (req, res, next) => {
    if (req.session.user) {
        res.redirect("/");
    } else {
        next();
    }
};

module.exports.preventClickJacking = (req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
};

module.exports.addCsrfTokenToLocals = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();

    next();
};

module.exports.addSessionToLocals = (req, res, next) => {
    res.locals.session = req.session;
    next();
};
