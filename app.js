const dummyData = require("./dummy-data");
const express = require("express");
const expressHandlebars = require("express-handlebars");

const app = express();

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);

app.use(express.static("./public"));

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
  response.render("blog-users.hbs");
});

app.listen(8080);
