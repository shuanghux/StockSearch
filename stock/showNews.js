function showNews() {
	var myInner = "";
	data_News.forEach(function(news){
		var title = news["title"];
		var author = news["author"];
		var link = news["link"]
		var pubDate = news["pubDate"];
		myInner += "<div class='well'><h4><a target='_blank' href='" + link +"'>";
		myInner += title + "</a></h4><p>Author : " + author + "</p><p>Date: ";
		myInner += pubDate + "</p></div>";
		
	});
	document.getElementById("newsContainer").innerHTML = myInner;
}