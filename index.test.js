const supertest = require("supertest");
const cookieSession = require("cookie-session");
const db = require("./db.js");
jest.mock("./db.js");
const app = require("./index.js");

test("Users who are logged out are redirected to the registration page when they attempt to go to the petition page", () => {
    /*cookieSession.mockSessionOnce({
        id: 12,
    });*/

    return supertest(app)
        .get("/")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/register");
        });
});

test("Users who are logged in are redirected to the petition page when they attempt to go to login page", () => {
    cookieSession.mockSessionOnce({
        user: 12,
    });

    return supertest(app)
        .get("/login")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/thankyou");
        });
});

test("Users who are logged in are redirected to the petition page when they attempt to go  registration page ", () => {
    cookieSession.mockSessionOnce({
        user: 12,
    });

    return supertest(app)
        .get("/register")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/thankyou");
        });
});

test("Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to the petition page", () => {
    cookieSession.mockSessionOnce({
        user: 12,
    });

    db.getSigById.mockResolvedValue({
        rows: [{}],
    });

    return supertest(app)
        .get("/")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/thankyou");
        });
});

test("Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to submit a signature", () => {
    cookieSession.mockSessionOnce({
        user: 12,
    });

    db.addSignature.mockResolvedValue({
        rows: [{}],
    });

    return supertest(app)
        .post("/sign-petition")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/thankyou");
        });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to the thank you page", () => {
    cookieSession.mockSessionOnce({
        user: 12,
    });

    db.getSigById.mockResolvedValue({
        rows: [],
    });

    return supertest(app)
        .get("/thankyou")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/");
        });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to the signers page", () => {
    cookieSession.mockSessionOnce({
        user: 12,
    });

    db.getSigById.mockResolvedValue({
        rows: [],
    });

    return supertest(app)
        .get("/signers")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/");
        });
});
