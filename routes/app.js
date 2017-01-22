var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var request = require('request');

var cors = require('cors');

var to_json = require('xmljson').to_json;

// Import Admin SDK
var admin = require("firebase-admin");

// Get a database reference to our blog
var serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://transaction-ai.firebaseio.com"
});

var db = admin.database();
var ordersRef = db.ref("orders");

var starterDB = [
       {
          "cost":"12.59",
          "what": "20 Pack - Marlboro Gold",
          "where": {
              "name": "Shell",
              "lng": "35.790417",
              "lat": "-78.847513"
          },
          "when": "2016-11-10",
          "type": "bad",
          "category": "cigarettes"
       }, {
          "cost":"9.00",
          "what": "649 Lottery Ticket",
          "where": {
              "name": "Shoppers Drug Mart",
              "lng": "53.517998",
              "lat": "-113.512520"
          },
          "when": "2016-11-11",
          "type": "bad",
          "category": "lottery"
       }, {
          "cost":"89.48",
          "what": "Gas",
          "where": {
              "name": "Shell",
              "lng": "35.790417",
              "lat": "-78.847513"
          },
          "when": "2016-11-16",
          "type": "good",
          "category": "gas"
       }, {
          "cost":"109.99",
          "what": "Cisco RV110WACAK9CA VPN Router",
          "where": {
              "name": "Best Buy",
              "lng": "43.842498",
              "lat": "-79.416346"
          },
          "when": "2016-11-10",
          "type": "good",
          "category": "appliances"
       }, {
          "cost":"199.99",
          "what": "Google Home",
          "where": {
              "name": "Best Buy",
              "lng": "43.842498",
              "lat": "-79.416346"
          },
          "when": "2016-11-10",
          "type": "good",
          "category": "appliances"
       }, {
          "cost":"41.72",
          "what": "McDonalds",
          "where": {
              "name": "McDonalds",
              "lng": "35.800604",
              "lat": "-78.830346"
          },
          "when": "2015-11-25",
          "type": "bad",
          "category": "food"
       }, {
          "cost":"33.56",
          "what": "Burger King",
          "where": {
              "name": "Burger King",
              "lng": "36.437363",
              "lat": "-81.482388"
          },
          "when": "2016-05-23",
          "type": "bad",
          "category": "Food"
       }, {
          "cost":"5.66",
          "what": "Milk",
          "where": {
              "name": "Sobeys",
              "lng": "43.640507",
              "lat": "-79.394087"
          },
          "when": "2016-11-16",
          "type": "good",
          "category": "grocery"
       }, {
          "cost":"3.24",
          "what": "Bananas",
          "where": {
              "name": "Sobeys",
              "lng": "43.640507",
              "lat": "-79.394087"
          },
          "when": "2016-11-16",
          "type": "good",
          "category": "grocery"
       }, {
          "cost":"8.87",
          "what": "Meat",
          "where": {
              "name": "Sobeys",
              "lng": "43.640507",
              "lat": "-79.394087"
          },
          "when": "2016-11-16",
          "type": "good",
          "category": "grocery"
       }
    ];

router.use(cors());

router.get('/', cors(), function (req, res, next) {
    res.render('index');
});

router.get('/closePrice/:symbol/:date', function (req, res, next) {
    var data = require("../appl.json");
    var index = data.map(function(d) { return d['Date']; }).indexOf(req.params.date);
    
    res.status(200).json({
        body: data[index]
    });
});

router.get('/analytics/:symbol', function (req, res, next) {
    var units = 0;
    var costs = 0;
    
    var data = require("../" + req.params.symbol + ".json");
        
    starterDB.map(function(item) {
        if (item.type == "bad") {
            var index = data.map(function(d) { return d['Date']; }).indexOf(item.when);
                
            if (index != -1) {
                units = units + (parseFloat(item.cost) / data[index].Close);
                costs = costs + parseFloat(item.cost);
            }
        }
    });
    
    res.status(200).json({
        success: true,
        costs: costs + "",
        stockReturns: units * data[0].Close * 1.35 + ""
        // 1.35 to convert from USD to CAD
    });
});

router.get('/visualizations/stock/:symbol', function (req, res, next) {
    var data = require("../" + req.params.symbol + ".json");
    
    res.render('stockVisuals', {stockData: JSON.stringify(data), symbol: req.params.symbol});
});

module.exports = router;