var Paypal = require('paypal-express-checkout')
require('../models/db')

let Transaction = require('../models/transaction')
let Pay = require('../models/pay')
let request = require('request')

module.exports.pay = (req, res) => {
    let cart = req.body.cart
    let price = 0
    let i = 0;
    let desc = "";
    if (cart) {
        if (req.params.id) {
            for (let prod of cart) {
                request.get(ProductApi + "products/" + prod.id, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        let product = JSON.parse(body)
                        if (product) {
                            price += product.price.value * prod.quantity
                            if (i != cart.length - 1) {
                                desc += product.nom + " - " + product.price.value + "€" + " x" + prod.quantity + " + "
                            } else {
                                desc += product.nom + " - " + product.price.value + "€" + " x" + prod.quantity
                            }
                            i++
                        } else {
                            let index = cart.indexOf(prod)
                            if (index > -1) {
                                cart.splice(index, 1)
                            }
                        }

                        if (i == cart.length) {
                            if (price == 0) {
                                return res.json({
                                    error: "Could not create this transaction"
                                })
                            } else {
                                let transaction = Transaction({
                                    "amount": price,
                                    "cart": cart,
                                    "userId": req.params.id
                                })
                                transaction.save((err, pay) => {
                                    if (err) {
                                        res.status(406)
                                        console.log(err)
                                        return res.json({
                                            error: "Could not create this transaction"
                                        })
                                    }
                                    let paypal = Paypal.init(InfoPaypal.username, InfoPaypal.password, InfoPaypal.signature, 'http://localhost:5000/api/v1/pay/valid/' + transaction._id, 'http://localhost:5000/api/v1/pay/valid/' + transaction._id, true);
                                    paypal.pay(transaction._id, transaction.amount, desc, 'EUR', true, function (err, url) {
                                        if (err) {
                                            console.log(err)
                                            res.json({
                                                success: false,
                                                message: 'Payement failed.'
                                            })
                                        }
                                        res.status(200)
                                        res.json({
                                            success: true,
                                            url: url
                                        })
                                    })
                                })
                            }
                        }
                    } else {
                        res.status(406)
                        return res.json({
                            error: "Could not create this transaction"
                        })
                    }
                });
            }
        } else {
            res.status(406)
            return res.json({
                error: "Could not create this transaction"
            })
        }
    } else {
        res.status(406)
        return res.json({
            error: "Could not create this transaction"
        })
    }
}

module.exports.valid = (req, res) => {
    if (req.params.id) {
        let query = req.query
        console.log(query);
        if (query.PayerID && query.token) {
            let paypal = Paypal.init(InfoPaypal.username, InfoPaypal.password, InfoPaypal.signature, 'http://localhost:3000/', 'http://localhost:3000/', true);
            paypal.detail(query.token, query.PayerID, function (err, data, invoiceNumber, price) {
                if (err) {
                    console.log(err)
                    return
                }

                if (data.success) {
                    Transaction.findOne({
                        '_id': req.params.id
                    }, (err, transaction) => {
                        if (err) {
                            console.log(err)
                            res.status(500)
                            res.redirect('http://localhost:3000/checkout/error')
                        }
                        let pay = Pay({
                            "amount": transaction.amount,
                            "cart": transaction.cart,
                            "userId": transaction.userId,
                            "payerId": query.PayerID,
                            "token": query.token
                        })
                        pay.save((err, pay) => {
                            if (err) {
                                res.status(406)
                                console.log(err)
                                res.status(500)
                                res.redirect('http://localhost:3000/checkout/error')
                            }
                            transaction.remove();
                            res.status(200)
                            res.status(200)
                            res.json({
                                success: true
                            })
                        })
                    })
                } else {
                    Transaction.findOneAndRemove({
                        '_id': req.params.id
                    }, (err, transaction) => {
                        if (err) {
                            res.status(500)
                            res.redirect('http://localhost:3000/checkout/error')
                        }

                        res.status(204)
                        res.redirect('http://localhost:3000/checkout/error')
                    })
                }


            })
        } else if (query.token) {
            Transaction.findOneAndRemove({
                '_id': req.params.id
            }, (err, transaction) => {
                if (err) {
                    console.log(err)
                    res.status(500)
                    res.redirect('http://localhost:3000/checkout/error')
                }

                res.status(200)
                res.json({
                    success: false
                })
            })
        } else {
            return res.json({
                error: "Could not finish this transaction"
            })
        }
    } else {
        return res.json({
            error: "Could not finish this transaction"
        })
    }
}


module.exports.getByUserPayement = (req, res) => {
    Pay.find({
        "userId": req.params.id
    }, (err, pay) => {
        console.log('PAYYYYYY\n', pay)
        if (!pay) {
            res.status(404)
            res.json({
                err: "No payement found :("
            })
        }

        if (err) {
            res.status(500)
            return res.json({
                err: "An unexpect error happened"
            })
        }
        let allPay = []
        for (let p of pay) {
            let ByPay = {
                _id: p._id,
                cart: p.cart
            }
            allPay.push(ByPay)
        }
        console.log(allPay)
        res.status(200)
        return res.json(allPay)
    })
}

module.exports.getAllPayement = (req, res) => {
    Pay.find((err, pay) => {
        if (!pay) {
            res.status(404)
            res.json({
                err: "No payement found :("
            })
        }

        if (err) {
            res.status(500)
            return res.json({
                err: "An unexpect error happened"
            })
        }

        let allPay = []
        for (let p of pay) {
            let ByPay = {
                _id: p._id,
                cart: p.cart
            }
            allPay.push(ByPay)
        }
        res.status(200)
        return res.json(allPay)
    })
}

module.exports.getById = (req, res) => {
    Pay.findOne({
        "_id": req.params.id
    }, (err, pay) => {
        if (!pay) {
            res.status(404)
            res.json({
                err: "No payement found :("
            })
        }

        if (err) {
            res.status(500)
            return res.json({
                err: "An unexpect error happened"
            })
        }
        const cartLength = pay.cart.length;
        let newCart = []
        let i = 0;
        for (const item of pay.cart) {
            request.get(ProductApi + "/" + item.id, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let product = JSON.parse(body)
                        ++i
                    newCart.push({
                        product,
                        quantity: item.quantity
                    })
                    if (i == cartLength) {
                        res.status(200)
                        console.log(newCart);
                        return res.json({
                            cart: newCart
                        })
                    }
                }
            });
        }
    })
}