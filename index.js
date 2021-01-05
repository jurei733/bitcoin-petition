const express = require("express");
const exphbs = require("express-handlebars");
const db = require("./db.js");
const {
    loggedInCheck,
    loggedOutCheck,
    preventClickJacking,
    addCsrfTokenToLocals,
    addSessionToLocals,
} = require("./middlewares.js");

const csurf = require("csurf");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
    cookieSession({
        secret: "We dont like Poppy",
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    })
);

app.use(csurf());
app.use(addCsrfTokenToLocals);
app.use(addSessionToLocals);
app.use(preventClickJacking);

app.get("/", loggedInCheck, (req, res) => {
    db.getSigById(req.session.user.id).then(({ rows }) => {
        if (rows.length === 1) return res.redirect("/thankyou");
        res.render("home");
    });
});

app.get("/register", loggedOutCheck, (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    if (
        req.body.firstname &&
        req.body.lastname &&
        req.body.email &&
        req.body.password
    ) {
        bcrypt.hash(req.body.password, 10).then((hash) => {
            db.login(req.body.email).then((data) => {
                if (data.rows.length === 1)
                    return res.render("register", { errorDoubleEmail: true });
                db.countSigs().then((value) => {
                    console.log(value);
                    req.session.user = { count: value.rows[0].count };
                    db.addUser(
                        req.body.firstname,
                        req.body.lastname,
                        req.body.email,
                        hash
                    ).then((data) => {
                        req.session.user.id = data.rows[0].id;

                        req.session.user.firstname = data.rows[0].firstname;

                        res.redirect("/profile");
                    });
                });
            });
        });
    } else {
        res.render("register", {
            error: true,
        });
    }
});

app.get("/login", loggedOutCheck, (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    db.login(req.body.username).then((data) => {
        if (data.rows.length === 0) return res.render("login", { error: true });
        if (data.rows.length === 1) {
            req.session.user = {
                id: data.rows[0].id,
                firstname: data.rows[0].firstname,
            };
            console.log(req.session.user.id);
            bcrypt
                .compare(req.body.password, data.rows[0].password)
                .then((match) => {
                    if (match) {
                        db.countSigs().then((value) => {
                            req.session.user.count = value.rows[0].count;
                            console.log(req.session.user.id);
                            console.log(data.rows[0].id);
                            db.getSigById(data.rows[0].id).then((data) => {
                                console.log(data.rows[0]);
                                if (data.rows.length === 1) {
                                    res.redirect("/thankyou");
                                } else {
                                    res.redirect("/");
                                }
                            });
                        });
                    } else {
                        res.render("login", { error: true });
                    }
                });
        }
    });
});

app.get("/profile", loggedInCheck, (req, res) => {
    res.render("profile", { cannotEdit: true });
    db.addUserData(null, "", "", req.session.user.id);
});

app.post("/profile", loggedInCheck, (req, res) => {
    if (req.body.homepage) {
        if (!req.body.homepage.startsWith("http")) {
            res.render("profile", { error: true });
        }
    }

    db.updateOptionalUserData(
        req.body.age,
        req.body.city,
        req.body.homepage,
        req.session.user.id
    ).then(() => {
        res.redirect("/");
    });
});

app.get("/profile/edit", loggedInCheck, (req, res) => {
    console.log(req.session.user.firstname);
    console.log(req.session.user.id);
    db.getUserData(req.session.user.id, true).then((data) => {
        console.log(data);
        res.render("edit", {
            firstname: data.rows[0].firstname,
            lastname: data.rows[0].lastname,
            email: data.rows[0].email,
            age: data.rows[0].age,
            city: data.rows[0].city,
            homepage: data.rows[0].homepage,
        });
    });
});

app.post("/profile/edit", loggedInCheck, (req, res) => {
    return Promise.all([
        db.updateUserData(
            req.body.firstname,
            req.body.lastname,
            req.body.email,
            req.session.user.id
        ),
        req.body.password
            ? bcrypt.hash(req.body.password, 10).then((hash) => {
                  return db.updatePassword(hash, req.session.user.id);
              })
            : "",
        db.updateOptionalUserData(
            req.body.age,
            req.body.city,
            req.body.homepage,
            req.session.user.id
        ),
    ]).then(() => {
        res.redirect("/thankyou");
    });
});

app.get("/sign-petition", loggedInCheck, (req, res) => {
    res.redirect("/thankyou");
});

app.post("/sign-petition", loggedInCheck, (req, res) => {
    if (req.body.signature)
        return db
            .addSignature(req.session.user.id, req.body.signature)
            .then(() => {
                req.session.user.count++;
                res.redirect("/thankyou");
            });

    res.redirect("/thankyou");
});

app.get("/thankyou", loggedInCheck, (req, res) => {
    console.log(req.session.user.id);
    db.getSigById(req.session.user.id).then(({ rows }) => {
        if (rows.length !== 1) return res.redirect("/");
        res.render("home", {
            signature: rows[0].signature,
        });
    });
});

app.post("/signature/delete", loggedInCheck, (req, res) => {
    db.deleteSig(req.session.user.id).then(() => {
        req.session.user.count--;
        res.redirect("/thankyou");
    });
});

app.get("/signers", loggedInCheck, (req, res) => {
    db.getSigById(req.session.user.id).then(({ rows }) => {
        if (rows.length === 0) {
            res.redirect("/");
        } else {
            db.getSigners().then((data) => {
                res.render("signers", {
                    signatures: data.rows,
                });
            });
        }
    });
});

app.get("/signers/:city", loggedInCheck, (req, res) => {
    const city = req.params.city;
    db.getSigners(city).then((data) => {
        res.render("signers", { signatures: data.rows });
    });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () => {
        console.log("PETITION IS LISTENING...");
    });
}

module.exports = app;
