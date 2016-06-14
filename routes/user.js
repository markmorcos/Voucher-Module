
/*
 * GET users listing.
 */

exports.list = function(req, res) {
	res.send("respond with a resource");
};


/*
 * GET login page.
 */

exports.login = function(req, res, next) {
	res.render('login');
};

/*
 * GET logout route.
 */

exports.logout = function(req, res, next) {
	req.session.destroy();
	res.redirect("/");
};


/*
 * POST authenticate route.
 */

exports.authenticate = function(req, res, next) {
	if (!req.body.username || !req.body.password) return res.render("login", { error: "Please enter your username and password." });
	Parse.User.logIn(req.body.username, req.body.password, {
		success: function(user) {
			if (!user) return res.render("login", { error: "Incorrect username and password combination." });
			req.session.user = user;
			res.redirect("/");
		}, error: function(user, error) {
			res.render("login", { error: error.message });
		}
	});
};
