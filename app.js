var express = require('express'),
	ParseServer = require('parse-server').ParseServer,
	routes = require('./routes'),
	// models = require('./models'),
	http = require('http'),
	path = require('path'),
	mongoskin = require('mongoskin')
	dbUrl = process.env.MONGOHQ_URL || 'mongodb://127.0.0.1:27017/parse',
	db = mongoskin.db(dbUrl, { safe: true }),
	collections = {
		vouchers: db.collection('vouchers'),
		users: db.collection('users')
	}
	everyauth = require('everyauth');

everyauth.debug = true;

//we need it because otherwise the session will be kept alive
everyauth.everymodule.handleLogout(routes.user.logout);

everyauth.everymodule.findUserById( function (user, callback) {
	callback(user)
});

var app = express();
app.locals.appTitle = "Voucher System";

var api = new ParseServer({
	databaseURI: 'mongodb://127.0.0.1:27017/parse',
	// cloud: './cloud/main.js',
	appId: 'APPLICATION_ID',
	fileKey: 'myFileKey',
	masterKey: 'mySecretMasterKey',
	serverURL: 'http://127.0.0.1:1337/parse'
});

Parse.initialize("APPLICATION_ID");
Parse.serverURL = 'http://127.0.0.1:1337/parse'

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);

app.use(function(req, res, next) {
	if (!collections.vouchers || !collections.users) return next(new Error("No collections."));
	req.collections = collections;
	return next();
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'));
app.use(express.session({ secret: '2C44774A-D649-4D44-9535-46E296EF984F' }))
app.use(everyauth.middleware());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
	if (req.session && req.session.admin)
		res.locals.admin = true;
	next();
});

// authorization
var authorize = function(req, res, next) {
	if (req.session && req.session.admin)
		return next();
	else
		return res.send(401);
};

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.use(app.router);

// pages
app.get('/', routes.index);
app.get('/login', routes.user.login);
app.post('/login', routes.user.authenticate);
app.get('/logout', routes.user.logout);

app.get('/vouchers/new', /*authorize,*/ routes.voucher.new);
app.get('/vouchers/:code/edit', /*authorize,*/ routes.voucher.edit);

// rest api routes
// app.all('/api', authorize);

app.get('/api/vouchers', routes.voucher.index);
app.get('/api/vouchers/:code', routes.voucher.show);

app.post('/api/vouchers', routes.voucher.create);
app.put('/api/vouchers/:code', routes.voucher.update);
app.del('/api/vouchers/:code', routes.voucher.delete);

app.all('*', function(req, res) {
	res.send(404);
})

var server = http.createServer(app);
var boot = function () {
	server.listen(app.get('port'), function(){
		console.info(app.locals.appTitle + ' running on http://127.0.0.1:' + app.get('port'));
	});
}
var shutdown = function() {
	server.close();
}
if (require.main === module) {
	boot();
}
else {
	console.info('Running app as a module');
	exports.boot = boot;
	exports.shutdown = shutdown;
	exports.port = app.get('port');
}
