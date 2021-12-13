const express = require('express');
const router = express.Router();

const addressesService = require('../services/addresses');

router.get("/:addressHash", addressesService.getAccountBalance);

module.exports = router;