var express = require("express"),
	ParseServer = require("parse-server").ParseServer,
	ParseDashboard = require('parse-dashboard'),
	routes = require("./routes"),
	http = require("http"),
	path = require("path"),
	mongoskin = require("mongoskin")
	everyauth = require("everyauth"),
	bodyParser = require("body-parser"),
	morgan = require("morgan"),
	cookieParser = require("cookie-parser"),
	session = require("express-session"),
	methodOverride = require("method-override"),
	errorHandler = require("errorhandler");

everyauth.debug = true;

everyauth.everymodule.handleLogout(routes.user.logout);

everyauth.everymodule.findUserById(function(user, callback) {
	callback(user)
});

var app = express();
app.locals.appTitle = "Voucher System";

var api = new ParseServer({
	databaseURI: "mongodb://localhost:27017/parse",
	serverURL: "http://localhost:3000/parse/",
	appId: "APPLICATION_ID",
	fileKey: "FILE_KEY",
	masterKey: "MASTER_KEY"
});

Parse.initialize("APPLICATION_ID");
Parse.serverURL = "http://localhost:3000/parse/"

var dashboard = new ParseDashboard({
	apps: [{
			serverURL: "http://localhost:3000/parse/",
			appId: "APPLICATION_ID",
			masterKey: "MASTER_KEY",
			appName: "Voucher-System"
		}]
});

app.use("/parse", api);
app.use("/dashboard", dashboard);

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("3CCC4ACD-6ED1-4844-9217-82131BDCB239"));
app.use(session({
	secret: "2C44774A-D649-4D44-9535-46E296EF984F",
	resave: true,
	saveUninitialized: false
}));
app.use(everyauth.middleware());
app.use(methodOverride());
app.use(require("stylus").middleware(__dirname + "/public"));
app.use(express.static(path.join(__dirname, "public")));

app.use(function(req, res, next) {
	if (req.session && req.session.user) res.locals.user = req.session.user;
	next();
});

var authorize = function(req, res, next) {
	if (req.session && req.session.admin)
		return next();
	else
		return res.send(401);
};

if ("development" == app.get("env")) {
	app.use(errorHandler());
}

app.get("/", routes.index);

app.get("/login", routes.user.login);
app.post("/login", routes.user.authenticate);
app.get("/logout", routes.user.logout);

app.get("/vouchers/new", /*authorize,*/ routes.voucher.new);
app.get("/vouchers/:code/edit", /*authorize,*/ routes.voucher.edit);

// app.all("/api", authorize);

app.get("/api/vouchers", routes.voucher.index);
app.get("/api/vouchers/:code", routes.voucher.index);

app.post("/api/vouchers", routes.voucher.create);
app.put("/api/vouchers/:code", routes.voucher.update);
app.put("/api/vouchers/:code/assign", routes.voucher.assign);
app.put("/api/vouchers/:code/activate", routes.voucher.activate);
app.delete("/api/vouchers/:code", routes.voucher.delete);

app.all("*", function(req, res) {
	res.sendStatus(404);
})

var server = http.createServer(app);
var boot = function () {
	server.listen(app.get("port"), function() {
		console.info(app.locals.appTitle + " running on http://localhost:" + app.get("port"));
	});
}
var shutdown = function() {
	server.close();
}
if (require.main === module) {
	boot();
}
else {
	console.info("Running app as a module");
	exports.boot = boot;
	exports.shutdown = shutdown;
	exports.port = app.get("port");
}
