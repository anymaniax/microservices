let router = require('express').Router()
let ctrl = require('../controllers/users')
let auth = require('../controllers/auth')

const authId = [auth.requireId]
const authMixin = [auth.requireAdmin]

router.post('/admins', authMixin, ctrl.makeAdmin)
router.delete('/admins', authMixin, ctrl.removeAdmin)

router.get('/', authMixin, ctrl.getAll)
router.get('/:id', authId, ctrl.getById)
router.post('/', ctrl.addUser)
router.post('/:username', ctrl.getByUandE)
router.delete('/:id',  authId, ctrl.delUser)
router.put('/:id', authId, ctrl.updateUser)
router.post('/pass/:id', authId, ctrl.updatePass)


module.exports = router