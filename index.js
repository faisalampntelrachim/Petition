const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./utils/db.js");
const bc = require("./utils/bc");
const { hash, compare } = require("./utils/bc");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
// const { requireNoSignature } = require("./middleware");
// const profileRouter = require("./ profile-routes");
// bc.hash("12345");

// app.locals.helpers = {};
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.setHeader("X-Frame-Options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    console.log("The route is: ", req.url);
    next();
});

app.use(express.static("./public"));

app.get("/", function(req, res) {
    res.redirect("/register");
}); //redirect route

app.get("/register", function(req, res) {
    // console.log(req.session);
    res.render("register", {
        layout: "main"
    });
});
app.post("/register", (req, res) => {
    console.log(" you registered to the route");
    console.log("body in the registered form: ", req.body);
    if (req.body.password == "") {
        res.render("register", {
            layout: "main",
            error: "error"
        });
    } else {
        hash(req.body.password)
            .then(hash => {
                console.log("hashed text is: ", hash);
                db.addDetails(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hash
                )
                    .then(id => {
                        console.log("signer's id  is: ", id);
                        req.session.userId = id;
                        // req.session.loggedIn = true;
                        console.log("log in: ", req.session.loggedIn);
                        res.redirect("/profile");
                    })
                    .catch(err => {
                        console.log(" The error in post register is:", err);
                        res.render("register", {
                            error: "error",
                            layout: "main"
                        });
                    });
            })
            .catch(e => console.log(e));
    }
});

app.get("/profile", (req, res) => {
    res.render("profile");
    // res.redirect("petition");
});

// app.post("/profile", (req, res) => {
//     console.log(" your profile is:");
//     db.addUsersprofile(req.body.age, req.body.city, req.body.website)
//     .then(id => {
//         if (id) => {
//             console.log("The profile is:", id);
//             req.session.userID;
//             res.redirect("/petition");
//         })
//     }
//             .catch(err => {
//                 console.log("error:", err);
//                 res.render("register", {
//                     error: "error",
//                     layout: "main"
//                 });
// });
app.post("/profile", (req, res) => {
    console.log(req.body);
    let requrl;
    if (
        !req.body.url.startsWith("http://") ||
        !req.body.url.startsWith("https://")
    ) {
        requrl = "http://" + req.body.url;
    }
    if (requrl == "https://" || requrl == "http://") {
        requrl = null;
    }
    console.log("The req.body is", req.body);
    console.log("The req.session is", req.session);
    db.addUsersprofile(
        req.body.age,
        req.body.city,
        req.body.url,
        req.session.userId
    )
        .then(id => {
            console.log("The profile is:", id);
            req.session.userId;
            res.redirect("/petition");
        })
        .catch(err => {
            console.log("The error is in post profile", err);
            res.render("petition", {
                error: err
            });
        });
});

app.get("/login", function(req, res) {
    res.render("login", {
        layout: "main"
    });
});

// app.post("/register", (req, res) => {
//     //let's look at the hash function
//     //would look probably like req.body.password
//     console.log("body in reg form: ", req.body);
//     hash(req.body.password)
//         .then(hash => {
//             console.log("hash:", hash);
//             // let's look at compare
//             compare("123", hash) /// when i log in
//                 .then(match => {
//                     console.log("I did my password match?"); // it shows on the console true or false
//                     console.log(match);
//                 })
//                 .catch(e => console.log(e));
//         })
//         .catch(e => console.log(e));
//     res.redirect("/login");
//     // res.redirect("/petition")
// });
app.post("/login", (req, res) => {
    db.getHashedpassword(req.body.email)
        .then(result => {
            compare(req.body.password, result[0].password)
                .then(match => {
                    if (match) {
                        req.session.userId = result[0].id;
                        db.getSignature(result[0].id)
                            .then(sig => {
                                console.log("The sig in post login is:", sig);
                                req.session.signatureId = sig.rows[0].user_id; //should be [0].id?
                                res.redirect("/thankyou");
                            })
                            .catch(err => {
                                console.log(err);
                                res.redirect("/petition");
                            });
                        req.session.loggedIn = true;
                    } else {
                        res.render("login", {
                            error1: "error",
                            layout: "main"
                        });
                    }

                    console.log(match);
                })
                .catch(e => {
                    console.log(e);
                    res.render("login", {
                        error: "error",
                        layout: "main"
                    });
                });
        })
        .catch(e => {
            console.log("The error in login post", e);
            res.render("login", {
                error: "error",
                layout: "main"
            });
        });
});

app.get("/profile/edit", (req, res) => {
    console.log("The userId cookie is:", req.session.userId);
    db.getProfileEdit(req.session.userId)
        .then(result => {
            console.log("The result from get profile/edit is  :", result);
            res.render("edit", {
                layout: "main",
                first: result[0].first,
                last: result[0].last,
                email: result[0].email,
                age: result[0].age,
                city: result[0].city,
                url: result[0].url
            });
        })
        .catch(e => console.log("error to the profile edit", e));
});

app.post("/profile/edit", (req, res) => {
    // res.redirect("thankyou");
    let requrl = req.body.url;
    let requrl1;
    if (requrl === "") {
        requrl1 = requrl;
    } else {
        if (requrl.startsWith("https://") || requrl.startsWith("http://")) {
            requrl1 = requrl;
        } else {
            requrl = "http://" + requrl;
            requrl1 = requrl;
        }
    }

    if (req.body.age == "") {
        req.body.age = null;
    }
    if (!req.body.password) {
        Promise.all([
            db.updateDetails(
                req.session.userId,
                req.body.first,
                req.body.last,
                req.body.email
            ),
            db.updateUsersProfile(
                req.session.userId,
                req.body.age,
                req.body.city,
                requrl1
            )
        ])
            .then(() => {
                res.redirect("/thankyou"); // or maybe to the /petition
            })
            .catch(error => {
                console.log("Email failed: ", error);
                db.getSigners(req.session.userId).then(result => {
                    console.log(result);
                    res.render("edit", {
                        first: result[0].first,
                        last: result[0].last,
                        email: result[0].email,
                        age: result[0].age,
                        city: result[0].city,
                        url: result[0].url,
                        error: "error",
                        layout: "main"
                    });
                });
            });
    } else {
        hash(req.body.password).then(hash => {
            Promise.all([
                db.updateUserPassword(
                    req.session.userId,
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hash
                ),
                db.updateUsersProfile(
                    req.session.userId,
                    req.body.age,
                    req.body.city,
                    requrl1
                )
            ])
                .then(() => {
                    res.redirect("/thankyou"); // or maybe to the /petition
                })
                .catch(error => {
                    console.log("Email failed: ", error);
                    db.deleteSignature(req.session.userId).then(result => {
                        //or getProfileEdit
                        console.log(result);
                        res.render("edit", {
                            first: result[0].first,
                            last: result[0].last,
                            email: result[0].email,
                            age: result[0].age,
                            city: result[0].city,
                            url: result[0].url,
                            error: "error",
                            layout: "main"
                        });
                    });
                });
        });
    }
});

// app.get("/login", (req, res) => {
//     res.render("login", {
//         layout: "main"
//     });
// });
//
app.get("/petition", (req, res) => {
    // console.log("i made it to the slash route");
    res.render("petition", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    // console.log("the first name is:", req.body.first);
    // console.log("The last name is :", req.body.last);
    // console.log("The signature is:", req.body.sig);
    console.log(req.session);
    db.addSignature(req.body.sig, req.session.userId)
        .then(id => {
            console.log("output", id);
            req.session.signatureId = id;
            res.redirect("/thankyou");
        })
        .catch(err => {
            console.log("error", err);
            res.render("petition", {
                error: err
            });
        });
});

app.get("/thankyou", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/petition");
    }
    db.getSignature(req.session.userId)
        .then(signature => {
            console.log("the sig is:", signature);
            console.log(signature.rows[0].signatures);
            res.render("thankyou", {
                signature: signature.rows[0].signatures,
                layout: "main"
            });
        })
        .catch(err => {
            console.log("error for signature: ", err);
            res.redirect("/petition");
        });
});

app.post("/thankyou", (req, res) => {
    // console.log("Something", req.session.signatureId);
    db.deleteSignature(req.session.userId).catch(err => {
        console.log("This err deleting the picture:", err);
        req.session.signatureId = null;
    });
    res.redirect("/petition");
});

app.get("/signers", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/petition");
    } else {
        db.getSigners()
            .then(results => {
                console.log(results);
                results.map(result => {
                    return {
                        first: result.first,
                        last: result.last
                    };
                });
                return results;
            })
            .then(signers => {
                console.log(signers);
                res.render("signers", {
                    signers: signers,
                    layout: "main"
                    // first: signers.first,
                    // last: signers.last
                });
            })
            .catch(error => {
                console.log(error);
            });
    }
});

app.get("/signers/:city", (req, res) => {
    // here the city is param
    if (!req.session.signatureId) {
        // if they haven't signed
        res.redirect("/petition");
    } else {
        db.getSignersByCity(req.params.city).then(cities => {
            console.log(cities);
            res.render("city", {
                layout: "main",
                signers: cities,
                city: req.params.city
            });
        });
        // .then(signerscities => {
        //     res.render("city", {
        //         layout: "main",
        //         signers: signerscities,
        //         first: signerscities.first,
        //         last: signerscities.last,
        //         age: signerscities.age,
        //         url: signerscities.url,
        //         city: req.params.city
        //     });
        // });
    }
});
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/register");
});

app.listen(process.env.PORT || 8080, () => console.log(`I'm listening.`));
