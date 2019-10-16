// exports.requireNoSignature = function requireNoSignature(req, res, next) {
//     if (req.session.signatureId) {
//         res.redirect("/thankyou");
//     } else {
//         next(); // we have to call it in every middleware function
//     }
// };

//short version of the previous one
// function requireNoSignature(req, res, next) {
//     if (req.session.signatureId) {
//         return res.redirect("/thankyou"); //the return will ensure the next(); is informed
//     }
//     next(); // we have to call it in every middleware function
// }
