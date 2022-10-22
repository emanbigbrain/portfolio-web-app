const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");
const SQLiteStore = require("connect-sqlite3")(expressSession);
const bcrypt = require("bcrypt");

// ===== Constant Variables for Error Handling =====

const MIN_NAME_LENGTH = 2;
const MIN_COMMENT_LENGTH = 4;
const MAX_COMMENT_LENGTH = 50;
const MAX_NAME_LENGTH = 20;

const MIN_DATE_LENGTH = 7;

const MIN_TITLE_LENGTH = 4;
const MAX_TITLE_LENGTH = 20;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 30;
const MIN_CONTENT_LENGTH = 100;

const MIN_PROJECT_TITLE_LENGTH = 4;
const MAX_PROJECT_TITLE_LENGTH = 20;
const MIN_PROJECT_DESCRIPTION_LENGTH = 10;
const MAX_PROJECT_DESCRIPTION_LENGTH = 30;
const MIN_PROJECT_CONTENT_LENGTH = 100;
const MIN_IMAGE_URL_LENGTH = 8;

// ===== Database Tables for Projects, Blogposts & Guestbookentries =====

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
      comment TEXT,
      currentDateStamp TEXT
    )
`);

// ===== Hardcoded Login Details =====

const ADMIN_USERNAME = "emmanueladmin";
const ADMIN_PASSWORD =
  "$2b$10$IK0.vULHS8ZObY6zgZ58JuF0wmTHVqhhKK.23aOwOn2YNE6xXqN0m";

// ===== Implementing Express =====

const app = express();

// ===== Middlewares =====

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
    saveUninitialized: false,
    resave: false,
    secret: "jkjjoijiji",
    store: new SQLiteStore(),
  })
);

// ===== Custom Middleware for Login Functionality =====

app.use(function (request, response, next) {
  const isLoggedIn = request.session.isLoggedIn;

  response.locals.isLoggedIn = isLoggedIn;

  next();
});

// ===== Get Request for All Viewing Pages =====

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
  const query = `SELECT  * FROM projects ORDER BY id DESC`;

  db.all(query, function (error, projects) {
    if (error) {
      console.log(error);
      response.render("error.hbs");
    } else {
      const model = {
        projects,
      };

      response.render("projects-users.hbs", model);
    }
  });
});

app.get("/projects-users/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM projects WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, projects) {
    if (error) {
      console.log(error);
      response.render("error.hbs");
    } else {
      const model = {
        projects,
      };

      response.render("project.hbs", model);
    }
  });
});

app.get("/blog-users", function (request, response) {
  const query = `SELECT  * FROM blogposts ORDER BY id DESC`;

  db.all(query, function (error, blogposts) {
    if (error) {
      console.log(error);
      response.render("error.hbs");
    } else {
      const model = {
        blogposts,
      };

      response.render("blog-users.hbs", model);
    }
  });
});

app.get("/blog-users/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM blogposts WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, blogposts) {
    if (error) {
      console.log(error);
      response.render("error.hbs");
    } else {
      const model = {
        blogposts,
      };

      response.render("blogpost.hbs", model);
    }
  });
});

app.get("/guestbook", function (request, response) {
  const query = `SELECT  * FROM guestbookEntries ORDER BY id DESC`;

  db.all(query, function (error, guestbookEntries) {
    if (error) {
      console.log(error);
      response.render("error.hbs");
    } else {
      const model = {
        guestbookEntries,
      };

      response.render("guestbook.hbs", model);
    }
  });
});

app.get("/guestbook-form", function (request, response) {
  response.render("guestbook-form.hbs");
});

// ===== Validation Error Functions =====

function getValidationErrorsForProject(
  name,
  date,
  content,
  description,
  image
) {
  const validationErrors = [];

  if (name.length <= MIN_PROJECT_TITLE_LENGTH) {
    validationErrors.push(
      "The title contains at least " + MIN_PROJECT_TITLE_LENGTH + " characters."
    );
  }

  if (name.length > MAX_PROJECT_TITLE_LENGTH) {
    validationErrors.push(
      "Your title doesn't contain more than " +
        MAX_PROJECT_TITLE_LENGTH +
        " characters."
    );
  }

  if (date.length <= MIN_DATE_LENGTH) {
    validationErrors.push("You write a date ");
  }

  if (description.length <= MIN_PROJECT_DESCRIPTION_LENGTH) {
    validationErrors.push(
      "Your description contains at least " +
        MIN_PROJECT_DESCRIPTION_LENGTH +
        " characters."
    );
  }

  if (description.length > MAX_PROJECT_DESCRIPTION_LENGTH) {
    validationErrors.push(
      "Your description does not contain more than " +
        MAX_PROJECT_DESCRIPTION_LENGTH +
        " characters."
    );
  }

  if (content.length <= MIN_PROJECT_CONTENT_LENGTH) {
    validationErrors.push(
      "Your information about the project contains at least " +
        MIN_PROJECT_CONTENT_LENGTH +
        " characters."
    );
  }

  if (image.length <= MIN_IMAGE_URL_LENGTH) {
    validationErrors.push("Your image URL contains at least " + 
      MIN_IMAGE_URL_LENGTH + 
      " characters."
    );
  }

  return validationErrors;
}

function getValidationErrorsForGuestbook(name, comment) {
  const validationErrors = [];

  if (name.length <= MIN_NAME_LENGTH) {
    validationErrors.push(
      "Your name contains at least " + MIN_NAME_LENGTH + " characters."
    );
  }

  if (name.length > MAX_NAME_LENGTH) {
    validationErrors.push(
      "Your name doesn't contain more than " + MAX_NAME_LENGTH + " characters."
    );
  }

  if (comment.length <= MIN_COMMENT_LENGTH) {
    validationErrors.push(
      "Your comment contains at least " + MIN_COMMENT_LENGTH + " characters."
    );
  }

  if (comment.length > MAX_COMMENT_LENGTH) {
    validationErrors.push(
      "Your comment does not contain more than " +
        MAX_COMMENT_LENGTH +
        " characters."
    );
  }

  return validationErrors;
}

function getValidationErrorsForBlogpost(title, date, description, content) {
  const validationErrors = [];

  if (title.length <= MIN_TITLE_LENGTH) {
    validationErrors.push(
      "The title contains at least " + MIN_TITLE_LENGTH + " characters."
    );
  }

  if (title.length > MAX_TITLE_LENGTH) {
    validationErrors.push(
      "Your title doesn't contain more than " +
        MAX_TITLE_LENGTH +
        " characters."
    );
  }

  if (date.length <= MIN_DATE_LENGTH) {
    validationErrors.push("You write a date ");
  }

  if (description.length <= MIN_DESCRIPTION_LENGTH) {
    validationErrors.push(
      "Your description contains at least " +
        MIN_DESCRIPTION_LENGTH +
        " characters."
    );
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    validationErrors.push(
      "Your description does not contain more than " +
        MAX_DESCRIPTION_LENGTH +
        " characters."
    );
  }

  if (content.length <= MIN_CONTENT_LENGTH) {
    validationErrors.push(
      "Your content contains at least " + MIN_CONTENT_LENGTH + " characters."
    );
  }

  return validationErrors;
}

// ===== Post & Get Request - Guestbook Form Handling =====

app.post("/guestbook-form", function (request, response) {
  const name = request.body.name;
  const comment = request.body.comment;

  const validationErrors = getValidationErrorsForGuestbook(name, comment);

  if (validationErrors == 0) {
    const query = `INSERT INTO guestbookEntries (name, comment, currentDateStamp) VALUES (?, ?, date())`;
    const values = [name, comment];

    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        response.redirect("/error");
      } else {
        response.redirect("/guestbook");
      }
    });
  } else {
    const model = {
      validationErrors,
      name,
      comment,
    };

    response.render("guestbook-form.hbs", model);
  }
});

app.get("/update-guestbook/:id", function (request, response) {
  if (request.session.isLoggedIn) {
    const id = request.params.id;

    const query = `SELECT * FROM guestbookEntries WHERE id = ?`;
    const values = [id];

    db.get(query, values, function (error, guestbookEntries) {
      if (error) {
        console.log(error);
        response.render("error.hbs");
      } else {
        const model = {
          guestbookEntries,
        };

        response.render("update-guestbook.hbs", model);
      }
    });
  } else {
    response.redirect("/login");
  }
});

app.post("/update-guestbook/:id", function (request, response) {
  const id = request.params.id;
  const newName = request.body.name;
  const newComment = request.body.comment;

  const errors = getValidationErrorsForGuestbook(newName, newComment);

  if (!request.session.isLoggedIn) {
    errors.push("You have to login.");
  }

  if (errors == 0) {
    const query = `UPDATE guestbookEntries SET name = ?, comment = ?, currentDateStamp = date() WHERE id = ?`;
    const values = [newName, newComment, id];

    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        response.redirect("/error");
      } else {
        response.redirect("/guestbook");
      }
    });
  } else {
    const model = {
      guestbookEntries: {
        id,
        name: newName,
        comment: newComment,
      },
      errors,
    };

    response.render("update-guestbook.hbs", model);
  }
});

app.post("/delete-guestbookEntry/:id", function (request, response) {
  if (request.session.isLoggedIn) {
    const id = request.params.id;

    const query = `DELETE FROM guestbookEntries WHERE id = ?`;
    const values = [id];

    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        response.redirect("/error");
      } else {
        response.redirect("/guestbook");
      }
    });
  } else {
    response.redirect("/login");
  }
});

// ===== Post & Get Request - Blogpost Form Handling =====

app.get("/blogpost-form", function (request, response) {
  if (request.session.isLoggedIn) {
    response.render("blogpost-form.hbs");
  } else {
    response.redirect("/login");
  }
});

app.post("/blogpost-form", function (request, response) {
  const title = request.body.title;
  const date = request.body.date;
  const description = request.body.description;
  const content = request.body.content;

  const errors = getValidationErrorsForBlogpost(
    title,
    date,
    description,
    content
  );

  if (!request.session.isLoggedIn) {
    errors.push("You have to login.");
  }

  if (errors == 0) {
    const query = `INSERT INTO blogposts (title, date, description, content) VALUES (?, ?, ?, ?)`;
    const values = [title, date, description, content];

    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        response.redirect("/error");
      } else {
        response.redirect("/blog-users");
      }
    });
  } else {
    const model = {
      errors,
      title,
      date,
      description,
      content,
    };

    response.render("blogpost-form.hbs", model);
  }
});

app.get("/update-blogpost/:id", function (request, response) {
  if (request.session.isLoggedIn) {
    const id = request.params.id;

    const query = `SELECT * FROM blogposts WHERE id = ?`;
    const values = [id];

    db.get(query, values, function (error, blogposts) {
      if (error) {
        console.log(error);
        response.render("error.hbs");
      } else {
        const model = {
          blogposts,
        };

        response.render("update-blogpost.hbs", model);
      }
    });
  } else {
    response.redirect("/login");
  }
});

app.post("/update-blogpost/:id", function (request, response) {
  const id = request.params.id;
  const newTitle = request.body.title;
  const newDate = request.body.date;
  const newContent = request.body.content;
  const newDescription = request.body.description;

  const errors = getValidationErrorsForBlogpost(
    newTitle,
    newDate,
    newDescription,
    newContent
  );

  if (!request.session.isLoggedIn) {
    errors.push("You have to login.");
  }

  if (errors == 0) {
    const query = `UPDATE blogposts SET title = ?, date = ?, description = ?, content = ? WHERE id = ?`;
    const values = [newTitle, newDate, newDescription, newContent, id];

    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        response.redirect("/error");
      } else {
        response.redirect("/blog-users/" + id);
      }
    });
  } else {
    const model = {
      blogposts: {
        id,
        title: newTitle,
        date: newDate,
        description: newDescription,
        content: newContent,
      },
      errors,
    };

    response.render("update-blogpost.hbs", model);
  }
});

app.post("/delete-blogpost/:id", function (request, response) {
  if (request.session.isLoggedIn) {
    const id = request.params.id;

    const query = `DELETE FROM blogposts WHERE id = ?`;
    const values = [id];

    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        response.redirect("/error");
      } else {
        response.redirect("/blog-users");
      }
    });
  } else {
    response.redirect("/login");
  }
});

// ===== Post & Get Request - Project Form Handling =====

app.get("/projects-form", function (request, response) {
  if (request.session.isLoggedIn) {
    response.render("projects-form.hbs");
  } else {
    response.redirect("/login");
  }
});

app.get("/error", function (request, response) {
  response.render("error.hbs");
});

app.post("/projects-form", function (request, response) {
  const name = request.body.name;
  const date = request.body.date;
  const content = request.body.content;
  const description = request.body.description;
  const image = request.body.image;

  const errors = getValidationErrorsForProject(
    name,
    date,
    content,
    description,
    image
  );

  if (!request.session.isLoggedIn) {
    errors.push("You have to login");
  }

  if (errors == 0) {
    const query = `INSERT INTO projects (name, date, content, description, image) VALUES (?, ?, ?, ?, ?)`;
    const values = [name, date, content, description, image];

    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        response.redirect("/error");
      } else {
        response.redirect("/projects-users");
      }
    });
  } else {
    const model = {
      errors,
      name,
      date,
      content,
      description,
      image,
    };

    response.render("projects-form.hbs", model);
  }
});

app.get("/update-project/:id", function (request, response) {
  if (request.session.isLoggedIn) {
    const id = request.params.id;

    const query = `SELECT * FROM projects WHERE id = ?`;
    const values = [id];

    db.get(query, values, function (error, project) {
      if (error) {
        console.log(error);
        response.render("error.hbs");
      } else {
        const model = {
          project,
        };

        response.render("update-project.hbs", model);
      }
    });
  } else {
    response.redirect("/login");
  }
});

app.post("/update-project/:id", function (request, response) {
  const id = request.params.id;
  const newName = request.body.name;
  const newDate = request.body.date;
  const newContent = request.body.content;
  const newDescription = request.body.description;
  const newImage = request.body.image;

  const errors = getValidationErrorsForProject(
    newName,
    newDate,
    newContent,
    newDescription,
    newImage
  );

  if (!request.session.isLoggedIn) {
    errors.push("You have to login");
  }

  if (errors == 0) {
    const query = `UPDATE projects SET name = ?, date = ?, content = ?, description = ?, image = ? WHERE id = ?`;
    const values = [newName, newDate, newContent, newDescription, newImage, id];

    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        response.redirect("/error");
      } else {
        response.redirect("/projects-users/" + id);
      }
    });
  } else {
    const model = {
      project: {
        id,
        name: newName,
        date: newDate,
        content: newContent,
        description: newDescription,
        image: newImage,
      },
      errors,
    };

    response.render("update-project.hbs", model);
  }
});

app.post("/delete-projects/:id", function (request, response) {
  if (request.session.isLoggedIn) {
    const id = request.params.id;

    const query = `DELETE FROM projects WHERE id = ?`;
    const values = [id];

    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        response.redirect("/error");
      } else {
        response.redirect("/projects-users");
      }
    });
  } else {
    response.redirect("/login");
  }
});

// ===== Login Functionality Implementation =====

app.get("/login", function (request, response) {
  response.render("login.hbs");
});

app.get("/logout-notification", function (request, response) {
  response.render("logout-notification.hbs");
});

app.post("/logout", function (request, response) {
  request.session.isLoggedIn = false;
  response.redirect("/logout-notification");
});

app.post("/login", function (request, response) {
  const username = request.body.username;
  const password = request.body.password;

  if (
    username == ADMIN_USERNAME &&
    bcrypt.compareSync(password, ADMIN_PASSWORD)
  ) {
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
