// const supertest = require("supertest");
// const { app } = require("./index");
//
// //We are requiring the cookie-session MOCK, not the NPM package cookie-session!!!
// const cookieSession = require("cookie-session");
//
// test("GET/welcome, when fakeCookieForDemo is sent, receives p tag as response", () => {
//     cookieSession.mockSessionOnce({
//         // what value i put here is gonna be attached to the cookies in index.js to the req.session. so here we're send a cookie "fakeCookieForDemo" will be attacahed to req.session . Meaning in Index.js req.session.fakeCookieForDemo will be true
//         fakeCookieForDemo: true
//     });
//     return supertest(app)
//         .get("/welcome")
//         .then(res => {
//             // console.log("res:", res);  // i must receive a response object after i check it on the console
//             expect(res.statusCode).toBe(200);
//             expect(res.text).toBe("<p>wow you have a cookie!</p>");
//         });
// }); // where test() ends
//
// test("GET/home returns 200 status code", () => {
//     return supertest(app)
//         .get("/home")
//         .then(res => {
//             expect(res.statusCode).toBe(200);
//             // it will run when the server will get a response
//             // console.log("res:", res);
//         });
// });
//
// test("GET/welcome causes redirect", () => {
//     return supertest(app)
//         .get("/welcome")
//         .then(res => {
//             expect(res.statusCode).toBe(302); // 302 is the status code that i want to have
//             // console.log("res:", res);
//             expect(res.headers.location).toBe("/home");
//         });
// });
