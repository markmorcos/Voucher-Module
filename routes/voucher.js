/*
 * GET vouchers API.
 */

exports.index = function(req, res, next) {
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	query.find({
		success: function(vouchers) {
			res.send({ vouchers: vouchers });
		}, error: function(error) {
			return next(error);
		}
	});
};

/*
 * GET voucher API.
 */

exports.show = function(req, res, next) {
	if (!req.params.code) return next(new Error('No voucher code.'));
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	query.equalTo('code', req.params.code);
	query.first({
		success: function(voucher) {
			res.send({ voucher: voucher });
		}, error: function(error) {
			return next(error);
		}
	});
};

/*
 * GET new voucher page.
 */

exports.new = function(req, res, next) {
	if (!req.body.title) res.render('vouchers/new');
};

/*
 * POST voucher API.
 */

exports.create = function(req, res, next) {
	if (!req.body.usageLimit) return res.render('vouchers/new', { error: "Please enter the usage limit." });
	var generatedCode = Math.random().toString(36).substr(2);
	var voucher = {
		code: req.body.code || generatedCode,
		central: req.body.central || true,
		usageLimit: req.body.usageLimit,
		startTimestamp: req.body.startTimestamp,
		endTimestamp: req.body.endTimestamp,
		characters: req.body.characters,
		username: req.body.username,
		tradability: req.body.tradability
	};
	var Voucher = Parse.Object.extend("Voucher");
	new Voucher().save(voucher, {
		success: function(voucher) {
			res.render('vouchers/new', { error: "Voucher was added. Publish it on Admin page." });
		}, error: function(error) {
			return next(error);
		}
	});
};

/*
 * GET edit voucher page.
 */

exports.edit = function(req, res, next) {
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	query.equalTo('code', req.params.code);
	query.first({
		success: function(voucher) {
			res.render('vouchers/new', { voucher: voucher });
		}, error: function(error) {
			return next(error);
		}
	});
};

/*
 * PUT voucher API.
 */

exports.update = function(req, res, next) {
	if (!req.body.code) return res.render('vouchers/new', { error: "No voucher code." });
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	query.equalTo('code', req.params.code);
	query.find({
		success: function(voucher) {
			voucher.set('code', req.body.code || generatedCode);
			voucher.set('central', req.body.central || false);
			voucher.set('usageLimit', req.body.usageLimit);
			voucher.set('startTimestamp', req.body.startTimestamp);
			voucher.set('endTimestamp', req.body.endTimestamp);
			voucher.set('characters', req.body.characters);
			voucher.set('username', req.body.username);
			voucher.set('tradability', req.body.tradability);
			voucher.save(null, {
				success: function(voucher) {
					res.send({ code: voucher.code });
				}, error: function(error) {
					return next(error);
				}
			});
		}, error: function(error) {
			return next(error);
		}
	});
};

/*
 * DELETE voucher API.
 */

exports.delete = function(req, res, next) {
	if (!req.body.code) return next(new Error("No voucher code." ));
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	query.equalTo('code', req.params.code);
	query.find({
		success: function(voucher) {
			voucher.destroy({
				success: function(voucher) {
					res.send({ success: true });
				}, error: function(error) {
					return next(error);
				}
			});
		}, error: function(error) {
			return next(error);
		}
	});
};
