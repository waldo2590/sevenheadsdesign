/*!
 * Basic postMessage Support - v0.1
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Handles the postMessage stuff in the pattern, view-all, and style guide templates.
 *
 */

// alert the iframe parent that the pattern has loaded assuming this view was loaded in an iframe
if (self != top) {
	
	// handle the options that could be sent to the parent window
	//   - all get path
	//   - pattern & view all get a pattern partial, styleguide gets all
	//   - pattern shares lineage
	var path = window.location.toString();
	var parts = path.split("?");
	var options = { "path": parts[0] };
	options.patternpartial = (patternPartial !== "") ? patternPartial : "all";
	if (lineage !== "") {
		options.lineage = lineage;
	}
	
	var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host;
	parent.postMessage(options, targetOrigin);
	
	// find all links and add an onclick handler for replacing the iframe address so the history works
	var aTags = document.getElementsByTagName('a');
	for (var i = 0; i < aTags.length; i++) {
		aTags[i].onclick = function(e) {
			e.preventDefault();
			var href = this.getAttribute("href");
			if (href != "#") {
				window.location.replace(href);
			}
		};
	}
	
}

// if there are clicks on the iframe make sure the nav in the iframe parent closes
var body = document.getElementsByTagName('body');
body[0].onclick = function() {
	var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host;
	parent.postMessage( { "bodyclick": "bodyclick" }, targetOrigin);
};

// watch the iframe source so that it can be sent back to everyone else.
function receiveIframeMessage(event) {
	
	var path;
	
	// does the origin sending the message match the current host? if not dev/null the request
	if ((window.location.protocol != "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
		return;
	}
	
	// see if it got a path to replace
	if (event.data.path !== undefined) {
		
		if (patternPartial !== "") {
			
			// handle patterns and the view all page
			var re = /patterns\/(.*)$/;
			path = window.location.protocol+"//"+window.location.host+'/patterns'+window.location.pathname.replace(re,'')+event.data.path+'?'+Date.now();

			window.location.replace(path);
			
		} else {
			
			// handle the style guide
			path = window.location.protocol+"//"+window.location.host+window.location.pathname.replace("styleguide\/html\/styleguide.html","")+event.data.path+'?'+Date.now();
			window.location.replace(path);
			
		}
		
	} else if (event.data.reload !== undefined) {
		
		// reload the location if there was a message to do so
		window.location.reload();
	}
	
}
window.addEventListener("message", receiveIframeMessage, false);
