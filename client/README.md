# A no-nonsense YouTube downloader in 2020
The root directory is a React project and there's also a simple NodeJS ExpressJS server project in the server folder.

## Hosting
### Server
There's a PM2 config file in the server folder which points the server api to port 4000 under the name `ytd-server`

### Client
The following is a PM2 config file for serving the React front end:

```js
module.exports = {
  name: "ytd",
  script: "serve",
  out_file: "./logs/out.log",
  error_file: "./logs/err.log",
  time: true,
  env: {
    PM2_SERVE_PATH: '.',
    PM2_SERVE_PORT: 5000,
    PM2_SERVE_SPA: 'true',
    PM2_SERVE_HOMEPAGE: '/index.html'
  }
}
```

The API endpoint the front end uses to point to the server api is configured in the `.env.*` files.

### NGINX
I used the following guide to set up both the server & client on Ubuntu with PM2 & NGINX
https://medium.com/@panzelva/deploying-express-js-website-to-vps-with-nginx-pm2-and-ubuntu-18-04-8c5d32593211

I created an NGINX config file here: `/etc/nginx/sites-available/config`
```
server {
	listen <port>;
	server_name <ip>;

	location /ytdapi/ {
		proxy_pass http://localhost:4000/;
	}

	location /ytd/ {
		proxy_pass http://localhost:5000/;
	}
}
```

> The port for the /ytd endpoint must match the client's PM2 config file port.

You can edit the config file with the following command: `sudo nano /etc/nginx/sites-available/config`
And then restart nginx with: `sudo systemctl restart nginx`

# Useful
https://create-react-app.dev/docs/proxying-api-requests-in-development/
https://create-react-app.dev/docs/adding-custom-environment-variables/