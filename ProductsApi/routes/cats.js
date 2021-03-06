let router = require('express').Router()
let ctrl = require('../controllers/cats.js')
let auth = require('../controllers/auth')

const authMixin = [auth.requireAdmin]

router.get('/', ctrl.getAll)
router.get('/details', ctrl.getAllWithDetails)
router.get('/:cat', ctrl.getByCat)
router.post('/', ctrl.addCat)
router.delete('/:id', authMixin, ctrl.deleteCatCascade)

module.exports = router