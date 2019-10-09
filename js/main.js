let restaurants,
  neighborhoods,
  cuisines;
var newMap;
var markers = [];

// all possible focusable elements
let focusableElementsString="a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex='0'], [contenteditable]";
let focusableElements;
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();

  //I need a place being rendered just once to apply the following
  // so here is the best place to set the check mark and 'aria-selected=true'
  // as the default choices
  const all = document.querySelectorAll("option[value='all']");
  all.forEach( (opt)=>{
    opt.setAttribute("aria-selected", true);
    opt.insertAdjacentHTML('afterbegin','<span>✓ </span ');
  });
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');

    // set 'role' & 'aria-label' attribute to the option element
    option.setAttribute("role", "option");
    option.setAttribute("aria-label", `select ${neighborhood} restaurants`);
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });

  // add event listaner to select element for 'click' events
  select.addEventListener("click", (event)=>{

    // set 'aria-expanded' to 'true' when select element is clicked
    select.setAttribute("aria-expanded", true);
  });


  // add event listaner to select element for 'input' events
  select.addEventListener("input", (event)=>{

    //delete the "aria-selected" attribute that exists on the previous selections 
    const options = select.querySelectorAll("option");
    for(let i=0; i< options.length; i++){
      if(options[i].hasAttribute("aria-selected")){
        options[i].removeAttribute("aria-selected");
        options[i].firstElementChild.remove();
      }
      
    }

    // pick the selected "option" element and add the "aria-selected=true" to it
    //where (event.target.options) returns an array-list list of option elements
    //and, (event.target.selectedIndex) returns the index of the selected option.
    event.target.options[event.target.selectedIndex].setAttribute("aria-selected", true);
    
    event.target.options[event.target.selectedIndex].insertAdjacentHTML('afterbegin','<span>✓ </span> ');

  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');

    // set 'role' & 'aria-label' attribute to the option element
    option.setAttribute("role", "option");
    option.setAttribute("aria-label", `select ${cuisine} restaurant`);
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });

  // add event listaner to select element for 'click' events
  select.addEventListener("click", (event)=>{

    // set 'aria-expanded' to 'true' when select element is clicked
    select.setAttribute("aria-expanded", true);
  });


  // add event listaner to select element for 'input' events
  select.addEventListener("input", (event)=>{
    
    //delete the "aria-selected" attribute that exists on the previous selections 
    const options = select.querySelectorAll("option");
    for(let i=0; i< options.length; i++){
      if(options[i].hasAttribute("aria-selected")){

        options[i].removeAttribute("aria-selected");
        options[i].firstElementChild.remove();
        
      }
    }

    // pick the selected "option" element and add the "aria-selected=true" to it
    //where (event.target.options) returns an array-list list of option elements
    //and, (event.target.selectedIndex) returns the index of the selected option.
    event.target.options[event.target.selectedIndex].setAttribute("aria-selected", true);
    
    event.target.options[event.target.selectedIndex].insertAdjacentHTML('afterbegin','<span>✓ </span> ');
    
  });
};

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
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

  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
      
      // find the focusable elements and handle the keydown events on the current page content
      pageFocusElementHandler();
    }
  });
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
  document.addEventListener("keydown", keydownHandler);
}


/**
* @description It is the event handler for keydown events which calls another function to do the actual mission 
* @param {object} event
*/
function keydownHandler(event){
  focusNavigation(event, firstElement, lastElement);
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

/**
* @description Clear current restaurants, their HTML and remove their map markers
* @param {object} restaurants
*/
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
};

/**
* @description Create all restaurants HTML and add them to the webpage
* @param {object} restaurants
*/
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
* @description Create restaurant HTML
* @param {object} restaurant
*/
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  // Adding alt attribute to the img elements
  image.setAttribute("alt",`${restaurant.name} restaurant image`);
  li.append(image);

  const name = document.createElement('h1');
  // create 'aria-label' Attribute
  name.setAttribute("aria-label", `${restaurant.name} restaurant`);
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);

  // set 'role' & 'aria-label' attribute to the anchor <a> element
  more.setAttribute("role", "button");
  more.setAttribute("aria-label", `view more about ${restaurant.name}`);
  li.append(more);

  return li;
};

/**
* @description Add markers for current restaurants to the map
* @param {object} restaurants
*/
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

};

