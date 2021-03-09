<h1 align="center">Security Camera</h1>

> Wireless camera viewing, motion detection, and notification.
# Node Application

## Install
Ensure you have SQLServer, node, and npm installed. *The project was built with node 14+.

In addition you will need to create a database in your SQLServer.

### Enviorement Variables

Below are the required enviorement variables
```c
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USERNAME=6d388ff2a69cef
SMTP_PASSWORD=a0bc4d3f470f55

DB_USER=test
DB_PASS=1234
DB_DATASOURCE=SecurityCamera

ACCESS_TOKEN_SECRET=2de67aef7885b5f1504a8b4132aaf2c620529a47cfb7ba9c5fdd92453d5d4d4861c0914ae3f1d70ccd5e123287cd8930c8d8b81574210082b0e52a9d530b4169
REFRESH_TOKEN_SECRET=3a68da18ebe4e4c86320c644f33d1f71310195cb9743ea226fedf8f894923ae5a26ffa43bb017a56f3db4b015f68833b8750a4726c9f542f26658ee3a740bcae

STUN_URL=stun:stunserver.org:3478

REACT_APP_TURN_URL=turn:numb.viagenie.ca
REACT_APP_TURN_USERNAME=
REACT_APP_TURN_CREDENTIAL=
```

In addition there are some optional variables below.

```c
NODE_ENV=development
SERVER_PORT=42069
```

Navigate to the NodeApp's base directory and execute the following:
```sh
# The start script runs 'npm i' in the current directory
# as well as in the 'client' directory
cd NodeApp
npm start
```

This script compiles all the code and (by default) starts a *production deployment of the server. You may terminate this process in order to start a development server. In most cases, `npm start` should be sufficient to startup and run the server.

### Development Server
After installing you can go to the NodeApp and run
```sh
npm run dev
```
It should then start the dev server. A few notes, the client will hot reload, but server changes will not hot reload.
