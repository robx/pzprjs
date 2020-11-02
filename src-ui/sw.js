var CACHE_NAME = "v5";
var urlsToCache = ["/p"];

self.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function(cache) {
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener("fetch", function(event) {
	event.respondWith(
		caches.open(CACHE_NAME).then(function(cache) {
			return cache
				.match(event.request, { ignoreSearch: true })
				.then(function(response) {
					if (response) {
						return response;
					}
					return fetch(event.request);
				});
		})
	);
});
