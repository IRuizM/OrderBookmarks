"use strict";

chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		id: "order-bookmarks",
		title: "Order bookmarks",
		contexts: ["page"]
	});
});
chrome.commands.onCommand.addListener(function() {
        obtainBookmarks();
      });
chrome.contextMenus.onClicked.addListener(function(info, tab) {
	if (info.menuItemId == "order-bookmarks") {
		obtainBookmarks();
	}
});
var arr, n, async_i, sign;
function obtainBookmarks(){
	chrome.bookmarks.getTree(function(bookmarkItems){
		arr = [], async_i = [];
		n = 0;
		stop = true;
		sortBookmarks(bookmarkItems);
	});
}
function sortBookmarks(bookmarkItems) {
	var index = n;
	n++;
	if(stop){
		stop = false;
		arr[index] = bookmarkItems[0].children[0].children;
	}
	else{
		arr[index] = bookmarkItems.children;
	}
	for(var i = 0; i < arr.length; i++){
		if(isTreeNode(arr[index][i]))
			if(!isBookmark(arr[index][i]))
				if(arr[index][i].children.length > 0)
					sortBookmarks(arr[index][i]);	
		
	}
	arr[index].sort(function(a,b){ return (isBookmark(a) && !isBookmark(b))? 1 : (!isBookmark(a) && isBookmark(b)) ? -1 : (a.title.toLowerCase() > b.title.toLowerCase()) ? 1: ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0);});
	async_i[index] = 0;
	chrome.bookmarks.move(arr[index][async_i[index]].id, {index :async_i[index]}, function(bookmarkItem){
		onMoved(bookmarkItem, index);
	});
}
function isBookmark(item){
	return 'url' in item;
}
function isTreeNode(item){
	return typeof item != "undefined";
}
function onMoved(bookmarkItem, index){
	if(async_i[index] < arr[index].length-1){
		async_i[index]++;
		chrome.bookmarks.move(arr[index][async_i[index]].id, {index :async_i[index]}, function(newBookmarkItem){
			onMoved(newBookmarkItem, index);
		});
	}
}
function onRejected(){
	console.log("Failed to organize. Please try again, or upon further issue contact the developer.");
}