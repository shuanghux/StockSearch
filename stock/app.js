// hw8 app.js

var express = require("express");
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
var request = require('request');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
var moment = require('moment');

app.set("view engine", "ejs");
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
var parseString = require('xml2js').parseString;


var errRes = [];
var errObj = new Object();
errObj["Error Message"] = "Something's Wrong with Data Fetched";
errRes.push(errObj);


app.get("/", function(req, res) {
    res.render("home");
});

app.get("/table/:id", function(req, res) {
    var symbol = req.params.id;
    var url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + symbol + "&outputsize=full&apikey=6U7UOUY29CBEQ3VX";
    var fullObj;
    request(url, function (err, response, body){
        if( !err && response.statusCode == 200) {
            
            try {
                fullObj = JSON.parse(body);
                if(fullObj["Error Message"]) {
                    res.header("Content-Type",'application/json');
                res.send(JSON.stringify(errObj, null, 4));
                } else {
                    var myObj = new Object();
                    myObj["Stock Ticker Symbol"] = fullObj["Meta Data"]["2. Symbol"];
                    var dateKeys = Object.keys(fullObj["Time Series (Daily)"]);
                    var tempData = fullObj["Time Series (Daily)"][dateKeys[0]]["4. close"];
                    tempData = parseFloat(tempData).toFixed(2).toString();
                    myObj["Last Price"] = tempData;
                    var tempData2 = fullObj["Time Series (Daily)"][dateKeys[0]]["4. close"] - fullObj["Time Series (Daily)"][dateKeys[1]]["4. close"];
                    tempData2 = parseFloat(tempData2).toFixed(2);
                    tempData = tempData2*100/fullObj["Time Series (Daily)"][dateKeys[1]]["4. close"];
                    tempData = parseFloat(tempData).toFixed(2).toString();
                    myObj["Change (Change Percent)"] = tempData2 + "(" + tempData + "%)";
                    var marketClosed;
                    var lastFreshed = fullObj["Meta Data"]["3. Last Refreshed"];
                    if (lastFreshed.length < 11) {
                        lastFreshed += " 16:00:00 EST";
                        marketClosed = true;
                    } else {
                        var pattern = new RegExp("16:00:00");
                        if(lastFreshed.match(pattern)){
                            marketClosed = true;
                        } else {
                            marketClosed = false;
                        }
                        lastFreshed += "EST";
                    }
                    myObj["TimeStamp"] = lastFreshed;
                    myObj["Open"] = parseFloat(fullObj["Time Series (Daily)"][dateKeys[0]]["1. open"]).toFixed(2).toString();
                    if (marketClosed) {
                        myObj["Close"] = parseFloat(fullObj["Time Series (Daily)"][dateKeys[0]]["4. close"]).toFixed(2).toString();
                    } else {
                        myObj["Close"] = parseFloat(fullObj["Time Series (Daily)"][dateKeys[1]]["4. close"]).toFixed(2).toString();
                    }
                    tempData = fullObj["Time Series (Daily)"][dateKeys[0]]["2. high"];
                    tempData = parseFloat(tempData).toFixed(2);
                    tempData2 = fullObj["Time Series (Daily)"][dateKeys[0]]["3. low"];
                    tempData2 = parseFloat(tempData2).toFixed(2);
                    myObj["Day’s Range"] = tempData2 + " - " + tempData;
                    myObj["Volume"] = fullObj["Time Series (Daily)"][dateKeys[0]]["5. volume"];
                    
                    res.header("Content-Type",'application/json');
                    res.send(JSON.stringify(myObj, null, 4));
                }
            } catch(e) {
                res.header("Content-Type",'application/json');
                res.send(JSON.stringify(errObj, null, 4));
            }
        } else {
            res.header("Content-Type",'application/json');
            res.send(JSON.stringify(errObj, null, 4));
        }
    });
    
});

app.get("/price/:id",function(req, res) {
    var symbol = req.params.id;
    var url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" 
    + symbol + "&outputsize=full&apikey=6U7UOUY29CBEQ3VX";
    var fullObj;
    var dateKeys = new Array(136);
    request(url, function (err, response, body) {
        if( !err && response.statusCode == 200) {
            try {
                fullObj = JSON.parse(body);
                if(fullObj["Error Message"]) {
                    res.header("Content-Type",'application/json');
                res.send(JSON.stringify(errObj, null, 4));
                } else {
                    var seriesObj = new Object(), resJSON = new Object(), metaObj = new Object();
                    var fullKeys = Object.keys(fullObj["Time Series (Daily)"]);
                    for (var i = 0; i < 136; i++) {
                        dateKeys[i] = moment(fullKeys[i],"YYYY-MM-DD").format("MM/DD");
                    }
                    metaObj["Title"] = symbol.toUpperCase() + " Stock Price and Volume";
                    resJSON["Meta Data"] = metaObj;
                    dateKeys = dateKeys.reverse();
                    for (var i = 0; i < 136; i++) {
                        var seriesSubObj = new Object();
                        seriesSubObj["Stock Price"] = parseFloat(fullObj["Time Series (Daily)"][fullKeys[135-i]]["4. close"]).toFixed(2);
                        seriesSubObj["Volume"] = fullObj["Time Series (Daily)"][fullKeys[135-i]]["5. volume"];
                        seriesObj[dateKeys[i]] = seriesSubObj;
                    }
                    resJSON["Time Series (Daily)"] = seriesObj;
                    res.header("Content-Type",'application/json');
                    res.send(JSON.stringify(resJSON, null, 4));
                }
            } catch(e) {
                res.header("Content-Type",'application/json');
                res.send(JSON.stringify(errObj, null, 4));
            }
            
        }
    });
});


app.get("/SMA/:id", function(req, res) {
    var symbol = req.params.id;
    var url = "https://www.alphavantage.co/query?function=SMA&symbol=" + symbol 
    + "&interval=daily&time_period=10&series_type=close&apikey=6U7UOUY29CBEQ3VX";
    var fullObj;
    var dateKeys = new Array(136);
    request(url, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            fullObj = JSON.parse(body);
            var seriesObj = new Object(), resJSON = new Object(), metaObj = new Object();
            var fullKeys = Object.keys(fullObj["Technical Analysis: SMA"]);
            for (var i = 0; i < 136; i++) {
                dateKeys[i] = moment(fullKeys[i],"YYYY-MM-DD").format("MM/DD");
            }
            metaObj["Title"] = fullObj["Meta Data"]["2: Indicator"];
            resJSON["Meta Data"] = metaObj;
            dateKeys = dateKeys.reverse();
            for (var i = 0; i < 136; i++) {
                var seriesSubObj = new Object();
                seriesSubObj["SMA"] = parseFloat(fullObj["Technical Analysis: SMA"][fullKeys[i]]["SMA"]).toFixed(2);

                seriesObj[dateKeys[i]] = seriesSubObj;
            }
            resJSON["Technical Analysis: SMA"] = seriesObj;
            res.header("Content-Type",'application/json');
            res.send(JSON.stringify(resJSON, null, 4));
        }
    });
});


app.get("/EMA/:id", function(req, res) {
    var symbol = req.params.id;
    var url = "https://www.alphavantage.co/query?function=EMA&symbol=" + symbol 
    + "&interval=daily&time_period=10&series_type=close&apikey=6U7UOUY29CBEQ3VX";
    var fullObj;
    var dateKeys = new Array(136);
    request(url, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            fullObj = JSON.parse(body);
            var seriesObj = new Object(), resJSON = new Object(), metaObj = new Object();
            var fullKeys = Object.keys(fullObj["Technical Analysis: EMA"]);
            for (var i = 0; i < 136; i++) {
                dateKeys[i] = moment(fullKeys[i],"YYYY-MM-DD").format("MM/DD");
            }
            metaObj["Title"] = fullObj["Meta Data"]["2: Indicator"];
            resJSON["Meta Data"] = metaObj;
            dateKeys = dateKeys.reverse();
            for (var i = 0; i < 136; i++) {
                var seriesSubObj = new Object();
                seriesSubObj["EMA"] = parseFloat(fullObj["Technical Analysis: EMA"][fullKeys[i]]["EMA"]).toFixed(2);

                seriesObj[dateKeys[i]] = seriesSubObj;
            }
            resJSON["Technical Analysis: EMA"] = seriesObj;
            res.header("Content-Type",'application/json');
            res.send(JSON.stringify(resJSON, null, 4));
        }
    });
});


app.get("/chart/:type/:id", function(req, res) {
    var symbol = req.params.id;
    var type = req.params.type.toUpperCase();
    var url;
    switch (type) {
        case "SMA":
            url = "https://www.alphavantage.co/query?function=SMA&symbol=" 
            + symbol + 
            "&interval=daily&time_period=10&series_type=close&apikey=6U7UOUY29CBEQ3VX";
            break;
        case "EMA":
            url = "https://www.alphavantage.co/query?function=EMA&symbol=" 
            + symbol +
            "&interval=daily&time_period=10&series_type=close&apikey=6U7UOUY29CBEQ3VX";
            break;
        case 'STOCH':
            url = "https://www.alphavantage.co/query?function=STOCH&symbol=" 
            + symbol + "&slowkmatype=1&slowdmatype=1&interval=daily&apikey=6U7UOUY29CBEQ3VX";
            break;
        case 'RSI':
            url = "https://www.alphavantage.co/query?function=RSI&symbol=" 
            + symbol + 
            "&interval=daily&time_period=10&series_type=close&apikey=6U7UOUY29CBEQ3VX";
            break;
        case 'ADX':
            url = "https://www.alphavantage.co/query?function=ADX&symbol=" 
            + symbol + 
            "&interval=daily&time_period=10&apikey=6U7UOUY29CBEQ3VX";
            break;
        case 'CCI':
            url = "https://www.alphavantage.co/query?function=CCI&symbol=" 
            + symbol + "&interval=daily&time_period=10&apikey=6U7UOUY29CBEQ3VX";
            break;
        case 'BBANDS':
            url = "https://www.alphavantage.co/query?function=BBANDS&symbol=" 
            + symbol + 
            "&nbdevup=3&nbdevdn=3&interval=daily&time_period=5&series_type=close&apikey=6U7UOUY29CBEQ3VX";
            break;
        case 'MACD':
            url = "https://www.alphavantage.co/query?function=MACD&symbol=" 
            + symbol + "&interval=daily&series_type=close&apikey=6U7UOUY29CBEQ3VX";
            break;
        default:
            url = "https://www.alphavantage.co/query?function="+ type + "&symbol=" 
            + symbol + "&interval=daily&series_type=close&apikey=6U7UOUY29CBEQ3VX";
            break;
    }
    var fullObj;
    var dateKeys = new Array(136);
    request(url, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            fullObj = JSON.parse(body);
            if(fullObj["Error Message"]) {
                res.header("Content-Type",'application/json');
                res.send(JSON.stringify(errObj, null, 4));
            } else {
                var seriesObj = new Object(), resJSON = new Object(), metaObj = new Object();
                try {
                    var fullKeys = Object.keys(fullObj["Technical Analysis: " + type]);
                    for (var i = 0; i < 136; i++) {
                        dateKeys[i] = moment(fullKeys[i],"YYYY-MM-DD").format("MM/DD");
                    }
                    metaObj["Title"] = fullObj["Meta Data"]["2: Indicator"];
                    resJSON["Meta Data"] = metaObj;
                    dateKeys = dateKeys.reverse();
                    for (var i = 0; i < 136; i++) {
                        var seriesSubObj = new Object();
                        //seriesSubObj[type] = parseFloat(fullObj["Technical Analysis: " + type][fullKeys[i]][type]).toFixed(2);
        
                        seriesObj[dateKeys[i]] = fullObj["Technical Analysis: " + type][fullKeys[135-i]];
                    }
                    resJSON["Technical Analysis: " + type] = seriesObj;
                    res.header("Content-Type",'application/json');
                    res.send(JSON.stringify(resJSON, null, 4));
                } catch (e) {
                    res.header("Content-Type",'application/json');
                    res.send(JSON.stringify(errObj, null, 4));
                }
            }
            
        } else {
            res.header("Content-Type",'application/json');
            res.send(JSON.stringify(errObj, null, 4));
        }
    });
})


app.get("/autocomplete/:id", function(req, res) {
    var url = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input="
    + req.params.id;
    request(url, function(err, response, body) {
        if (!err && response.statusCode == 200) {
                res.send(body);
        }
    });
});


app.get("/history/:id", function(req, res) {
    var url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+
    req.params.id +"&outputsize=full&apikey=6U7UOUY29CBEQ3VX";
    request(url, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var count = 1000;
            try {
                var fullObj = JSON.parse(body);
                if(fullObj["Error Message"]) {
                    res.header("Content-Type",'application/json');
                    res.send(JSON.stringify(errObj, null, 4));
                } else {
                    var resArr = [];
                    var dateKeys = Object.keys(fullObj["Time Series (Daily)"]);
                    dateKeys.reverse();
                    dateKeys.forEach(function(date){
                        var todayPrice = fullObj["Time Series (Daily)"][date]["4. close"];
                        var dateObj = moment(date,"YYYY-MM-DD");
                        var todayObj = new Array(2);
                        todayObj[0] = parseInt(dateObj.valueOf());
                        todayObj[1] = parseFloat(todayPrice);
                        resArr.push(todayObj);
                    });
                    resArr = resArr.slice(resArr.length-1000,resArr.length);
                    res.header("Content-Type",'application/json');
                    res.send(JSON.stringify(resArr, null, 4));
                }
            } catch(e){
                res.header("Content-Type",'application/json');
                res.send(JSON.stringify(errObj, null, 4));
            }
            
            
            
            
        } else {
            res.header("Content-Type",'application/json');
            res.send(JSON.stringify(errObj, null, 4));
        }
    })
})


app.get("/news/:id", function(req, res) {
    var url = "https://seekingalpha.com/api/sa/combined/" + req.params.id +".xml";
    request(url,function(err, response, body) {
        if (!err && response.statusCode == 200) {
            try {
                parseString(body,  { explicitArray : false, ignoreAttrs : true }, function (error, result) {
                    if (error) {
                        res.send(error);
                    } else {
                        var fullObj = result;
                        var resObj = [];
                        var count = 0;
                        fullObj["rss"]["channel"]["item"].forEach(function(item){
                            var pattern = new RegExp('Article');
                            var typeInfo = item["guid"]
                            if (typeInfo.match(pattern)){
                                var newsObj = new Object();
                                if (count < 5){
                                    newsObj["title"] = item["title"];
                                    // newsObj["pubDate"] = item["pubDate"];
                                    var editedDate = item["pubDate"];
                                    editedDate = editedDate.substring(0,editedDate.length-5)+"EST";
                                    newsObj["pubDate"] = editedDate;
                                    newsObj["author"] = item["sa:author_name"];
                                    newsObj["link"] = item["link"];
                                    resObj.push(newsObj);
                                    count++;
                                }
                            }
                        });
                        res.header("Content-Type",'application/json');
                        res.send(JSON.stringify(resObj, null, 4));
                    }
                });
            } catch(e) {
                res.header("Content-Type",'application/json');
                res.send(JSON.stringify(errObj, null, 4));
            }
        } else {
            res.header("Content-Type",'application/json');
            res.send(JSON.stringify(errObj, null, 4));
        }
    });
})

app.listen(process.env.PORT, process.env.IP, function() {
   console.log("Server running..."); 
});