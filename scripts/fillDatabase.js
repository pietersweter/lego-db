const fs = require('fs');
const Database = require('../services/Database');
const mongoose = require('mongoose');
const keys = require('../config/keys');

const db = new Database();

// Toggle only the collections that you actually want to fill in mLab
const FILLING_LEGO_SETS = true;
// const FILLING_BRICKS = true;

mongoose.connect(keys.mongoURI, () => {
  console.log('Successfully connected to DB!');

  // Fill Lego Sets collection
  if (FILLING_LEGO_SETS) {
    const legoSetsImages = require('../data/lego-sets.json');
    const legoSetsFileNames = fs.readdirSync(__dirname + '/../data/sets/');
    legoSetsFileNames.forEach(legoSetFileName => {
      legoSetFile = fs.readFileSync(`${__dirname}/../data/sets/${legoSetFileName}`, 'utf-8');
      let legoSet = { bricks: [] };
      try {
        let tmp = JSON.parse(legoSetFile);
        legoSet.legoSetID = tmp.Product.ProductNo;
        legoSet.name = tmp.Product.ProductName;
        legoSet.tags = legoSet.name.toLowerCase().split(' ');
        legoSet.imageURL = tmp.ImageBaseUrl + tmp.Product.Asset;
        tmp.Bricks.forEach(brick => {
          let tmpBrick = {};
          tmpBrick.id = brick.DesignId;
          tmpBrick.name = brick.ItemDescr;
          tmpBrick.imageURL = tmp.ImageBaseUrl + brick.Asset;
          legoSet.bricks.push(tmpBrick);
        });
        db.addLegoSet(legoSet);
      } catch (e) {
        console.log(e);
      }
    });
    console.log('Filled Lego Sets collection!');
  }

  if (FILLING_BRICKS) {
    const bricksFileNames = fs.readdirSync(`${__dirname}/../data/bricks/`);
    bricksFileNames.forEach(brickFileName => {
      brickFile = fs.readFileSync(`${__dirname}/../data/bricks/${brickFileName}/README.md`, 'utf-8').split('\n');
      let brick = {
        brickID: brickFile[1].split(' ')[1],
        name: brickFile[0].substring(2),
        imageURL: brickFile[2].substring(brickFile[2].indexOf('(')+1, brickFile[2].length - 1)
      };
      db.addBrick(brick);
    });
  }
  
});