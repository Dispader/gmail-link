(window.myBookmarklet = function() {
	var hash = window.location["hash"];
	var threadID = hash.split("/")[1];
	alert(threadID);
	threadURL = "https://mail.google.com/a/umn.edu/#inbox/" + threadID;
	alert(threadURL);
})();
