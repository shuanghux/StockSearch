// Setup Angular for autocomplete
var app = angular.module('myapp', ['ngMaterial','ui.toggle']);
app.controller("autocompleteController", function($http){
          //http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=Apple
          this.querySearch = function(query){
            return $http.get("http://Stocksearch-env.eztzb6ipwk.us-west-2.elasticbeanstalk.com/autocomplete/"+query)
            .then(function(response){
              return response.data;
            })
          }
        });

// toggle between two panels
app.controller("panelController", function($scope){
  $scope.onFrontPage = true;
  $scope.moveTo2 = function() {
    $scope.onFrontPage = false;
  };
  $scope.moveTo1 = function() {
    $scope.onFrontPage = true;
  }
});


app.controller("favListContoller", function($scope, $window){
  $scope.onFrontPage = true;
  $scope.moveTo2 = function() {
    $scope.onFrontPage = false;
  };
  $scope.moveTo1 = function() {
    $scope.onFrontPage = true;
  }

  $scope.negReg = /-/;

  $scope.chartNotLoaded = true;
  $scope.enableSlide = function(){
    $scope.chartNotLoaded = false;
  }

  $scope.disableSlide = function(){
    $scope.chartNotLoaded = true;
  }
  $scope.updateFavTable = function() {
    var keys = Object.keys($window.localStorage);
    $scope.favArr =[];
    keys.forEach(function(key){
      try {
        var fullObj = JSON.parse($window.localStorage.getItem(key));
        var favObj = new Object();
        var changeStr = fullObj["Change (Change Percent)"];
        var changePattern = new RegExp('^([^(]*)');
        var percentPattern = /\((.*)%/;
        favObj["title"] = fullObj["Stock Ticker Symbol"].toUpperCase();
        favObj["price"] = parseFloat(fullObj["Last Price"]);
        favObj["change"] = changePattern.exec(changeStr)[1];
        favObj["percent"] = percentPattern.exec(changeStr)[1];
        favObj["volumeStr"] = parseFloat(fullObj["Volume"]).toLocaleString();
        favObj["volume"] = parseFloat(fullObj["Volume"]);
        $scope.favArr.push(favObj);
      } catch(e){
        var favObj = new Object();
        favObj["title"] = key;
        favObj["price"] = "NA";
        favObj["change"] = "NA";
        favObj["percent"] = "NA";
        favObj["volume"] = "NA";
        $scope.favArr.push(favObj);
      }
    });
  }


  $scope.refreshFavData = function(){
    var keys = Object.keys($window.localStorage);
    keys.forEach(function(key){
      var apiUrl = "https://Stocksearch-env.eztzb6ipwk.us-west-2.elasticbeanstalk.com";
      $.ajax({
          url: apiUrl +'/table/'+ key,
          dataType: 'json'
        })
        .done(function(data) {
          //console.log(data);
          // console.log("update fav " + key);
          $window.localStorage.setItem(key, JSON.stringify(data));
          refreshFav();
        })
        .fail(function() {
          // console.log("table error");
        })
        .always(function() {
        });
    });
  }

  $scope.updateFavTable();
  $scope.deleteStock = function(symb) {
    symb = symb.toUpperCase();
    localStorage.removeItem(symb);
    $scope.updateFavTable();
  }
  

  $scope.changeType = function() {
    var typeSort = $scope.selectedType;
    switch(typeSort){
      case 'default':
        $scope.sortType     = 'title'; // set the default sort type
        $scope.sortReverse  = false;  // set the default sort order
        $scope.isOrderDisabled = true;
        break;
      case 'symbol':
        $scope.sortType     = 'title';
        $scope.isOrderDisabled = false;
        break;
      case 'price':
        $scope.sortType     = 'price';
        $scope.isOrderDisabled = false;
        break;
      case 'change':
        $scope.sortType     = 'change';
        $scope.isOrderDisabled = false;
        break;
      case 'percent':
        $scope.sortType     = 'percent';
        $scope.isOrderDisabled = false;
        break;
      case 'volume':
        $scope.sortType     = 'volume';
        $scope.isOrderDisabled = false;
        break;
    }
  }

  $scope.changeOrder = function() {
    var typeOrder = $scope.selectedOrder;
    switch(typeOrder) {
      case 'asc':
        $scope.sortReverse = false;
        break;
      case 'des':
        $scope.sortReverse = 'reverse';
        break;
    }
  }
  $scope.sortSymbol = function() {
    $scope.sortType = 'title';
  }
  $scope.sortPrice = function() {
    $scope.sortType = 'price';
  }
  $scope.sortChange = function() {
    $scope.sortType = 'change';
  }
  $scope.sortPercent = function() {
    $scope.sortType = 'percent';
  }
  $scope.sortVolume = function() {
    $scope.sortType = 'volume';
  }

  $scope.favItemGetQuote = function(symb){
    $window.reqInfo(symb);
    $window.setFavIcon();
  }
  setInterval(function(){ 
    if($scope.toggleRefreshValue){
      // console.log("auto refresh");
      $scope.refreshFavData();
    }
  }, 5000);
});

