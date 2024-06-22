const express = require('express');
const { TempMail } = require('1secmail-api');

const app = express();
const port = 3000;

let mailInstances = {};

function generateRandomId() {
    var length = 6;
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var randomId = '';

    for (var i = 0; i < length; i++) {
        randomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return randomId;
}

// Endpoint to generate a temporary email
app.get('/gen', async (req, res) => {
    try {
        const id = generateRandomId();
        const mail = new TempMail(id);
        mailInstances[id] = mail;
        mail.autoFetch();
        
        res.json({ email: mail.address, id: id });

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Endpoint to fetch inbox messages for a given email ID
app.get('/inbox/:id', async (req, res) => {
    const { id } = req.params;
    const mail = mailInstances[id];

    if (!mail) {
        return res.status(404).send('Email ID not found.');
    }

    try {
        const mails = await mail.getMail();
        if (mails.length === 0) {
            return res.json({ message: 'No new messages.' });
        }

        const messages = mails.map(m => ({
            from: m.from,
            subject: m.subject,
            textBody: m.textBody,
            date: m.date
        }));

        res.json(messages);

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`Temp email server running at http://localhost:${port}`);
});
