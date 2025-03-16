// Get list of locations from collection list on page load
const allLocations = Array.from(
  document.querySelectorAll("#geoList div.w-embed")
).map((element) => JSON.parse(element.innerHTML));

// Find the closest location to a target location out of an array of locations
function closestCoordinate(targetLocation, locationData) {
  function vectorDistance(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
  }

  function locationDistance(location1, location2) {
    var dx = location1.latitude - location2.latitude,
      dy = location1.longitude - location2.longitude;

    return vectorDistance(dx, dy);
  }

  return locationData.reduce(function (prev, curr) {
    var prevDistance = locationDistance(targetLocation, prev),
      currDistance = locationDistance(targetLocation, curr);
    return prevDistance < currDistance ? prev : curr;
  });
}

// Find the closest location to the user's location and execute the callback function with it
function findClosestLocation(allLocations, callback) {
  function success(position) {
    // Get the closest location to the user's location based on geo coordinates
    const closestLocation = closestCoordinate(position.coords, allLocations);
    //console.log("Closest location: " + JSON.stringify(closestLocation));
    callback(closestLocation, null);
  }

  function error() {
    callback(null, true);
    console.log("Unable to retrieve your location");
  }

  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by your browser");
  } else {
    status.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

const closestLocationStorageKey = "reach.closestLocation";

function saveClosestLocation(closestLocation) {
  localStorage.setItem(
    closestLocationStorageKey,
    JSON.stringify(closestLocation)
  );
}

// Grab the closest location from local storage if available
function restoreSavedClosestLocation() {
  const stringifiedLocation = localStorage.getItem(closestLocationStorageKey);
  const maybeClosestLocation = !!stringifiedLocation
    ? JSON.parse(stringifiedLocation)
    : null;

  return maybeClosestLocation;
}

const maybeSavedClosestLocation = restoreSavedClosestLocation();

function initStoreLocator(geoElement) {
  const myLocationButton = geoElement.getElementsByClassName("geo__button")[0];
  const myLocationLoader = geoElement.getElementsByClassName("geo__loading")[0];
  const myLocationTop = geoElement.getElementsByClassName("geo__text--top")[0];
  const refreshButton = geoElement.getElementsByClassName("geo__refresh")[0];
  const myLocationBottom =
    geoElement.getElementsByClassName("geo__text--bottom")[0];

  function displayClosestLocation() {
    console.log("Geo: User Location Requested", window.closestLocation);
    refreshButton.style.display = "block";
    myLocationButton.classList.remove("nav__location--inactive");
    myLocationLoader.style.display = "none";
    myLocationButton.href = window.closestLocation.link;
    myLocationButton.id = "Locksmith-Nearest-You-Button";
    myLocationTop.innerHTML = "Locksmith near you:";
    myLocationBottom.innerHTML = window.closestLocation.name;
  }

  // Update button details with text, link, and id of closest location.
  function findAndDisplayClosestLocation() {
    myLocationLoader.style.display = "block";
    findClosestLocation(allLocations, function (closestLocation, err) {
      myLocationLoader.style.display = "none";
      if (!!err) {
        myLocationBottom.innerHTML = "Enable Location Services";
        console.error(err);
      } else {
        saveClosestLocation(closestLocation);
        window.closestLocation = closestLocation;
        displayClosestLocation();
      }
    });
  }

  // Enable the refresh button
  refreshButton.onclick = findAndDisplayClosestLocation;

  if (!!maybeSavedClosestLocation) {
    // If we're able to restore the closest location from local storage, display it
    window.closestLocation = maybeSavedClosestLocation;
    displayClosestLocation();
    // Show the button with the user's closest location
    geoElement.style.opacity = 1;
    geoElement.style.display = "block";
  } else {
    // Show the button so users can be prompted to share their location
    geoElement.style.opacity = 1;
    geoElement.style.display = "block";
    // Otherwise, allow users to click on the "Use my location" button to find it
    myLocationButton.addEventListener("click", findAndDisplayClosestLocation);
  }
}

// Find all geo location buttons on the page and initialize them
Array.from(document.querySelectorAll(".geo")).forEach(initStoreLocator);
