const express = require('express');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');
const app = express();
const https = require('https');
const fs = require('fs');

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
  const password = req.body.password;
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
          .container {
            text-align: center;
          }

          input[type="text"] {
            margin-bottom: 1rem;
          }

          p#copy-message {
            color: #28a745;
          }
        </style>
        <script>
          function copyLink() {
            const link = document.getElementById("password-link");
            link.select();
            document.execCommand("copy");
            document.getElementById("copy-message").style.display = "block";
          }

          function constructLink() {
            const currentDomain = window.location.origin;
            const linkPath = "/view/${id}";
            const link = document.getElementById("password-link");
            link.value = currentDomain + linkPath;
          }
        </script>
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
