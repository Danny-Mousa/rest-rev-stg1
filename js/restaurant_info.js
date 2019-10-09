let restaurant;
var newMap;
// all possible focusable elements
let focusableElementsString="a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex='0'], [contenteditable]";
let focusableElements;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
* @description Initialize leaflet map
*/
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiZGFubnltb3VzYSIsImEiOiJjazE5M25uNjAwMW9zM21udGZiNW1xb201In0.9_HLp_vytbnyl4kehwaSlw',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
      // when all of the page contents load =>
      // find the focusable elements and handle the keydown events on the page content
      pageFocusElementHandler();
    }
  });
}; 

/**
* @description Get current restaurant from page URL
* @param {function} callback
*/
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
* @description Create restaurant HTML and add it to the webpage
* @param {object} restaurant
*/
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  // Adding tabindex=0 & "lightBackground" class
  name.classList.add("lightBackground");
  name.setAttribute("tabindex","0");


  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  // Adding tabindex=0 & "lightBackground" class
  address.classList.add("lightBackground");
  address.setAttribute("tabindex","0");


  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  // Adding alt attribute to the img elements
  image.setAttribute("alt",`${restaurant.name} restaurant image`);
  // Adding tabindex=0 & "lightBackground" class
  image.classList.add("lightBackground");
  image.setAttribute("tabindex","0");

  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
  
};


/**
* @description Create restaurant operating hours HTML table and add it to the webpage
* @param {object} operatingHours
*/
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {

    const row = document.createElement('tr');
    // add 'role' attribute to the 'tr' element
    row.setAttribute("role", "row");

    const day = document.createElement('td');
    // add 'role' attribute to the 'td' element
    day.setAttribute("role", "cell");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    // add 'role' attribute to the 'td' element
    time.setAttribute("role", "cell");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};


/**
* @description Create all reviews HTML and add them to the webpage
* @param {object} reviews
*/
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.setAttribute("tabindex","0");
  title.setAttribute("id","toReviews");
  title.setAttribute("class", "lightBackground");
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
  
};


/**
* @description Create review HTML and add it to the webpage
* @param {object} review
*/
createReviewHTML = (review) => {
  const li = document.createElement('li');
  
  const name = document.createElement('p');
  //adding this 'id' attribute for styling purpose
  name.setAttribute("id", "name");
  name.setAttribute("tabindex","0");
  name.innerHTML = review.name;
  //li.appendChild(name);

  const date = document.createElement('p');
  //adding this 'id' attribute for styling purpose
  date.setAttribute("id", "date");
  date.innerHTML = review.date;
  //li.appendChild(date);

  // create 'div' element to put the reviewer name and the review date into it
  // and then put this 'div' element at the top of the review section (for styling purpose)
  const nameDate = document.createElement('div');
  nameDate.setAttribute("id","nameAndDate");
  nameDate.appendChild(name);
  nameDate.appendChild(date);

  li.appendChild(nameDate);



  const rating = document.createElement('p');
  //adding this 'id' attribute for styling purpose
  rating.setAttribute("id", "rating");
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};


/**
* @description Add restaurant name to the breadcrumb navigation menu
* @param {object} restaurant
*/
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
* @description Get a parameter by name from page URL
* @param {string} name
* @param {string} url
*/
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};


/********** Make Key Trap between the first and the last focusable element in this page ***********/

/**
* @description pick all the focusable elements on the page and put them into array 
*/
function pageFocusElementHandler(){

  // find all focusable elements
  focusableElements = document.body.querySelectorAll(focusableElementsString);
  
  // convert NodeList to Array
  focusableElements= Array.prototype.slice.call(focusableElements);

  let firstElement = focusableElements[0];
  
  let lastElement = focusableElements[focusableElements.length-1];

  firstElement.focus();
  document.addEventListener("keydown", (event)=>{
    focusNavigation(event, firstElement, lastElement);
  } );
}

/**
* @description Adds the ability to navigate using the arrow keys and makes the key trap between the first and the last focusable element on the page
* @param {object} event
* @param {object} firstElement
* @param {object} lastElement
*/
function focusNavigation(event,firstElement, lastElement){

  if(event.which===9){// Tab key
    
    if(event.shiftKey){ // shift key => here the interpreter
                        // will consider the following code to apply
                        // when pressing on (Tab + Shift)
      if(document.activeElement === firstElement){
        toLastElement(lastElement);
      }
    }else{
      if (document.activeElement === lastElement) {
        toFirstElement(firstElement);
      }
    }
  }

  // for ArrowUp key (38) and ArrowLeft key (37)
  if( event.which === 38 || event.which ===37){

    if(event.target === firstElement){
      toLastElement(lastElement);
    }else{
      if(event.target !== firstElement){
        event.preventDefault();
        focusableElements[focusableElements.indexOf(event.target)-1].focus();
      }
    }
    
  }

  // for ArrowRight key (39) and ArrowDown key (40)
  if( event.which === 39 || event.which ===40){
   
   if(event.target === lastElement){
    toFirstElement(firstElement);
   }else{
    if(event.target !== lastElement){
      event.preventDefault();
      focusableElements[focusableElements.indexOf(event.target)+1].focus();

    }
   }
  }
}

/**
* @description Move focus to the last element
* @param {object} lastElement
*/
function toLastElement(lastElement){
  event.preventDefault();
  lastElement.focus();
}

/**
* @description Move focus to the first element
* @param {object} firstElement
*/
function toFirstElement(firstElement){
  
  event.preventDefault();
  firstElement.focus();
}
