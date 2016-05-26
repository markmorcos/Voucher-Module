exports.voucher = require('./voucher');
exports.user = require('./user');

/*
 * GET home page.
 */

exports.index = function(req, res, next) {
	req.collections.vouchers.find({ published: true }, { sort: { _id: -1 } }).toArray(function(error, vouchers) {
		if (error) return next(error);
		res.render('index', { vouchers: vouchers });
	})
};
