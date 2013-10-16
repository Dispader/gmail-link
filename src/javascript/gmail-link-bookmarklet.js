javascript:(function(){
	
	if ( window.jQuery === undefined ) {
		var done = false;
		var jQueryScript = document.createElement("script");
		jQueryScript.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js";
		jQueryScript.onload = jQueryScript.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				initMyBookmarklet();
			}
		};
		var urlShortenerScript = document.getElementsByTagName("head")[0].appendChild(urlShortenerScript);
		var urlShortenerScript = document.createElement("script");
		urlShortenerScript.src = "https://raw.github.com/hayageek/jQuery-URL-shortener/master/jquery.urlshortener.js";
		urlShortenerScript.onload = urlShortenerScript.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				initMyBookmarklet();
			}
		};
		document.getElementsByTagName("head")[0].appendChild(urlShortenerScript);		
	} else {
		initMyBookmarklet();
	}
	
	function initMyBookmarklet() {
		(window.myBookmarklet = function() {
			var hash = window.location["hash"];
			var threadID = hash.split("/")[1];
			threadURL = "https://mail.google.com/a/umn.edu/#inbox/" + threadID;
			window.prompt ("Copy to clipboard: Ctrl+C, Enter", threadURL);
		})();
	}
	
})();
