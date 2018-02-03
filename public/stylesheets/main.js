$(document).ready(function(){
	var pattern = /^[\s]*$/;
    $("#input-0").keyup(function(){
    	if(pattern.test($("#input-0").val())){
        	$("#getQuote").attr('disabled', 'disabled');
        } else {
        	$("#getQuote").removeAttr('disabled');
        }
    });
});


var app = angular.module('myapp', ['ngMaterial'])
        .controller("autocompleteController", function($http){
          //http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=Apple
          this.querySearch = function(query){
            return $http.get("http://webdevbootcamp-shuanghu.c9users.io/autocomplete/"+query)
            .then(function(response){
              return response.data;
            })
          }
        });




var tableInfoJson;
function inputVerify(form) {
	console.log("verifying input");
	var val = form.name.value;
	var pattern1 = /^[a-zA-z]+$/;
	if(pattern1.test(val)){
		hideContent("invalid_alert");
		alert("error2");
		return true;
	} else {
		showContent("invalid_alert");
		alert("error");
		return false;
	}
}

function showContent(thisId) {
	console.log("showContent()");
	var div = document.getElementById(thisId);
	div.classList.remove("hidden");
}

function hideContent(thisId) {
	$("#" + thisID).classList.add("hidden");
}

function reqInfo() {
	console.log("reqInfo()");
	var symb = $("#input-0").val();
	$.ajax({
		url: 'https://webdevbootcamp-shuanghu.c9users.io/table/'+ symb,
		dataType: 'json'
	})
	.done(function(data) {
		//console.log(data);
		tableInfoJson = data;
		showTable();
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
}

function showTable(){
	var keys = Object.keys(tableInfoJson);
	var tableHTML = "<table>";
	var title, value;
	keys.forEach(function(key){
		title = key;
		value = tableInfoJson[title];
		tableHTML += "<tr><th>"+title+"</th><td>"+value+"</td></tr>";
	});
	tableHTML += "</table>";
	$("#InfoContainer").html(tableHTML);
}



