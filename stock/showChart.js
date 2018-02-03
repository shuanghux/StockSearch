
function showPrice() {
	curr_chart="PRICE";
	var topkeys = Object.keys(data_PRICE);
	var title = data_PRICE[topkeys[0]]["Title"];
	var dates = Object.keys(data_PRICE[topkeys[1]]);
	var names = Object.keys(data_PRICE[topkeys[1]][dates[0]]);
	var prices = [], volumes = [];
	dates.forEach(function(date){
		prices.push(parseFloat(data_PRICE[topkeys[1]][date]["Stock Price"]));
		volumes.push(parseInt(data_PRICE[topkeys[1]][date]["Volume"]));
	});
	chartOptions['PRICE'] = {
			    chart: {
			        type: 'area',
			        pinchType: 'x',
			        zoomType: 'x'
			    },
			    title: {
			        text:  title
			    },
			    subtitle: {
			        text: 'Source: <a href="https://www.alphavantage.co/" target="_blank">' +
			            'Alpha Vantage</a>',
			        style: {
	                            color : '#0000EE'
	                        }
			    },
			    legend: {
			    	align: 'center',
                    verticalAlign: 'bottom',
                    x: 0,
                    y: 0
			    },
			    xAxis: {
			        "categories": dates,
			        tickInterval: 10
			    },
			    yAxis:[
				      {
				         title:{
				            text:"Stock Price"
				         },
				         labels:{
				            "format":"{value:,.2f}"
				         },
				         // tickInterval: 5,
				         labels: {
				            format: '{value:.0f}'
				        },
				         // max: 1.1*maxPri,
				         //min: 0.9*minPri
				      },
				      {
				         title:{
				            text:"Volume"
				         },
				         opposite:true,
				         // max: 4*maxVol
				      }
				   ],
			    tooltip: {
			        pointFormat: '{series.name} :<b>{point.y:,.2f}</b>'
			    },
			    series: [
			    {
			         type:"area",
			         name: names[0],
			         data: prices,
			         // threshold:null,
			         yAxis:0,
			         // tooltip:{
			         //    "pointFormat":"MSFT: {point.y:,..2f}"
			         // },
			         color:"#0000ff",
			         fillOpacity: 0.1,
			         marker:{
			            "enabled":false
			         }
      			},
      			{
			         type:"column",
			         name: names[1],
			         data: volumes,
			         yAxis:1,
			         color:"red",
			         tooltip: {
			        pointFormat: '{series.name} :<b>{point.y:,.0f}</b>'
			    }
			      }
			    ]
			};





	mychart = Highcharts.chart('highchart_PRICE', chartOptions['PRICE']);
	saveURL("PRICE")

	
	
};


function saveURL(type) {
	var data = {
	    options: JSON.stringify(chartOptions[type]),
	    type: 'image/png',
	    async: true
	};

	var exportUrl = 'http://export.highcharts.com/';
	$.post(exportUrl, data, function(data) {
	    var url = exportUrl + data;
	    // console.log("OPTIONS!!!");
	    // console.log(url);
		imgUrls[type] = url;
	});
}

function createEmptyChart(type) {
	var topkeys = Object.keys(data_PRICE);
	var datesArr = Object.keys(data_PRICE[topkeys[1]]);
	var chartVar = Highcharts.chart('highchart_'+type, {
						chart: {
					        type: 'line',
					        zoomType: 'x'
					    },
					    subtitle: {
					        text: 'Source: <a href="https://www.alphavantage.co/">' +
					            'Alpha Vantage</a>',
					        style: {
	                            color : '#0000EE'
	                        }
					    },
					    
					    legend: {
					    	align: 'center',
		                    verticalAlign: 'bottom',
		                    x: 0,
		                    y: 0
					    },
					    tooltip: {
					    	pointFormat: '{series.name}: {point.y}',
					    },
					    responsive: {
					        rules: [{
					            condition: {
					                maxWidth: 500
					            },
					            chartOptions: {
					                legend: {
					                    layout: 'horizontal',
					                    align: 'center',
					                    verticalAlign: 'bottom'
					                }
					            }
					        }]
					    }

					});
	return chartVar;
}


// function showSMA() {
// 	var topkeys = Object.keys(data_SMA);
// 	var title = data_SMA[topkeys[0]]["Title"];
// 	var dates = Object.keys(data_SMA[topkeys[1]]);
// 	var sma=[];
// 	dates.forEach(function(date) {
// 		sma.push(parseFloat(data_SMA[topkeys[1]][date]["SMA"]));
// 	});
// 	myChart = createEmptyChart();
// 	myChart.setTitle({ text: data_SMA["Meta Data"]["Title"]});
// 	myChart.xAxis[0].setCategories(
// 			dates
// 		);
// 	myChart.xAxis[0].setTickInterval(5);
// 	myChart.yAxis[0].setTitle({text: "SMA"});
// 	myChart.addSeries({
// 		name: title,
// 			data: sma,
// 			threshold:null,
// 			yAxis:0,
// 			color:"#f37f81",
// 			marker:{
// 				"enabled":true,
// 				radius: 2
// 			},
// 	})
// }

// function showEMA() {
// 	var topkeys = Object.keys(data_EMA);
// 	var title = data_EMA[topkeys[0]]["Title"];
// 	var dates = Object.keys(data_EMA[topkeys[1]]);
// 	var ema=[];
// 	dates.forEach(function(date) {
// 		ema.push(parseFloat(data_EMA[topkeys[1]][date]["EMA"]));
// 	});
// 	myChart = createEmptyChart();
// 	myChart.setTitle({ text: data_EMA["Meta Data"]["Title"]});
// 	myChart.xAxis[0].setCategories(
// 			dates
// 		);
// 	myChart.xAxis[0].setTickInterval(5);
// 	myChart.yAxis[0].setTitle({text: "EMA"});
// 	myChart.addSeries({
// 		name: title,
// 			data: ema,
// 			threshold:null,
// 			yAxis:0,
// 			color:"#f37f81",
// 			marker:{
// 				"enabled":true,
// 				radius: 2
// 			},
// 	})
// }


function loadChart(type) {
	if(dataLoaded[type.toUpperCase()] && isDataOk(type)){
		var jsonObj = chartDataSet[type.toUpperCase()];
		var topkeys = Object.keys(jsonObj);
		var title = jsonObj[topkeys[0]]["Title"];
		var dates = Object.keys(jsonObj[topkeys[1]]);
		var dataTitles = Object.keys(jsonObj[topkeys[1]][dates[0]]);
		// dataSets contains several series of properties, such as low, high.
		var dataSets = new Array(Object.keys(jsonObj[topkeys[1]][dates[0]]).length);
		for(var i = 0; i < dataTitles.length; i++) {
			dataSets[i] = [];
			dates.forEach(function(date) {
				dataSets[i].push(parseFloat(jsonObj[topkeys[1]][date][dataTitles[i]]));
			});
		}
		myChart = createEmptyChart(type);
		myChart.setTitle({ text: jsonObj["Meta Data"]["Title"]});
		myChart.xAxis[0].setCategories(
				dates
			);
		myChart.xAxis[0].setTickInterval(5);
		myChart.yAxis[0].setTitle({text: type.toUpperCase()});
		for (var i = 0; i < dataTitles.length; i++) {
			myChart.addSeries({
				name: curr_symb+ " "+dataTitles[i],
				data: dataSets[i],
				threshold:null,
				yAxis:0,
				marker:{
					"enabled":true,
					radius: 1
				},
			})
		}
		//saveLineURL(type);
	}
}

