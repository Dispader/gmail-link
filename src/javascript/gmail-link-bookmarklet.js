(window.myBookmarklet = function() {
	var hash = window.location["hash"];
	var threadID = hash.split("/")[1];
	threadURL = "https://mail.google.com/a/umn.edu/#inbox/" + threadID;
	alert(threadURL);
})();