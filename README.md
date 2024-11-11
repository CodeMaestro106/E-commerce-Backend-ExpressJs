Node.js Authentication & Role-based Autorizaion API

router.get('/all-users', authenticate, authorize([config.roles.admin]), getAllUsers);git
router.delete('/all-users/:id', authenticate, authorize([config.roles.admin]), deleteUser);


here is conflict part
