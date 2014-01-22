
/*!
 * Sync Listeners, v0.1
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * The JavaScript component of the WebSocket set-up that supports syncing
 * navigation between browsers and content updates with the server.
 *
 * The WebSocket test is from Modernizr. It might be a little too strict for our purposes.
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/websockets.js
 *
 */

var wsn;
var wsnConnected = false;
var wsc;
var wscConnected = false;
var host = (window.location.host !== "") ? window.location.host : "127.0.0.1";

// handle page updates from one browser to another
function connectPageFollowSync() {

	if ('WebSocket' in window && window.WebSocket.CLOSING === 2) {
		
		var navSyncCopy = "Page Follow";
		wsn = new WebSocket("ws://"+host+":"+pageFollowPort+"/pagefollow");
		
		// when trying to open a connection to WebSocket update the pattern lab nav bar
		wsn.onopen = function () {
			wsnConnected = true;
			$('#navSyncButton').attr("data-state","on");
			$('#navSyncButton').addClass("connected");
			$('#navSyncButton').addClass("active");
			$('#navSyncButton').html(navSyncCopy+' On');
		};
		
		// when closing a connection (or failing to make a connection) to WebSocket update the pattern lab nav bar
		wsn.onclose = function () {
			wsnConnected = false;
			$('#navSyncButton').attr("data-state","off");
			if ($('#navSyncButton').hasClass("connected")) {
				$('#navSyncButton').removeClass("connected");
				$('#navSyncButton').removeClass("active");
			}
			$('#navSyncButton').html(navSyncCopy+' Disabled');
		};
		
		// when receiving a message from WebSocket update the iframe source
		wsn.onmessage = function (event) {
			
			var data = JSON.parse(event.data);
			var vpLocation  = document.getElementById('sg-viewport').contentWindow.location.href;
			var mLocation   = "http://"+host+data.url;
			
			if (vpLocation != mLocation) {
				
				document.getElementById('sg-viewport').contentWindow.location.replace(mLocation);
				
				// make sure the pop doesn't fire and push the pattern
				urlHandler.doPop = false;
				urlHandler.pushPattern(data.patternpartial);
				
				// reset the defaults
				urlHandler.doPop    = true;
				urlHandler.skipBack = false;
				
			}
		};
		
		// when there's an error update the pattern lab nav bar
		wsn.onerror = function () {
			wsnConnected = false;
			$('#navSyncButton').attr("data-state","off");
			if ($('#navSyncButton').hasClass("connected")) {
				$('#navSyncButton').removeClass("connected");
				$('#navSyncButton').removeClass("active");
			}
			$('#navSyncButton').html(navSyncCopy+' Disabled');
		};
		
	}
	
}
connectPageFollowSync();

// handle content updates generated by the watch
function connectAutoReloadSync() {
	
	if ('WebSocket' in window && window.WebSocket.CLOSING === 2) {
		
		var contentSyncCopy = "Auto-reload";
		
		wsc = new WebSocket("ws://"+host+":"+autoReloadPort+"/autoreload");
		
		// when trying to open a connection to WebSocket update the pattern lab nav bar
		wsc.onopen = function () {
			wscConnected = true;
			$('#contentSyncButton').attr("data-state","on");
			$('#contentSyncButton').addClass("connected");
			$('#contentSyncButton').addClass("active");
			$('#contentSyncButton').html(contentSyncCopy+' On');
		};
		
		// when closing a connection (or failing to make a connection) to WebSocket update the pattern lab nav bar
		wsc.onclose = function () {
			wscConnected = false;
			$('#contentSyncButton').attr("data-state","off");
			if ($('#contentSyncButton').hasClass("connected")) {
				$('#contentSyncButton').removeClass("connected");
				$('#contentSyncButton').removeClass("active");
			}
			$('#contentSyncButton').html(contentSyncCopy+' Disabled');
		};
		
		// when receiving a message from WebSocket reload the current frame adding the received timestamp
		// as a request var to, hopefully, bust caches... cachi(?)
		wsc.onmessage = function () {
			var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host;
			document.getElementById('sg-viewport').contentWindow.postMessage( { "reload": true }, targetOrigin);
		};
		
		// when there's an error update the pattern lab nav bar
		wsc.onerror = function () {
			wscConnected = false;
			$('#contentSyncButton').attr("data-state","off");
			if ($('#contentSyncButton').hasClass("connected")) {
				$('#contentSyncButton').removeClass("connected");
				$('#contentSyncButton').removeClass("active");
			}
			$('#contentSyncButton').html(contentSyncCopy+' Disabled');
		};
		
	}
	
}
connectAutoReloadSync();

// handle when a user manually turns navSync and contentSync on & off
$('#navSyncButton').click(function() {
	if ($(this).attr("data-state") == "on") {
		wsn.close();
		$(this).attr("data-state","off");
		$(this).removeClass("connected");
		$(this).removeClass("active");
		$(this).html('Nav Sync Off');
	} else {
		connectPageFollow();
		$(this).attr("data-state","on");
		$(this).addClass("connected");
		$(this).addClass("active");
		$(this).html('Nav Sync On');
	}
});

$('#contentSyncButton').click(function() {
	if ($(this).attr("data-state") == "on") {
		wsc.close();
		$(this).attr("data-state","off");
		$(this).removeClass("connected");
		$(this).removeClass("active");
		$(this).html('Content Sync Off');
	} else {
		connectAutoReloadSync();
		$(this).attr("data-state","on");
		$(this).addClass("connected");
		$(this).addClass("active");
		$(this).html('Content Sync On');
	}
});
