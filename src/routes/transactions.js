const express = require('express');
const router = express.Router();

const transactionsService = require('../services/transactions');


router.get("/:hash", transactionsService.getTransactionByHash);
router.get("/pending", transactionsService.getPendingTransactions);
router.get("/:address", transactionsService.getTransactionsByAddress);
router.get('/latest', transactionsService.getLatestTransaction);

module.exports = router;