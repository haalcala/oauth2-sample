import express from "express";

// Import the axios library, to make HTTP requests
import axios from "axios";
import path from "path";
import morgan from "morgan";
import bodyParser from "body-parser";

// This is the client ID and client secret that you obtained
// while registering the application
const clientID = "1c57e5814fa63a36ceb9";
const clientSecret = "4b756cede2edc236907330a495b046b3bb319d10";

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

// Declare the redirect route
app.get("/oauth/redirect", (req, res) => {
	// The req.query object has the query params that
	// were sent to this route. We want the `code` param

	console.log("/oauth/redirect req", req, "res", res);

	const requestToken = req.query.code;
	axios({
		// make a POST request
		method: "post",
		// to the Github authentication API, with the client ID, client secret
		// and request token
		url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
		// Set the content type header, so that we get the response in JSOn
		headers: {
			accept: "application/json"
		}
	}).then(response => {
		// Once we get the response, extract the access token from
		// the response body
		const accessToken = response.data.access_token;
		// redirect the user to the welcome page, along with the access token
		res.redirect(`/welcome.html?access_token=${accessToken}`);
	});
});

app.listen(8080);

console.log("Now listening on port 8080");
