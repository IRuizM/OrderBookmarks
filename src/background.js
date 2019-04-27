"use strict";
chrome.browserAction.onClicked.addListener(function(){
  getRoot();
});
chrome.commands.onCommand.addListener(function(){
  getRoot();
});
var root
function getRoot(){
  chrome.bookmarks.getTree(function(bookmarkItems){
    root = bookmarkItems[0].children[0];
    sortBookmarks(bookmarkItems[0].children[0]);
  });
}
function sortBookmarks(node){
  node.children.sort(function(a,b){ 
    return (isBookmark(a) && !isBookmark(b)) ?
	    1 : (!isBookmark(a) && isBookmark(b)) ?
	    -1 : (a.title.toLowerCase() > b.title.toLowerCase()) ?
	    1: ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0);
  });
  var async_i = 0;
  chrome.bookmarks.move(node.children[async_i].id, {index :async_i}, function(bookmarkItem){
    onMoved(bookmarkItem, node.children, async_i);
  });
  getSubTrees(node.children);
}
function getSubTrees(arr){
  for(var i = 0; i < arr.length; i++){
    if(isTreeNode(arr[i]))
      if(!isBookmark(arr[i]))
        if(arr[i].children.length > 0)
          sortBookmarks(arr[i]);	
	}
}
function isBookmark(item){
  return 'url' in item;
}
function isTreeNode(item){
  return typeof item != "undefined";
}
function onMoved(bookmarkItem, arr, async_i){
  if(async_i < arr.length-1){
    async_i++;
    chrome.bookmarks.move(arr[async_i].id, {index :async_i}, function(newBookmarkItem){
      onMoved(newBookmarkItem, arr, async_i);
	});
  }
}
function onRejected(){
	console.log("Failed to organize. Please try again, or upon further issue contact the developer.");
}