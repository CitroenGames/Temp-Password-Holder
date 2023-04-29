# Password Storage and Retrieval System

This is a simple Node.js application that allows you to securely store and retrieve passwords using encryption. The application uses Express.js for creating a web server and CryptoJS for password encryption.

## Features

- Store passwords securely using AES encryption
- Retrieve passwords using a unique ID
- HTTPS server for secure communication
- Simple web interface for password storage and retrieval

## Prerequisites

- Node.js (v12 or above)
- npm (Node Package Manager)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/CitroenGames/Temp-Password-Holder/
   ```

2. Install the dependencies:

   ```bash
   cd Temp-Password-Holder
   npm install
   ```

3. Configuration:

   - Create a `config.json` file in the project root with the following structure:

     ```json
     {
       "port": 2000,
       "privateKey": "path/to/private.key",
       "caBundle": "path/to/ca_bundle.crt",
       "certificate": "path/to/certificate.crt",
       "secretKey": "your-secret-key"
     }
     ```

     - `"port"`: The port number on which the HTTPS server will listen.
     - `"privateKey"`: File path to the private key used for SSL encryption.
     - `"caBundle"`: File path to the CA (Certificate Authority) bundle file used for SSL encryption.
     - `"certificate"`: File path to the SSL certificate file.
     - `"secretKey"`: Secret key used for encrypting and decrypting passwords.

4. Start the server:

   ```bash
   npm start
   ```

5. Open your web browser and visit `https://localhost:2000` to access the password storage web interface.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
