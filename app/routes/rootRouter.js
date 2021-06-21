const router = require("express").Router();
const rootController = require('../controllers/rootController')

router
    .route('/')
    .get(rootController.get)
    .post(rootController.post);


module.exports = router;
