(window.myBookmarklet = function() {
	var hash = window.location["hash"];
	var threadID = hash.split("/")[1];
	alert(threadID);
})();
