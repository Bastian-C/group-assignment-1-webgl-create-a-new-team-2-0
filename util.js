// Load external resources

var loadTextResource = function (url, callback) { // url defines where the text resource is. Callback is used to return a value.
	var request = new XMLHttpRequest(); // Sends a request for a resource. 
	request.open('GET', url + '?please-dont-cache=' + Math.random(), true); // GET the resource from the specified url and Assigns a random number to the resource being loaded, so that caching does not work.
	request.onload = function () {
		if (request.status < 200 || request.status > 299) { // HTTP Status cosed in the 200 range indicate successful operations. 300 range is for moving instances and 400 / 500 range is for Errors.
			callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
		} else {
			callback(null, request.responseText);
		}
	};
	request.send(); // Sends the request
};

var loadImage = function (url, callback) { // url defines where the image resource is. Callback is used to return a value.
	var image = new Image(); 				// New Image.
	image.onload = function () {			
		callback(null, image);
	};
	image.src = url;						// Set the Image Source to the url. 
};		

var loadJSONResource = function (url, callback) { // url defines where the JSON resource is. Callback is used to return a value.
	loadTextResource(url, function (err, result) {  // Converts loaded Text into a JSON resource.
		if (err) {
			callback(err);
		} else {
			try {
				callback(null, JSON.parse(result));
			} catch (e) {
				callback(e);
			}
		}
	});
};