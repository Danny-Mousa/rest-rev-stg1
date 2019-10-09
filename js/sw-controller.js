
// pick up the container element of the pop up notification
let snackbar = document.querySelector(".snackbar");
// Pick up the elements of the previous container
let updateBtn = snackbar.querySelector(".update");
let dismissBtn = snackbar.querySelector(".dismiss");


if(navigator.serviceWorker){

	//To give the interpreter more time to knows the "this._SWRegistration()" and its components
	window.addEventListener('load', function() {
		// create an instance of this costructor function
	    new SwController();
	 });
	
}else {
	console.log("Your browser does not support Service Worker");
}


/**
* @description Register the Service Worker
* @constructor
*/

function SwController(){
	this._SWRegistration();
}

// register the service worker
SwController.prototype._SWRegistration= function(){
	console.log("service worker registration in progress...");

	let swController = this;

	navigator.serviceWorker.register("./sw.js").then( (reg)=>{
		console.log("Service Worker registration successful");

		if(!navigator.serviceWorker.controller) return; // THen the site already has the latest updates and no need for registeration

		if(reg.waiting){// when your user visit your site and there is a new SW are waiting with his updates
			swController._ShowUpdateNotification(reg.waiting);
			return;
		}

		if (reg.installing) {// when your user visit your site and there is a new SW are now installing 
			swController._trackInstalling(reg.installing);
			return;
		}


		reg.addEventListener("updatefound", ()=>{

			swController._trackInstalling(reg.installing);
		});

	}).catch( ()=>{
		console.log("Service Worker registration failed")
	});

	navigator.serviceWorker.addEventListener("controllerchange", ()=>{
		window.location.reload();
	});
};

// to keep track the installing process
SwController.prototype._trackInstalling= function(sw){

	let swController = this;

	sw.addEventListener("statechange", ()=>{

		if(sw.state === "installed"){

			swController._ShowUpdateNotification(sw);
		}
	});
};


// will be called on every installed or waiting Service worker
SwController.prototype._ShowUpdateNotification = function(sw){

	// first we should remove the keydown event handler
	// which specified to all of the document to 
	// prevent the Conflict with this keydown event handler
	document.removeEventListener("keydown", keydownHandler);

	// display notification and move focus to it
    snackbar.classList.add("show");
    snackbar.setAttribute("tabindex", "0");
	snackbar.focus();


	// The click event on the UPDATE button on the pop up notification
	document.querySelector(".snackbar").addEventListener('click', (event)=>{

		// The click event on the UPDATE button on the pop up notification
		if (event.target.classList.contains("update")){
			sw.postMessage({ msg: 'activateTheNewSW' });

		}else if (event.target.classList.contains("dismiss")){// The click event on the DISMISS button on the pop up notification
			
			let userDecision = confirm("UPDATES REJECTED\n\nAre you sure you want to reject updates?");

			if(userDecision){
				snackbar.classList.remove("show");

			}else {
				// to make the notification vibrate when user
				// press the cancel button on the confirm notification
				// to encourage him to update
				snackbar.classList.remove("show");
				snackbar.classList.add("backToUpdate");
			}
		}

	});

};

// event listener for "Tab", "Tab+Shift", "UP arrow", "Down arrow", "Left arrow", and "Right arrow" events
// on the notification
snackbar.addEventListener("keydown", (event)=>{

	if(snackbar.classList.contains("show")){

		let focusableBtn = snackbar.querySelectorAll("button");
		// convert NodeList to Array
        focusableBtn= Array.prototype.slice.call(focusableBtn);


		firstBtn = focusableBtn[0];
		
		lastBtn = focusableBtn[1];

		if (event.which===9){// Tab key

			if(event.shiftKey){// here if we click (Tab+Shift)
				event.preventDefault();
				firstBtn.focus();

				if( event.target === lastBtn){
					event.preventDefault();
					firstBtn.focus();
				}else {

					if(event.target === firstBtn){
						event.preventDefault();
						lastBtn.focus();
					}
				}	
			}else{ // if we just click (Tab)

				if(event.target === firstBtn){
					event.preventDefault();
					
					lastBtn.focus();
				}else{

					if (event.target === lastBtn) {
						event.preventDefault();
						firstBtn.focus();
					}
				}
			}
		} 
		// for ArrowUp key (38) and ArrowLeft key (37)
	   if( event.which === 38 || event.which ===37){
	   		event.preventDefault();
		    if(event.target === firstBtn){
		    	
		        lastBtn.focus();
		        
		    }else {
		    	if(event.target === lastBtn){

					firstBtn.focus();
				}
		    }
		    
	    }

	    // for ArrowRight key (39) and ArrowDown key (40)
	    if( event.which === 39 || event.which ===40){
	   		event.preventDefault();

		   	if(event.target === lastBtn){
		   		
		    	firstBtn.focus()
		    }else{

			    if(event.target === firstBtn){
			      
			      lastBtn.focus();

			    }
		    }
	    }
	}

});	
	    

