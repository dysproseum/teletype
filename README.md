## Teletype

A terminal emulator that runs in the browser.

The application mimics the communication ports (COM1, COM2, etc.) on a computer to facilitate serial transfers in an 80x25 buffer between connections.

This is used to re-create the dial-up networking experience provided by HyperTerminal.

### WebSockets

A websocket server is used to facilitate communication between clients, based on [ghedipunk/PHP-Websockets](https://github.com/ghedipunk/PHP-Websockets).

### SSL proxy

Attempting to connect from a secure domain to an insecure websocket server at `ws://example.com/websocket/` will result in an error:

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

    location = /websocket/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Server

```
# php teletype_server.php
Server started
Listening on: 0.0.0.0:4000
```

### Client

Opens a connection to `wss://example.com:8443/websocket/`
