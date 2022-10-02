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

app.get("/projects-users/:id", function (request, response) {
  const id = request.params.id;

  const project = dummyData.projects.find((h) => h.id == id);

  const model = {
    project: project,
  };

  response.render("project.hbs", model);
});

app.get("/blog-users", function (request, response) {
  const model = {
    blog: dummyData.blog,
  };
  response.render("blog-users.hbs", model);
});

app.get("/blog-users/:id", function (request, response) {
  const id = request.params.id;

  const blogpost = dummyData.blog.find((m) => m.id == id);

  const model = {
    blogpost: blogpost,
  };

  response.render("blogpost.hbs", model);
});

app.get("/guestbook", function (request, response) {
  const model = {
    guestbook: dummyData.guestbook,
  };
  response.render("guestbook.hbs", model);
});

app.get("/guestbook-form", function (request, response) {
  response.render("guestbook-form.hbs");
});

app.get("/blogpost-form", function (request, response) {
  response.render("blogpost-form.hbs");
});

app.get("/projects-form", function (request, response) {
  response.render("projects-form.hbs");
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
