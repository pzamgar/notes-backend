const mongoose = require("mongoose");
require("dotenv").config();

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const content = process.argv[3];

const addNote = content === undefined ? false : true;

const url = process.env.MONGODB_URI;

mongoose.connect(url, { useNewUrlParser: true });

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean
});

const Note = mongoose.model("Note", noteSchema);

const note = new Note({
  content: content,
  date: new Date(),
  important: true
});

if (addNote) {
  note.save().then(response => {
    console.log("note saved!");
    mongoose.connection.close();
  });
} else {
  Note.find({}).then(result => {
    result.forEach(note => {
      console.log(note);
    });
    mongoose.connection.close();
  });
}
