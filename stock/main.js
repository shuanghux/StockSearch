// Disable search button until nonempty input
$(document).ready(function(){
	var pattern = /^[\s]*$/;
    $("#input-0").keyup(function(){
    	$("#input-0").removeClass("redInput");
    	if(pattern.test($("#input-0").val())){
        	$("#getQuote").attr('disabled', 'disabled');
        } else {
        	$("#getQuote").removeAttr('disabled');
        }
    });
});

// Set fav list change TD
$(function(){
	$('.favChangeTd').each(function(){
	if($(this).hasClass('negTd')){
		$(this).append("<img src='http://cs-server.usc.edu:45678/hw/hw8/images/Down.png' style='height:1em'>");
	} else {
		$(this).append("<img src='http://cs-server.usc.edu:45678/hw/hw8/images/Up.png' style='height:1em'>");
	}
});
})

function refreshArrow(){
	$('.favChangeTd').each(function(){
		if($(this).find('img').length < 1) {
		    if($(this).hasClass('negTd')){
				$(this).append("<img src='http://cs-server.usc.edu:45678/hw/hw8/images/Down.png' style='height:1em'>");
			} else {
				$(this).append("<img src='http://cs-server.usc.edu:45678/hw/hw8/images/Up.png' style='height:1em'>");
			}
		}
	});
}



// return whether input is valid symbol, show appropiate message
function isInputValid(symb) {
	// console.log("verifying input");
	// var val = $("#input-0").val();
	var pattern1 = /^[a-zA-z]+$/;
	if(pattern1.test(symb)){
		hideContent("invalid_alert");
		return true;
	} else {
		showContent("invalid_alert");
		$("#input-0").addClass("redInput");
		return false;
	}
}

function showContent(thisId) {
	var div = document.getElementById(thisId);
	div.classList.remove("hidden");
}

function hideContent(thisId) {
	var div = document.getElementById(thisId);
	div.classList.add("hidden");
}

setInterval(function(){
	refreshArrow();
},1000)







// Initialize all data variable to be retrieved
var tableInfoJson,
	data_PRICE,
	data_SMA,
	data_EMA,
	data_STOCH,
	data_RSI,
	data_ADX,
	data_CCI,
	data_BBANDS,
	data_MACD,
	data_News,
	data_History,
	curr_symb,
	curr_chart;
var chartDataSet = new Array();
var chartOptions = [];
var imgUrls = [];

// Loading status
var keyWords = ['TABLE', 'PRICE', 'SMA', 'EMA', 'STOCH', 'RSI','ADX', 'CCI', 'BBANDS', 'MACD'];
var dataLoaded = new Array(10),
    historyLoaded,
	newsLoaded;

function initProgress() {
	hideContent("InfoContainer")
	keyWords.forEach(function(key){
		showContent("progress_"+key);
		if(key != 'TABLE'){
			hideContent("highchart_"+key);
		}
	});
	showContent("progress_HISTORY");showContent("progress_NEWS");
	hideContent("newsContainer");hideContent("historyContainer");
}

function initLoadStauts(){
	keyWords.forEach(function(key){
		dataLoaded[key] = false;
	});
	historyLoaded = false;
	newsLoaded = false;
}

function initAlert(){
	keyWords.forEach(function(key){
			hideContent("alert_"+key);
	});
	hideContent("alert_NEWS");
	hideContent("alert_HISTORY");
}

function activateChart(chartType) {
	dataLoaded[chartType] = true;
	hideContent("progress_"+chartType);
	showContent("highchart_"+chartType);
}

function isDataOk(type){
	var obj = chartDataSet[type.toUpperCase()];
	if(obj["Error Message"]){
		return false;
	} else {
		return true;
	}
}

function validateChartData(type){
	type = type.toUpperCase();
	dataLoaded[type] = true;
	hideContent("progress_"+type);
	if(isDataOk(type)){
		// console.log(type + "data validated");
		showContent("highchart_"+type);
		if(type!="PRICE"){
			loadChart(type);
		}
	} else {
		showContent("alert_"+type);
	}
}


// Initialize drawing frame
var myChart;

function search(){
	var symb = $("#input-0").val();
	reqInfo(symb);
}
function reqInfo(symb) {
	// console.log("reqInfo()" + symb);
	
	
	if(isInputValid(symb)) {
		console.log("valid input");
		initLoadStauts();
		initProgress();
		initAlert();
		var scope = angular.element($('#favListCtrDiv')).scope();
		scope.moveTo2();
		hideContent('favList');showContent('currentStock');
		scope.enableSlide();
		ajaxLoad(symb);
		setFavIcon();
	} else {
		// console.log("invalid input" + symb);
	}
}


function ajaxLoad(symb) {
	// Table Content
	curr_symb = symb.toUpperCase();
	// var apiUrl = "https://webdevbootcamp-shuanghu.c9users.io";
	var apiUrl = "http://shuang.us-east-1.elasticbeanstalk.com";
	var waitTime = 0;
	$('.nav-tabs a[data-target="#PRICE_div"]').tab('show');
	$.ajax({
			url: apiUrl +'/table/'+ symb,
			dataType: 'json'
		})
		.done(function(data) {
			//console.log(data);
			tableInfoJson = data;
			// console.log("table complete");
			showTable();
			hideContent("progress_TABLE");
			chartDataSet["TABLE"]=tableInfoJson;
			if(isDataOk("TABLE")){
				showContent("InfoContainer");
			} else {
				showContent("alert_TABLE");
			}
			
		})
		.fail(function() {
			// console.log("table error");
		})
		.always(function() {
		});
	// Price and Volume
	$.ajax({
			url: apiUrl+'/price/'+ symb,
			dataType: 'json'
		})
		.done(function(data) {
			//console.log(data);
			data_PRICE = data;
			chartDataSet["PRICE"] = data_PRICE;
			// console.log("price complete");
			dataLoaded["PRICE"] = true;
			hideContent("progress_PRICE");
			if(isDataOk("PRICE")){
				showContent("highchart_PRICE");
				showPrice();
			} else {
				showContent("alert_PRICE");
			}
			
			$.ajax({
				url: apiUrl+'/chart/sma/'+ symb,
				dataType: 'json'
			})
			.done(function(data) {
				//console.log(data);
				data_SMA = data;
				chartDataSet["SMA"] = data_SMA;
				// console.log("SMA complete");
				validateChartData("SMA");
			})
			.fail(function() {
				console.log("sma error");
			})
			.always(function() {
			});
		$.ajax({
				url: apiUrl+'/chart/ema/'+ symb,
				dataType: 'json'
			})
			.done(function(data) {
				//console.log(data);
				data_EMA = data;
				chartDataSet["EMA"] = data_EMA;
				// console.log("EMA complete");
				validateChartData("EMA");
			})
			.fail(function() {
				// console.log("Ema error");
			})
			.always(function() {
			});
		$.ajax({
				url: apiUrl+'/chart/stoch/'+ symb,
				dataType: 'json'
			})
			.done(function(data) {
				//console.log(data);
				data_STOCH = data;
				chartDataSet["STOCH"] = data_STOCH;
				// console.log("STOCH complete");
				validateChartData("STOCH");
			})
			.fail(function() {
				// console.log("STOCH error");
			})
			.always(function() {
			});
		$.ajax({
				url: apiUrl+'/chart/rsi/'+ symb,
				dataType: 'json'
			})
			.done(function(data) {
				//console.log(data);
				data_RSI = data;
				chartDataSet["RSI"] = data_RSI;
				// console.log("RSI complete");
				validateChartData("RSI");
			})
			.fail(function() {
				// console.log("RSI error");
			})
			.always(function() {
			});
		$.ajax({
				url: apiUrl+'/chart/ADX/'+ symb,
				dataType: 'json'
			})
			.done(function(data) {
				//console.log(data);
				data_ADX = data;
				chartDataSet["ADX"] = data_ADX;
				// console.log("ADX complete");
				validateChartData("ADX");
			})
			.fail(function() {
				// console.log("ADX error");
			})
			.always(function() {
			});
		$.ajax({
				url: apiUrl+'/chart/CCI/'+ symb,
				dataType: 'json'
			})
			.done(function(data) {
				//console.log(data);
				data_CCI = data;
				chartDataSet["CCI"] = data_CCI;
				// console.log("CCI complete");
				validateChartData("CCI");
			})
			.fail(function() {
				// console.log("CCI error");
			})
			.always(function() {

			});
		$.ajax({
				url: apiUrl+'/chart/BBANDS/'+ symb,
				dataType: 'json'
			})
			.done(function(data) {
				//console.log(data);
				data_BBANDS = data;
				chartDataSet["BBANDS"] = data_BBANDS;
				// console.log("BBANDS complete");
				validateChartData("BBANDS");
			})
			.fail(function() {
				// console.log("BBANDS error");
			})
			.always(function() {

			});
		$.ajax({
				url: apiUrl+'/chart/MACD/'+ symb,
				dataType: 'json'
			})
			.done(function(data) {
				//console.log(data);
				data_MACD = data;
				chartDataSet["MACD"] = data_MACD;
				validateChartData("MACD");
			})
			.fail(function() {
				// console.log("MACD error");
			})
			.always(function() {
			});
		$.ajax({
				url: apiUrl+"/history/" + symb,
				dataType: 'json'
			})
			.done(function(data) {
				//console.log(data);
				data_History = data;
				hideContent("progress_HISTORY");
				if(data_History["Error Message"]){
					showContent("alert_HISTORY");
				} else {
					showHistory();
					showContent("historyContainer");
					showHistory();
				}
			})
			.fail(function() {
				// console.log("history error");
			})
			.always(function() {
			});
		$.ajax({
				url: apiUrl+"/news/" + symb,
				dataType: 'json'
			})
			.done(function(data) {
				//console.log(data);
				data_News = data;
				// console.log("news complete")
				hideContent("progress_NEWS");
				if(data_News["Error Message"]){
					showContent("alert_NEWS");
				} else {
					showContent("newsContainer");
					showNews();
				}
			})
			.fail(function() {
				// console.log("news error");
			})
			.always(function() {
			});
		})
		.fail(function() {
			// console.log("price error");
		})
		.always(function() {
		});
	
}

function showTable(){
	var keys = Object.keys(tableInfoJson);
	var tableHTML = "<table><tbody>";
	var title, value;
	keys.forEach(function(key){
		title = key;
		if(key != "Change (Change Percent)"){
			value = tableInfoJson[title];
			if(key == "Volume"){
				value = parseInt(value).toLocaleString();
			}
			tableHTML += "<tr><th>"+title+"</th><td>"+value+"</td></tr>";
		} else {
			value = tableInfoJson[title];
			var pattern = /-/;
			if(pattern.test(value)){
				tableHTML += "<tr><th>"+title+"</th><td style='color: red;'>"+value+"<img src='http://cs-server.usc.edu:45678/hw/hw8/images/Down.png' style='height:1em;'>"+"</td></tr>";
			} else {
				tableHTML += "<tr><th>"+title+"</th><td style='color: green;'>"+value+"<img src='http://cs-server.usc.edu:45678/hw/hw8/images/Up.png' style='height:1em;'>"+"</td></tr>";
			}
		}
		
	});
	tableHTML += "</tbody></table>";
	$("#InfoContainer").html(tableHTML);
}

function favStock() {
	var stockName = curr_symb.toUpperCase();
	localStorage.setItem(stockName, JSON.stringify(tableInfoJson));
	var scope = angular.element($('#favListCtrDiv')).scope();
	scope.$apply(function(){
		scope.updateFavTable();
	});
}

function refreshFav(){
	var scope = angular.element($('#favListCtrDiv')).scope();
	scope.$apply(function(){
		scope.updateFavTable();
	});
}

function unfavStock(favSymb) {
	// console.log("trying to remove" +favSymb);
	localStorage.removeItem(favSymb.toUpperCase());
	var scope = angular.element($('#favListCtrDiv')).scope();
	scope.$apply(function(){
		scope.updateFavTable();
	});
}


function clickFav() {
	if(isFaved(curr_symb)) {
		var favBtn = document.getElementById("favBtn");
		favBtn.classList.remove("glyphicon-star");
		favBtn.classList.add("glyphicon-star-empty");
		favBtn.classList.remove("yellowStar");
		unfavStock(curr_symb);
	} else {
		var favBtn = document.getElementById("favBtn");
		favBtn.classList.add("glyphicon-star");
		favBtn.classList.remove("glyphicon-star-empty");
		favBtn.classList.add("yellowStar");
		favStock(curr_symb);
	}
}

function setFavIcon() {
	if(isFaved(curr_symb)) {
		var favBtn = document.getElementById("favBtn");
		favBtn.classList.add("glyphicon-star");
		favBtn.classList.add("yellowStar");
		favBtn.classList.remove("glyphicon-star-empty");
	} else {
		var favBtn = document.getElementById("favBtn");
		favBtn.classList.remove("glyphicon-star");
		favBtn.classList.add("glyphicon-star-empty");
		favBtn.classList.remove("yellowStar");
	}
}

function isFaved(symb) {
	if (localStorage.getItem(symb.toString().toUpperCase()) === null) {
		return false;
	} else {
		return true;
	}
}

function saveLineURL(type) {
	var chart = $("#highchart_"+type).highcharts();
	var obj = {};
    obj.svg = chart.getSVG();
    obj.type = 'image/png';
    obj.async = true;
    var exportUrl = 'http://export.highcharts.com/';
    $.ajax({
            type: "POST",
            url: exportUrl,
            data: obj,
            cache:false,
            async:true,
            crossDomain:true,
            success: function (data) {
                imgUrls[type] = exportUrl+data;
                shareFB();
            },
            error: function(data) {
            }
        });
}

function clickFB(){
	if(curr_chart == 'PRICE') {
		// console.log("shareFB()");
		shareFB();
	} else {
		// console.log("saveLine()");
		saveLineURL(curr_chart);
	}
}

function shareFB(){
	FB.getLoginStatus(function(response) {
	  if (response.status === 'connected') {
		  FB.ui(
			 {
			  method: 'feed',
			  picture: encodeURI(imgUrls[curr_chart])
			}, function(response){
				if(response && !response.error_code){
					alert("Successfully Posted!");
					console.log(response);
				} else {
					alert("Fail to Post");
				}
			});
		}
	  else {
	    FB.login();
	  }
	});
}

function pseudoClear(){
	localStorage.clear();
	$("#input-0").val("");
	curr_symb = "";
	var scope = angular.element($('#favListCtrDiv')).scope();
	scope.$apply(function(){
		scope.moveTo1();
		scope.disableSlide();
	});
	hideContent('currentStock');showContent('favList');
	$("#getQuote").attr('disabled', 'disabled');
}