const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

require("dotenv").config();
const Note = require("./models/note");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("build"));

morgan.token("body", function(req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :status - :response-time ms - :res[content-length] - :body (:date[web])"
  )
);

app.get("/api/notes", (request, response, next) => {
  Note.find({})
    .then(notes => {
      response.json(notes.map(note => note.toJSON()));
    })
    .catch(error => next(error));
});

app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note.toJSON());
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

app.post("/api/notes", (request, response, next) => {
  const body = request.body;

  if (body.content === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  });

  note
    .save()
    .then(savedNote => {
      response.json(savedNote.toJSON());
    })
    .catch(error => next(error));
});

app.put("/api/notes/:id", (request, response, next) => {
  console.log("request", request.body);
  const body = request.body;

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date()
  };

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updateNote => {
      if (updateNote) {
        response.json(updateNote.toJSON());
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind == "ObjectId") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
