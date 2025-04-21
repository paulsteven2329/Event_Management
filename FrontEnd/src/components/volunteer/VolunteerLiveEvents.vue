<template>
    <div class="live-events">
      <h2>Live Events</h2>
      <p>Here are the live events happening right now:</p>
  
      <!-- Map container -->
      <div id="map" class="map-container"></div>
    </div>
  </template>
  
  <script>
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  
  export default {
    name: 'VolunteerLiveEvents',
    data() {
      return {
        map: null, // Leaflet map instance
        userLocation: null, // Store user's location
      };
    },
    mounted() {
      // Initialize the map (with a fallback to Bangalore coordinates)
      this.initializeMap();
  
      // Try to get the user's current location
      this.getUserLocation();
    },
    methods: {
      // Initialize the Leaflet map with OSM tiles
      initializeMap() {
        // Set initial view to Bangalore coordinates if no location is found
        this.map = L.map('map').setView([12.9716, 77.5946], 13);
  
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);
      },
  
      // Get the user's location using the geolocation API
      getUserLocation() {
        if (navigator.geolocation) {
          // Try to get current position
          navigator.geolocation.getCurrentPosition(
            this.onLocationSuccess, // Success callback
            this.onLocationError,   // Error callback
            { timeout: 10000, enableHighAccuracy: true }
          );
        } else {
          alert("Geolocation is not supported by this browser.");
        }
      },
  
      // Callback for successful geolocation retrieval
      onLocationSuccess(position) {
        const { latitude, longitude } = position.coords;
  
        if (latitude && longitude) {
          this.userLocation = { lat: latitude, lng: longitude };
  
          // Update the map to center on the user's location
          this.map.setView([latitude, longitude], 13); // Center map at user's location
          this.addMarker(latitude, longitude); // Add marker at the user's location
        } else {
          console.error("Unable to fetch valid coordinates.");
          alert("Unable to retrieve your location.");
        }
      },
  
      // Callback for geolocation error
      onLocationError(error) {
        console.error("Geolocation error:", error);
        alert("Could not get your location. Error: " + error.message);
  
        // Fallback: Use default Bangalore coordinates
        this.map.setView([12.9716, 77.5946], 13);
        this.addMarker(12.9716, 77.5946); // Add marker at Bangalore
      },
  
      // Add a marker at the given latitude and longitude
      addMarker(lat, lng) {
        L.marker([lat, lng])
          .addTo(this.map)
          .bindPopup('<b>You are here!</b>')
          .openPopup();
      },
    },
  };
  </script>
  
  <style scoped>
  /* Full-screen map container */
  .map-container {
    width: 100%;
    height: 100vh; /* Map will take up the full height of the viewport */
  }
  
  /* Styling for event data list (if needed) */
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    padding: 10px 0;
    font-size: 1.2em;
  }
  
  @media (max-width: 768px) {
    .map-container {
      height: 100vh; /* Full height for mobile devices */
    }
  }
  </style>
  