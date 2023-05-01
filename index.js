const express = require('express');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');
const app = express();
const https = require('https');
const fs = require('fs');
const validator = require('validator');

const config = require('./config.json');
const storage = new Map();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Temporary Password Holder</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 0;
          }
          form {
            background-color: #ffffff;
            padding: 2rem;
            border-radius: 5px;
            box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
          }
          label {
            display: block;
            margin-bottom: 0.5rem;
          }
          input {
            width: 100%;
            padding: 0.5rem;
            margin-bottom: 1rem;
            border: 1px solid #ced4da;
            border-radius: 3px;
          }
          button {
            width: 100%;
            padding: 0.5rem;
            background-color: #007bff;
            color: #ffffff;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-weight: bold;
            align-items: center;
          }
          button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <form action="/store" method="post">
          <label for="password">Enter password:</label>
          <input type="password" name="password" required />
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/store', (req, res) => {
  let password = req.body.password;

  // Sanitize the password input
  password = validator.escape(password);

  // Check if the password length is longer than 256 characters
  if (password.length > 256) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Error</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f8f9fa;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              padding: 0;
            }
            .container {
              background-color: #ffffff;
              padding: 2rem;
              border-radius: 5px;
              box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #dc3545;
              margin-bottom: 1rem;
            }
            p {
              margin-bottom: 1rem;
            }
            a {
              text-decoration: none;
              color: #007bff;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error</h1>
            <p>Password length should not exceed 256 characters. Please try again with a shorter password.</p>
            <p><a href="/">Go back to submit a new password</a></p>
          </div>
        </body>
      </html>
    `);
    return;
  }

  const encryptedPassword = CryptoJS.AES.encrypt(password, config.secretKey).toString();
  const id = Date.now().toString(36);
  storage.set(id, encryptedPassword);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Link</title>
        <!-- (styles and script) -->
      </head>
      <body onload="constructLink()">
        <div class="container">
          <p>Your password has been saved. Use the following link to view the password:</p>
          <input type="text" id="password-link" readonly />
          <button onclick="copyLink()">Copy to clipboard</button>
          <p id="copy-message" style="display:none;">Link copied!</p>
        </div>
      </body>
    </html>
  `);
});


app.get('/view/:id', (req, res) => {
  const encryptedPassword = storage.get(req.params.id);

  if (!encryptedPassword) {
    res.status(404).send('This link is invalid or has already been used.');
  } else {
    const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, config.secretKey).toString(CryptoJS.enc.Utf8);
    storage.delete(req.params.id);
    res.send(`Password: ${decryptedPassword}`);
  }
});

const httpsOptions = {
  key: fs.readFileSync(config.privateKey),
  cert: fs.readFileSync(config.certificate),
  ca: fs.readFileSync(config.caBundle),
};

const server = https.createServer(httpsOptions, app);

server.listen(config.port, () => {
  console.log(`Server running at https://localhost:${config.port}`);
});
