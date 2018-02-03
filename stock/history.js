function showHistory() {

    // var dates = Object.keys(data_History["Time Series (Daily)"]);
    // dates.reverse();
    // var price = [];
    // dates.forEach(function(date){
    //     price.push(parseFloat(data_History["Time Series (Daily)"][date]["4. close"]));
    // });
    // console.log(document.getElementById("currentStock").offsetWidth);
    var chart = Highcharts.stockChart('historyContainer', {
        chart: {
            // height: 400,
            // width: document.getElementById("currentStock").offsetWidth-20
        },

        title: {
            text: curr_symb + " Stock Value"
        },
        subtitle: {
            text: 'Source: <a href="https://www.alphavantage.co/" target="_blank">' +
                        'Alpha Vantage</a>'
        },

        rangeSelector: {
            buttons: [{
                        type: 'week',
                        count: 1,
                        text: '1w'
                    },{
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
            selected: 0
        },
        tooltip: {
            xDateFormat: '%A,%b %d,%Y',
            shared: true,
            split: false,
        },

        series: [{
            name: curr_symb,
            data: data_History,
            type: 'area',
            threshold: null,
            tooltip: {
                valueDecimals: 2
            }
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    
                    rangeSelector : {
                       inputEnabled:false
                    },
                }
            }]
        }
    });
    chart.reflow();
}
