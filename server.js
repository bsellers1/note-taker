const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const uuid = require('./helpers/uuid');
const noteData = require('./db/db.json')
const util = require('util');
const readFromFile = util.promisify(fs.readFile);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };
        fs.readFile('./db/db.json', "utf8", (error, data) => {
            error ? console.log(error) : console.log(data);
            const notes = JSON.parse(data)
            notes.push(newNote)
            fs.writeFile(`./db/db.json`, JSON.stringify(notes, null, 2), (err) =>
                err
                    ? console.error(err)
                    : console.log(
                        `notes for ${newNote.title} has been written to JSON file`
                    )
            );
        })
        const response = {
            status: 'success',
            body: newNote,
        };
        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting note');
    }
});

const PORT = 3000;
app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);