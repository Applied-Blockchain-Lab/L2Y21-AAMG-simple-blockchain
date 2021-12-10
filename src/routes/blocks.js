const express = require('express');
const router = express.Router();

const blocksService = require('../services/blocks');

router.get("/latest", blocksService.getLatestBlock);
router.get("/", blocksService.getAllBlocks);
router.get("/:hash", blocksService.getBlockByHash);

module.exports = router;