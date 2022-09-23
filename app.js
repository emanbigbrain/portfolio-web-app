const dummyData = require("./dummy-data");
const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const sqlite3 = require("sqlite3");

const ADMIN_USERNAME = "Emmanuel";
const ADMIN_PASSWORD = "mypassword";

const app = express();

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);

app.use(express.static("./public"));

app.use(
  expressSession({
    saveUnitialized: false,
    resave: false,
    secret: "jkjjoijiji",
  })
);

app.get("/", function (request, response) {
  response.render("homepage.hbs");
});

app.get("/about", function (request, response) {
  response.render("about.hbs");
});

app.get("/contact", function (request, response) {
  response.render("contact.hbs");
});

app.get("/projects-users", function (request, response) {
  const model = {
    projects: dummyData.projects,
  };
  response.render("projects-users.hbs", model);
});

app.get("/blog-users", function (request, response) {
  const model = {
    projects: dummyData.blog,
  };
  response.render("blog-users.hbs");
});

app.get("/login", function (request, response) {
  response.render("login.hbs");
});

let isLoggedIn = false;

app.post("/login", function (request, response) {
  const username = request.body.username;
  const password = request.body.password;

  if (username == ADMIN_USERNAME && password == ADMIN_PASSWORD) {
    request.session.isLoggedIn = true;
    response.redirect("/");
  } else {
    const model = {
      failedToLogin: true,
    };

    response.render("login.hbs", model);
  }
});

app.listen(8080);
