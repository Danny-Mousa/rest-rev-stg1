

// here we just need to change the number to get
// the new service worker's cache memory and 
// delete the old one
let version = "cache-v1";

self.addEventListener("install", (event)=>{

	console.log("install event in progress...");

	event.waitUntil(

		caches.open(version).then( (cache)=>{

		/* After the cache is opened,i fill it with the offline fundamental.
	       after making HTTP request for it.
        */
			return cache.addAll([
				"/"
			]);
		})
		.then( ()=>{
			console.log("install completed");
		})
		.catch( ()=>{
			console.log("install failed");
		})
	);
});

/* Once the install step succeeds, the activate event fires.
   This helps us phase out an older ServiceWorker
*/
 
self.addEventListener("activate", (event)=>{
	console.log("activate event in progress...");

	event.waitUntil(

		caches.keys().then( (keyNames)=>{
			// To return just one promise when all old caches are deleted.
			return Promise.all(

				keyNames.filter( (keyName)=>{
					// Filter by keys that don't starts with the latest (version) prefix
					return !keyName.startsWith(version);
				}).map( (keyName)=>{
					return caches.delete(keyName);
				})

			);
		})
		.then(function() {
	        console.log("activate completed");
	    })
	    .catch( ()=>{
	    	console.log("activate failed");
	    })

	);
});   

/* The fetch event fires whenever a page controlled
  by this service worker requests a resource
 */
 
self.addEventListener("fetch", (event)=>{
	console.log("fetch event in progress...");

	event.respondWith(

		caches.match(event.request).then( (response)=>{

			if(response) return response;

			/*
			  Because the "fetch" event will fire right after the service worker has activated
			  so, i found this stage is the best one to pull all the assets from the net and 
			  store it in the cache for the first load to avoid pulling the updated files (which
			  have their names still as before the updating) from the old cache durring the new
			  "installing" stage, because deleting the old assets will be occures during the
			  "activating" stage which will be fired after the "installing" stage, so in "installing"
			  stage i pulled just the files that we always need
			  and for later loads will become available to caches.match(event.request) calls, when looking
              for cached responses.
			 */

			return fetch(event.request).then((response)=>{


				/* Because the response is a stream and we need to send it to 
				   the browser and to the cache, so we need to make a copy of it 
				   to accomplish that
				  */
				return caches.open(version+"-assets").then( (cache)=>{
					// Put a copy of the response in the ("assetsCache-"+version) cache.
					return cache.put(event.request, response.clone()).then( ()=>{
						return response;
					});
				});
			})

		})
		.then( (response)=>{
			console.log("This Fetch Process Finished successfully :"+event.request.url);
			return response;
		})
		.catch( ()=>{
			console.log("fetch request failed in both cache and network");
			// Here i will create a response programmatically when it doesn't able to find the
			// the response neither in the cache nor in the web
			return new Response('<h1>Service Unavailable</h1>', {
	            status: 503,
	            statusText: 'Service Unavailable',
	            headers: new Headers({
	              'Content-Type': 'text/html'
	            })
	        });
		})
	);
}); 


self.addEventListener('message', (event) => {

  if (event.data.msg === "activateTheNewSW") {

    console.log('The Message is arrived');

    self.skipWaiting();
  }
});








