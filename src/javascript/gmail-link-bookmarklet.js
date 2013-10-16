(window.myBookmarklet = function() {
	var hash = window.location["hash"];
	alert(hash);
	var threadID = hash.split("/")[1];
	alert(threadID);
})();
