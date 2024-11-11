Node.js Authentication & Role-based Autorizaion API

router.get('/all-users', authenticate, authorize([config.roles.admin]), getAllUsers);
router.put('/all-users/:id', authenticate, authorize([config.roles.admin]), updateUserInfoByAdmin);
router.delete('/all-users/:id', authenticate, authorize([config.roles.admin]), deleteUser);
