/*
 * GET index voucher API.
 */

exports.index = function(req, res, next) {
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	if (req.params.code) query.equalTo("code", req.params.code);
	if (req.query.username) query.equalTo("username", req.query.username);
	query.find({
		success: function(vouchers) {
			res.send({ vouchers: vouchers });
		}, error: function(error) {
			return next(error);
		}
	});
};

/*
 * GET show voucher page.
 */

exports.show = function(req, res, next) {
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	if (req.params.code) query.equalTo("code", req.params.code);
	query.first({
		success: function(voucher) {
			res.render("vouchers/show", { voucher: voucher.toJSON() });
		}, error: function(error) {
			return next(error);
		}
	});
};

/*
 * GET new voucher page.
 */

exports.new = function(req, res, next) {
	if (!req.body.title) res.render("vouchers/new", { bundles: req.session.bundles });
};

/*
 * POST create voucher API.
 */

exports.create = function(req, res, next) {
	if (!req.body.usageLimit) return res.render("vouchers/new", { error: "Please enter the usage limit.", bundles: req.session.bundles });
	var generatedCode = Math.random().toString(36).substr(2);
	var voucher = {
		code: req.body.code || generatedCode,
		central: (req.body.central == undefined ? false : true),
		usageLimit: req.body.usageLimit,
		startTimestamp: req.body.startTimestamp,
		endTimestamp: req.body.endTimestamp,
		characters: req.body.characters,
		username: req.body.username,
		tradable: (req.body.tradable == undefined ? false : true),
		characters: req.body["characters[]"]
	};
	var Voucher = Parse.Object.extend("Voucher");
	new Voucher().save(voucher, {
		success: function(voucher) {
			res.render("vouchers/edit", { voucher: voucher.toJSON(), error: "Voucher added." });
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
	query.equalTo("code", req.params.code);
	query.first({
		success: function(voucher) {
			res.render("vouchers/edit", { voucher: voucher.toJSON() });
		}, error: function(error) {
			return next(error);
		}
	});
};

/*
 * PUT update voucher API.
 */

exports.update = function(req, res, next) {
	if (!req.params.code) return next(new Error("No voucher code."));
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	query.equalTo("code", req.params.code);
	query.first({
		success: function(voucher) {
			if (!voucher) return next(new Error("No voucher found."));
			voucher.set("code", req.body.code == undefined ? voucher.get("code") : req.body.code);
			voucher.set("central", req.body.central == undefined ? voucher.get("central") : req.body.central == undefined ? false : true);
			voucher.set("usageLimit", req.body.usageLimit == undefined ? voucher.get("usageLimit") : req.body.usageLimit);
			voucher.set("startTimestamp", req.body.startTimestamp == undefined ? voucher.get("startTimestamp") : req.body.startTimestamp);
			voucher.set("endTimestamp", req.body.endTimestamp == undefined ? voucher.get("endTimestamp") : req.body.endTimestamp);
			voucher.set("characters", req.body.characters == undefined ? voucher.get("characters") : req.body.characters);
			voucher.set("username", req.body.username == undefined ? voucher.get("username") : req.body.username);
			voucher.set("tradable", req.body.tradable == undefined ? voucher.get("tradable") : req.body.tradable);
			voucher.save(null, {
				success: function(voucher) {
					res.ana({ voucher: voucher.toJSON() });
				}, error: function(voucher, error) {
					return next(error);
				}
			})
		}, error: function(error) {
			return next(error);
		}
	});
};

exports.assign = function(req, res, next) {
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	query.equalTo("code", req.params.code);
	query.first({
		success: function(voucher) {
			res.render("vouchers/assign", { voucher: voucher.toJSON() });
		}, error: function(error) {
			return next(error);
		}
	});
};

/*
 * PUT assign voucher API.
 */

exports.doAssign = function(req, res, next) {
	if (!req.params.code) return next(new Error("No voucher code."));
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	query.equalTo("code", req.params.code);
	query.first({
		success: function(voucher) {
			if (!voucher) return next(new Error("No voucher found."));
			voucher.set("username", req.body.username == undefined ? voucher.get("username") : req.body.username);
			voucher.save(null, {
				success: function(voucher) {
					res.send({ voucher: voucher });
				}, error: function(error) {
					return next(error);
				}
			})
		}, error: function(error) {
			return next(error);
		}
	});
};

/*
 * POST activate voucher API.
 */

exports.activate = function(req, res, next) {
	if (!req.params.code) return next(new Error("No voucher code."));
	if (!req.body.username) return next(new Error("No username."));
	if (!req.body.character) return next(new Error("No character chosen."));
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	query.equalTo("code", req.params.code);
	query.first({
		success: function(voucher) {
			if (!voucher) return next(new Error("No voucher found."));
			var usageLimit = voucher.get("usageLimit");
			if (usageLimit == 0) {
				return next(new Error("Voucher not available." ));
			} else {
				if (usageLimit != -1) {
					voucher.set("usageLimit", usageLimit - 1);
					voucher.save(null, {
						success: function(voucher) {
							res.send({ voucher: voucher });
						}, error: function(error) {
							return next(error);
						}
					});
				}
				var query = new Parse.Query(Parse.User);
				query.equalTo("username", req.body.username);
				query.first({
					success: function(user) {
						if (!user) return next(new Error("User not found."));
						var ownedBundles = user.get("ownedBundles");
						if (ownedBundles[req.body.character]) return next(new Error("Character already owned."));
						ownedBundles[req.body.character] = Date.now();
						user.set("ownedBundles", ownedBundles);
						var ownedVouchers = user.get("ownedVouchers");
						if (ownedVouchers[req.params.code]) return next(new Error("Voucher already claimed."));
						ownedVouchers[req.params.code] = Date.now();
						user.set("ownedVouchers", ownedVouchers);
						user.save(null, {
							success: function(user) {
								res.send({ success: true });
							}, error: function(user, error) {
								return next(error);
							}
						});
					}, error: function(error) {
						return next(error);
					}
				});
			}
		}, error: function(error) {
			return next(error);
		}
	});
};

/*
 * DELETE delete voucher API.
 */

exports.delete = function(req, res, next) {
	if (!req.params.code) return next(new Error("No voucher code."));
	var Voucher = Parse.Object.extend("Voucher");
	var query = new Parse.Query(Voucher);
	query.equalTo("code", req.params.code);
	query.first({
		success: function(voucher) {
			if (!voucher) return next(new Error("No voucher found."));
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
