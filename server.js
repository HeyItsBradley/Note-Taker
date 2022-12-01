const path = require("path");
const fs = require("fs");
const express = require("express");
const { randomUUID } = require("crypto");
const util = require("util");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
//route for notes sections
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
});
//allows us to use promise objects and .then instead of callback functions
const readFromFile = util.promisify(fs.readFile);
//will writeFile using fs
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );
//this will take data given and push it to write file
const readAndAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

//get requests
app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});
//post requests
app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (title && text) {
    const newEntry = {
      title,
      text,
      id: randomUUID(),
    };

    readAndAppend(newEntry, "./db/db.json");
    res.json(`New note added !`);
  } else {
    res.error("error in adding note");
  }
});
//delete requests
app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  readFromFile("./db/db.json").then((data) => {
    const newData = JSON.parse(data);
    const dataObj = newData;

    for (let i = 0; i < dataObj.length; i++) {
      if (dataObj[i].id === id) {
        dataObj.splice(dataObj[i], 1);
        fs.writeFile("./db/db.json", JSON.stringify(dataObj), (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("success!");
          }
        });

        res.json("note deleted?");
      }
    }

    return res.send;
  });

  //readfile
  //remove note with id
  //rewrite notes to the db.json file
});
//defaul route for homepage
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});
//port listener
app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);
