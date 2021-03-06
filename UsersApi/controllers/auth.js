require('../models/db')

let request = require('request')

module.exports.requireId = (req, res, next) => {
    let headers = {
        'x-access-token': req.headers['x-access-token']
    }
    request.get({
        url: AuthApi + "/userid",
        headers: headers
    }, function (error, response, body) {
        if (error) {
            res.status(500)
            return res.json({
                error: 'An unexpect error happened'
            })
        }
        if (!error && response.statusCode == 200) {
            let auth = JSON.parse(body)
            if (auth.success) {
                return next()
            }
        } else {
            res.status(401)
            return res.json({
                success: false,
                message: 'Failed to Authentication token.'
            });
        }
    });
}

module.exports.requireAdmin = (req, res, next) => {
    let headers = {
        'x-access-token': req.headers['x-access-token']
    }
    request.get({
        url: AuthApi + "/admin",
        headers: headers
    }, function (error, response, body) {
        if (error) {
            res.status(500)
            return res.json({
                error: 'An unexpect error happened'
            })
        }
        if (!error && response.statusCode == 200) {
            let auth = JSON.parse(body)
            if (auth.success) {
                return next()
            }
        } else {
            res.status(401)
            return res.json({
                success: false,
                message: 'Failed to Authentication token.'
            });
        }
    });
}