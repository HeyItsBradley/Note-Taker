const exp = require("constants");
const { randomUUID } = require("crypto");
const { response } = require("express");
const express = require("express");
const { fstat } = require("fs");
const { request } = require("http");
const app = express();
const PORT = 3001;
const path = require("path");
const noteData = require("./db/db.json");
const fs = require("fs");

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

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

app.use(express.static("public"));
app.use(express.json());

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
});

app.get("/api/notes", (req, res) => res.json(noteData));

app.post("/api/notes", (req, res) => {
  console.log(req.body);

  const { title, text } = req.body;

  if (title && text) {
    const newEntry = {
      title,
      text,
      id: randomUUID(),
    };

    readAndAppend(newEntry, "./db/db.json");
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);
