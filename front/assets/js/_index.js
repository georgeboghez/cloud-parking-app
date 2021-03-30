// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
//<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDTuY2oOA2nGKJeU8JmyQ-raRDf9FUTDFQ&libraries=places">

/* ParkingLot = {
  name: name,
  id: id,
  center: center {lat, long}
  available_spots : 23842394
  all_spots: 12734681236182
}*/

var directionsDisplay = null;
var directionsService = null;

function getRandom() {
  return Math.floor(Math.random() * Math.floor(50));
}

function createObj(id, name, center, availableSpots, allSpots) {
  return {
    id: id,
    name: name,
    center: center,
    availableSpots: availableSpots,
    allSpots, allSpots
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function addMarker(_position, icon, map, type, name, pyrmont) {
  const marker = new google.maps.Marker({
    position: _position,
    icon: icon,
    map: map,
    type: type,
    name: name
  });

  infoWindow = new google.maps.InfoWindow();
  const placesList = document.getElementById("places");
  const li = document.createElement("li");
  li.textContent = name;
  placesList.appendChild(li);
  li.addEventListener("click", () => {
    map.setCenter(_position);
  });

  google.maps.event.addListener(marker, 'click', async function (event) {
    content = getRandom();
    var x = confirm(`availableSpots:${content}`)

    if (x) {
      if (content) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              infoWindow.setPosition(pos);
              infoWindow.setContent("Location found.");
              infoWindow.open(map);
              map.setCenter(pos);

              // GET DIRECTIONS

              if (directionsService == null)
                directionsService = new google.maps.DirectionsService();
              if (directionsDisplay == null)
                directionsDisplay = new google.maps.DirectionsRenderer();

              directionsDisplay.setMap(map);
              directionsDisplay.setPanel(document.getElementById('panel'));

              var request = {
                origin: new google.maps.LatLng(pos.lat, pos.lng),
                destination: new google.maps.LatLng(_position.lat(), _position.lng()),
                optimizeWaypoints: true,
                avoidHighways: false,
                avoidTolls: false,
                travelMode: google.maps.TravelMode.DRIVING
              };

              directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                  directionsDisplay.setDirections(response);

                }
              });
            },
            () => {
              handleLocationError(true, infoWindow, map.getCenter());
            }
          );
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
      }
      else {
        alert("Please choose another parking lot.")
      }
    }


  });

}

function generateParkingSpots(map, pyrmont) {
  // Create the places service.
  const service = new google.maps.places.PlacesService(map);
  let getNextPage;
  const moreButton = document.getElementById("more");

  moreButton.onclick = function () {
    moreButton.disabled = true;

    if (getNextPage) {
      getNextPage();
    }
  };
  // Perform a nearby search.
  console.log(pyrmont)
  service.nearbySearch(
    { location: pyrmont, radius: 200, type: "parking" },
    (results, status, pagination) => {
      if (status !== "OK" || !results) return;
      console.log(results)
      addPlaces(results, map, pyrmont);
      moreButton.disabled = !pagination || !pagination.hasNextPage;

      if (pagination && pagination.hasNextPage) {
        getNextPage = () => {
          // Note: nextPage will call the same handler function as the initial call
          pagination.nextPage();
        };
      }
    }
  );
}

const iconBase =
  "https://developers.google.com/maps/documentation/javascript/examples/full/images/";
const icons = {
  parking: {
    icon: iconBase + "parking_lot_maps.png",
  },

};



function initMap() {
  // Create the map.
  const pyrmont = { lat: 47.1543244, lng: 27.5897312 };
  const map = new google.maps.Map(document.getElementById("map"), {
    center: pyrmont,
    zoom: 17,
    mapId: "8d193001f940fde3",
  });


  // GET USER CURRENT LOCATION
  /*infoWindow = new google.maps.InfoWindow();
  const locationButton = document.createElement("button");
  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });*/

  // DESTINATION
  const card = document.getElementById("pac-card");
  const input = document.getElementById("pac-input");
  const options = {
    fields: ["formatted_address", "geometry", "name"],
    origin: map.getCenter(),
    strictBounds: false,
    types: ["establishment"],
  };
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
  const autocomplete = new google.maps.places.Autocomplete(input, options);
  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo("bounds", map);
  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById("infowindow-content");
  infowindow.setContent(infowindowContent);
  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });
  autocomplete.addListener("place_changed", () => {
    infowindow.close();
    marker.setVisible(false);
    const place = autocomplete.getPlace();


    if (!place.geometry || !place.geometry.location) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    pyrmont.lat = place.geometry.location.lat()
    pyrmont.lng = place.geometry.location.lng();
    generateParkingSpots(map, pyrmont);
    //infowindowContent.children["place-name"].textContent = place.name;
    //infowindowContent.children["place-address"].textContent =
    //place.formatted_address;
    infowindow.open(map, marker);
  });


  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.




  // Add custom markers


  /*const features = [
    {
      position: new google.maps.LatLng(47.1543244, 27.5897312),
      name: "Test1"
    },
    {
      position: new google.maps.LatLng(47.1543555, 27.5897987),
      name: "Test2"
    },
    {
      position: new google.maps.LatLng(20, 20),
      name: "Test1"
    }
  ]

  for (let i = 0; i < features.length; i++) {
    addMarker(features[i].position, icons.parking.icon, map, "parking", features[i].name);
  }*/

  // end custom markers

  //generate parking spots


}

function addPlaces(places, map, pyrmont) {

  for (const place of places) {
    if (place.geometry && place.geometry.location) {
      addMarker(place.geometry.location, icons.parking.icon, map, "parking", place.name, pyrmont)
    }
  }
}

var lastMessage = '';

setInterval(() => {
  fetch('/check-notifications')
  .then(response => response.json())
  .then(data => { 
                  data = JSON.parse(data);
                  if(data.message && data.message != lastMessage) {
                    M.toast({html: data.message});
                    M.toast({html: data.translation});
                    lastMessage = data.message;
                  }
                })
  .catch((e) => {
    console.log(e);
  })
}, 2000);