const dummyData = require("./dummy-data");
const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const bodyParser = require("body-parser");
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
  bodyParser.urlencoded({
    extended: false,
  })
);

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

app.post("/guestbook-form", function (request, response) {
  const name = request.body.name;
  const comment = request.body.comment;

  const guestbookEntry = {
    name,
    comment,
    id: dummyData.guestbook.length + 1,
  };

  dummyData.guestbook.push(guestbookEntry);

  response.redirect("/guestbook/");
});

app.get("/blogpost-form", function (request, response) {
  response.render("blogpost-form.hbs");
});

app.post("/blogpost-form", function (request, response) {
  const title = request.body.title;
  const date = request.body.date;
  const description = request.body.description;
  const content = request.body.content;

  const blogpost = {
    title,
    date,
    description,
    content,
    id: dummyData.blog.length + 1,
  };

  dummyData.blog.push(blogpost);

  response.redirect("/blog-users/" + blogpost.id);
});

app.get("/projects-form", function (request, response) {
  response.render("projects-form.hbs");
});

app.post("/projects-form", function (request, response) {
  const name = request.body.name;
  const date = request.body.date;
  const content = request.body.content;
  const description = request.body.description;
  const image = request.body.image;

  const project = {
    name,
    date,
    content,
    description,
    image,
    id: dummyData.projects.length + 1,
  };

  dummyData.projects.push(project);

  response.redirect("/projects-users/" + project.id);
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
