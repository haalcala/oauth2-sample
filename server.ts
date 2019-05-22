import express from "express";

// Import the axios library, to make HTTP requests
import path from "path";
import morgan from "morgan";
import bodyParser from "body-parser";
import { URL } from "url";
import request = require("request");

// This is the client ID and client secret that you obtained
// while registering the application
const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

// Declare the redirect route
app.get("/oauth/redirect", async (req, res) => {
	// The req.query object has the query params that
	// were sent to this route. We want the `code` param

	console.log("/oauth/redirect req", req, "res", res);

	const requestToken = req.query.code;

	let token_url;

	const referer = req.headers.referer && new URL(req.headers.referer);

	let json, user_url;

	console.log("referer", referer);

	if (referer) {
		if (referer.host === "github.com") {
			token_url = `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`;

			user_url = "https://github.com/login/oauth/access_token";
		} else {
			token_url = `${referer.protocol}//${referer.host}/oauth/token?client_id=my_admin&client_secret=3d96d5e606085bec65f9ed731056f58e095af12cdc75fcf1182f38eab50ff35b&code=${requestToken}`;

			json = { grant_type: "authorization_code", client_id: "my_admin", client_secret: "3d96d5e606085bec65f9ed731056f58e095af12cdc75fcf1182f38eab50ff35b", code: requestToken };

			user_url = `${referer.protocol}//${referer.host}/oauth/account`;
		}
	}

	const _req = {
		// make a POST request
		method: "post",
		// to the Github authentication API, with the client ID, client secret
		// and request token
		url: token_url,
		// Set the content type header, so that we get the response in JSOn
		headers: {
			accept: "application/json"
			// authorization: "Bearer " + requestToken
		},
		json
	};

	console.log("_req:", _req);

	request(_req, (err, resp) => {
		console.log("resp", resp);

		// Once we get the response, extract the access token from
		// the response body
		// @ts-ignore
		const accessToken = (resp.data || resp.body).access_token;
		// redirect the user to the welcome page, along with the access token

		res.redirect(`/welcome.html?access_token=${accessToken}&user_url=${user_url}`);
	});
});

const port = process.env.PORT || 4002;

app.listen(port);

console.log("Now listening on port " + port);
