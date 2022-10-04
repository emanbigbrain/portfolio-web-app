const dummyData = require("./dummy-data");
const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");

const ADMIN_USERNAME = "Emmanuel";
const ADMIN_PASSWORD = "mypassword";

//Database

const db = new sqlite3.Database("portfolio-database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    date TEXT,
    content TEXT,
    description TEXT,
    image TEXT
  )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS blogposts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      date TEXT,
      description TEXT,
      content TEXT
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS guestbookEntries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      comment TEXT
    )
`);

const app = express();

//Middlewares

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

//Request and Response

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
  const query = `SELECT  * FROM projects`;

  db.all(query, function (error, projects) {
    const model = {
      projects,
    };

    response.render("projects-users.hbs", model);
  });
});

app.get("/projects-users/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM projects WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, projects) {
    const model = {
      projects,
    };

    response.render("project.hbs", model);
  });
});

app.get("/blog-users", function (request, response) {
  const query = `SELECT  * FROM blogposts`;

  db.all(query, function (error, blogposts) {
    const model = {
      blogposts,
    };

    response.render("blog-users.hbs", model);
  });
});

app.get("/blog-users/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM blogposts WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, blogposts) {
    const model = {
      blogposts,
    };

    response.render("blogpost.hbs", model);
  });
});

app.get("/guestbook", function (request, response) {
  const query = `SELECT  * FROM guestbookEntries`;

  db.all(query, function (error, guestbookEntries) {
    const model = {
      guestbookEntries,
    };

    response.render("guestbook.hbs", model);
  });
});

app.get("/guestbook-form", function (request, response) {
  response.render("guestbook-form.hbs");
});

app.post("/guestbook-form", function (request, response) {
  const name = request.body.name;
  const comment = request.body.comment;

  const query = `INSERT INTO guestbookEntries (name, comment) VALUES (?, ?)`;
  const values = [name, date, description, content];

  db.run(query, values, function (error) {
    response.redirect("/blog-users");
  });

  const guestbookEntry = {
    name,
    comment,
    id: dummyData.guestbook.length + 1,
  };

  dummyData.guestbook.push(guestbookEntry);

  response.redirect("/guestbook/");
});

app.get("/update-guestbook/:id", function (request, response) {
  const id = request.params.id;

  const guestbookEntry = dummyData.guestbook.find((h) => h.id == id);

  const model = {
    guestbookEntry,
  };

  response.render("update-guestbook.hbs", model);
});

app.post("/update-guestbook/:id", function (request, response) {
  const id = request.params.id;
  const newName = request.body.name;
  const newComment = request.body.comment;

  const guestbookEntry = dummyData.guestbook.find((h) => h.id == id);

  guestbookEntry.name = newName;
  guestbookEntry.comment = newComment;

  response.redirect("/update-guestbook/" + id);
});

app.post("/delete-guestbookEntry", function (request, response) {
  const id = request.params.id;

  const guestbookIndex = dummyData.guestbook.findIndex((h) => h.id == id);

  dummyData.guestbook.splice(guestbookIndex, 1);

  response.redirect("/guestbook");
});

app.get("/blogpost-form", function (request, response) {
  response.render("blogpost-form.hbs");
});

app.post("/blogpost-form", function (request, response) {
  const title = request.body.title;
  const date = request.body.date;
  const description = request.body.description;
  const content = request.body.content;

  const query = `INSERT INTO blogposts (title, date, description, content) VALUES (?, ?, ?, ?)`;
  const values = [title, date, description, content];

  db.run(query, values, function (error) {
    response.redirect("/blog-users");
  });
});

app.get("/update-blogpost/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM blogposts WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, blogposts) {
    const model = {
      blogposts,
    };

    response.render("update-blogpost.hbs", model);
  });
});

app.post("/update-blogpost/:id", function (request, response) {
  const id = request.params.id;
  const newTitle = request.body.title;
  const newDate = request.body.date;
  const newContent = request.body.content;
  const newDescription = request.body.description;

  const query = `UPDATE blogposts SET title = ?, date = ?, description = ?, content = ? WHERE id = ?`;
  const values = [newTitle, newDate, newDescription, newContent, id];

  db.run(query, values, function (error) {
    response.redirect("/update-blogpost/" + id);
  });
});

app.post("/delete-blogpost/:id", function (request, response) {
  const id = request.params.id;

  const query = `DELETE FROM blogposts WHERE id = ?`;
  const values = [id];

  db.run(query, values, function (error) {
    response.redirect("/blog-users");
  });
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

  const query = `INSERT INTO projects (name, date, content, description, image) VALUES (?, ?, ?, ?, ?)`;
  const values = [name, date, content, description, image];

  db.run(query, values, function (error) {
    response.redirect("/projects-users");
  });
});

app.get("/update-project/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM projects WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, project) {
    const model = {
      project,
    };

    response.render("update-project.hbs", model);
  });
});

app.post("/update-project/:id", function (request, response) {
  const id = request.params.id;
  const newName = request.body.name;
  const newDate = request.body.date;
  const newContent = request.body.content;
  const newDescription = request.body.description;
  const newImage = request.body.image;

  const query = `UPDATE projects SET name = ?, date = ?, content = ?, description = ?, image = ? WHERE id = ?`;
  const values = [newName, newDate, newContent, newDescription, newImage, id];

  db.run(query, values, function (error) {
    response.redirect("/update-project/" + id);
  });
});

app.post("/delete-projects/:id", function (request, response) {
  const id = request.params.id;

  const query = `DELETE FROM projects WHERE id = ?`;
  const values = [id];

  db.run(query, values, function (error) {
    response.redirect("/projects-users");
  });
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
