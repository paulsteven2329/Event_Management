<template>
  <div id="map" style="height: 100vh; width: 100%;"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl';

export default {
  name: 'MapComponent',
  data() {
    return {
      map: null,
      userLocation: null,
      radius: 1000, // radius in meters (1km by default)
    };
  },
  mounted() {
    // Get the user's location and initialize the map
    this.getLocation().then(location => {
      this.userLocation = location;
      this.initMap();
    });
  },
  methods: {
    // Get the user's current location
    async getLocation() {
      if ("geolocation" in navigator) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              resolve({ lat: latitude, lng: longitude });
            },
            err => reject(err)
          );
        });
      } else {
        alert('Geolocation is not available in your browser');
      }
    },

    // Initialize Mapbox map
    initMap() {
      mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

      // Create the map
      this.map = new mapboxgl.Map({
        container: 'map', // ID of the container element
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [this.userLocation.lng, this.userLocation.lat],
        zoom: 12,
      });

      // Add a marker at the user's location
      new mapboxgl.Marker()
        .setLngLat([this.userLocation.lng, this.userLocation.lat])
        .addTo(this.map);

      // Add a circle to represent the radius
      this.addRadius(this.userLocation);
    },

    // Add a radius circle to the map
    addRadius(location) {
      const radiusCircle = new mapboxgl.CircleLayer({
        id: 'radius-circle',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [location.lng, location.lat],
            },
            properties: {
              radius: this.radius, // in meters
            },
          },
        },
        paint: {
          'circle-radius': {
            property: 'radius',
            stops: [
              [0, 0],
              [1000, 100],
            ],
          },
          'circle-color': 'rgba(0, 123, 255, 0.3)',
        },
      });

      this.map.addLayer(radiusCircle);
    },
  },
};
</script>

<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
