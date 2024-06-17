## Teletype

A terminal emulator that runs in the browser.

The application mimics the communication ports (COM1, COM2, etc.) on a computer to facilitate serial transfers in an 80x25 buffer between connections.

This is used to re-create the dial-up networking experience provided by HyperTerminal.

### WebSockets

A websocket server is used to facilitate communication between clients, based on [ghedipunk/PHP-Websockets](https://github.com/ghedipunk/PHP-Websockets).

### SSL proxy

Attempting to connect from a secure domain to an insecure websocket server at `ws://example.com/com1/` will result in an error:

```
Failed to construct 'WebSocket': An insecure WebSocket connection may not be
initiated from a page loaded over HTTPS.
```

The [best way to setup an wss connection](https://stackoverflow.com/a/19274712), is to put your websocket server behind Nginx or HAProxy which will handle all the SSL stuff for you.

Here we are using nginx with the following configuration:

```
server {
    listen 8443 ssl;

    server_name example.com;

    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private/key.pem;

    location = /com1/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

    location = /com2/ {
        proxy_pass http://127.0.0.1:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

    location = /com3/ {
        proxy_pass http://127.0.0.1:4003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

    location = /com4/ {
        proxy_pass http://127.0.0.1:4004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Note that there are entries mapping each COM port for this application as paths corresponding to backend ports where the websocket server is running.

### Server

Then, there are 4 instances of the websocket server launched, which can stay running in a `screen` session.

```
teletype/server# php teletype_server.php 4001
Server started
Listening on: 127.0.0.1:4001

teletype/server# php teletype_server.php 4002
Server started
Listening on: 127.0.0.1:4002

teletype/server# php teletype_server.php 4003
Server started
Listening on: 127.0.0.1:4003

teletype/server# php teletype_server.php 4004
Server started
Listening on: 127.0.0.1:4004
```

### Client

Finally, a secure connection to the websocket can be opened successfully by the client.

```
var socket = new WebSocket('wss://example.com:8443/com1/');
```

### Demo

See the working demo here: https://dysproseum.com/teletype/
