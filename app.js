var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

require('run-middleware')(app);

var request = require('request');
var cors = require('cors');

const assert = require(`assert`);

var apiai = require('apiai');
var apiAiApp = apiai("9190bb1c91a04f6cbf192738afa7e88e");

// Import Admin SDK
var admin = require("firebase-admin");

// Get a database reference to our blog
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://transaction-ai.firebaseio.com"
});

var db = admin.database();
var conversationRef = db.ref("conversation");

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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static('public'));

//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});
//
//if (app.get('env') === 'development') {
//  app.use(function(err, req, res, next) {
//    res.status(err.status || 500);
//    res.json({
//      message: err.message,
//      error: err
//    });
//  });
//}

app.options('*', cors());

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var alreadyLoaded = false;

conversationRef.on('value', function(snapshot) {
    if (alreadyLoaded) {
        var data = snapshot.val();
        var dataObject = data[Object.keys(data)[Object.keys(data).length - 1]];
        
        console.log(dataObject);
        
        if ((dataObject.senderId == 'jl4U4Z4cJqh8Ay0BPxNUhBGPyyZ2' || dataObject.senderId == 'ubAjTy8zl4VzX5wIgnRbpWDxqNe2') && (dataObject.text != null)) {
            console.log('/bot/' + dataObject.text);

            app.runMiddleware('/bot/' + dataObject.text, function(code,body,headers){
                console.log('Results:', body)
            });
        }
    } else {
        alreadyLoaded = true;
    }
    
});

app.get('/', cors(), function (req, res) {
    res.render('index');
});

app.get('/closePrice/:symbol/:date', function (req, res) {
    var data = require("./appl.json");
    var index = data.map(function(d) { return d['Date']; }).indexOf(req.params.date);
    
    res.status(200).json({
        body: data[index]
    });
});

app.get('/analytics/:symbol', function (req, res) {
    var units = 0;
    var costs = 0;
    
    var data = require("./" + req.params.symbol + ".json");
        
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

app.get('/visualizations/stock/:symbol', function (req, res) {
    var output = require("./" + req.params.symbol + ".json");
    
    res.status(200).json({
      output
    });
});

app.get('/bing/:queryText', function (req, res) {
    var options = {
      url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + req.params.queryText + '&offset=0&mkt=en-us&safeSearch=Strict&count=1',
      headers: {
        'Ocp-Apim-Subscription-Key': '83496853999546a69b91b4e65df92182'
      }
    };
    
    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        res.status(200).json({
            result: info.value[0].thumbnailUrl
        });
      }
    }
    
    request(options, callback);
});

app.get('/pieChart', function(req, res) {
    var chartURL = "";
    
    db.ref('transactions').once('value').then(function(snapshot) {
      var transactions = snapshot.val();
      var dictionary = {};
      var types = {};

      var output = [];

      for (var key of Object.keys(transactions)) {
          if (dictionary[transactions[key].category.toLowerCase()]) {
              dictionary[transactions[key].category.toLowerCase()] = dictionary[transactions[key].category.toLowerCase()] + transactions[key].cost;
          } else {
              dictionary[transactions[key].category.toLowerCase()] = transactions[key].cost;
              types[transactions[key].category.toLowerCase()] = transactions[key].type;
          }
      }

      for (var i = 0; i < Object.keys(dictionary).length; i++) {
          output.push({
            category: Object.keys(dictionary)[i],
            value: dictionary[Object.keys(dictionary)[i]],
            type: types[Object.keys(dictionary)[i].toLowerCase()]
          });
      }
//              db.ref('conversation/').push({
//                senderId: "nodeJSServer",
//                photoURL: ('https://chart.googleapis.com/chart?cht=p3&chd=t:' + ratios + '&chs=750x300&chl=' + labels)
//              });
      res.status(200).send({
            output
        });
    });
});

app.get('/bot/:queryText', function(req, res) {
    var request = apiAiApp.textRequest(req.params.queryText, {
        sessionId: generateUUID()
    });
 
    request.on('response', function(queryResponse) {
        var action = queryResponse.result.action;
        
        if (action == "showStocks") {
            db.ref('conversation/').push({
                senderId: "nodeJSServer",
                senderName: "12345",
                text: ("trai://symbol/" + queryResponse.result.parameters.stockSymbol)
            });
            
            res.status(200).json({
                action: "showStocks",
                parameters: queryResponse.result.parameters,
                link: ("trai://symbol/" + queryResponse.result.parameters.stockSymbol)
            });
        } else if (action == "pieChart") {
            var chartURL = "";
            
            db.ref('transactions').once('value').then(function(snapshot) {
              var transactions = snapshot.val();
              var dictionary = {};
                
              var ratios = "";
              var labels = "";
              
              for (var key of Object.keys(transactions)) {
                  if (dictionary[transactions[key].category.toLowerCase()]) {
                      dictionary[transactions[key].category.toLowerCase()] = dictionary[transactions[key].category.toLowerCase()] + transactions[key].cost;
                  } else {
                      dictionary[transactions[key].category.toLowerCase()] = transactions[key].cost;
                  }
              }
              
              for (var i = 0; i < Object.keys(dictionary).length; i++) {                  
                  ratios += dictionary[Object.keys(dictionary)[i]];
                  labels += Object.keys(dictionary)[i];
                  
                  if (i != Object.keys(dictionary).length - 1) {
                      ratios += ",";
                      labels += "%7C";
                  }
              }
                
//              db.ref('conversation/').push({
//                senderId: "nodeJSServer",
//                photoURL: ('https://chart.googleapis.com/chart?cht=p3&chd=t:' + ratios + '&chs=750x300&chl=' + labels)
//              });
              
              db.ref('conversation/').push({
                senderId: "nodeJSServer",
                senderName: "12345",
                text: ('https://chart.googleapis.com/chart?cht=p3&chd=t:' + ratios + '&chs=750x300&chl=' + labels)
              });
                            
              res.render('chart', {chartURL: 'https://chart.googleapis.com/chart?cht=p3&chd=t:' + ratios + '&chs=750x300&chl=' + labels});
            });
        } else if (action == "smalltalk.greetings") {
            db.ref('conversation/').push({
                senderId: "nodeJSServer",
                senderName: "12345",
                text: queryResponse.result.fulfillment.speech
            });
        } else  if (action == "unknownAction") {
            db.ref('conversation/').push({
                senderId: "nodeJSServer",
                senderName: "12345",
                text: "I'm not sure how to answer that!"
            });
        }
    });

    request.on('error', function(error) {
        console.log(error);
    });

    request.end();
    
    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };
});

module.exports = app;