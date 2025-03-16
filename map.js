function waitUntilAllLocationsInitialized(cb) {
    if (typeof allLocations !== "undefined") {cb();} 
    else {window.setTimeout(function () {waitUntilAllLocationsInitialized(cb)}, 100);}
}

// Enable reachDebugMap to disable script for live debugging
const debugEnabled = localStorage && (localStorage.getItem("reach.debug.map") === 'true')

!debugEnabled && waitUntilAllLocationsInitialized(function () {

const template = `
<% for (let listing of listings) { %>
    <div class="search__item">
        <a class="search__thumb w-inline-block" id="Search-Thumb-Link" href="<%= listing.properties.link %>" style="background-image: url('<%= listing.properties.map %>');">
            <div class="search__overlay">
                <div class="icon icon--search w-embed">
                    <svg width="100%" height="100%" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58.8 71.7" role="presentation"><path d="M47.4,0H11.4C5.1,0,0,5.1,0,11.4v14l8.7-2.7v-11.3c0-1.5,1.2-2.7,2.7-2.7h36c1.5,0,2.7,1.2,2.7,2.7h0v1.4c0,1.4-.9,2.6-2.2,3.1L0,31.1v11.8c0,3.2,1.5,6.8,4.4,10.4,3.1,3.8,6.7,7.1,10.7,9.9,4.5,3.2,9.3,6.1,14.3,8.6,5-2.5,9.8-5.3,14.3-8.6,4-2.8,7.6-6.1,10.7-9.9,2.9-3.7,4.3-7.2,4.3-10.4V11.4C58.8,5.1,53.7,0,47.4,0ZM32.5,46.2h0v4.9c0,1.7-1.4,3.1-3.1,3.1-1.7,0-3.1-1.4-3.1-3.1v-4.9c-3.1-1.5-4.7-5.1-3.6-8.5.7-2.3,2.5-4,4.8-4.7,3.8-1.1,7.7,1.1,8.8,4.9.9,3.3-.6,6.8-3.7,8.3Z"></path></svg>
                </div>
            </div>
        </a>
        <div class="search__content">
            <a class="search__locksmith w-inline-block" id="Search-Address-Link" href="<%= listing.properties.link %>">
                <div class="search__avatar"></div>
                <div class="search__address">
                    <div class="search__line1"><%= listing.properties.addressLine2 %></div>
                    <div class="search__line2"><%= listing.properties.byLine %></div>
                </div>
            </a>
            <div class="search__buttons">
                <a class="button w-inline-block" id="Search-Call-Button" href="tel:<%= listing.properties.phoneTrack %>" target="_blank">
                    <div class="button__text"><%= listing.properties.phoneTrack %></div>
                </a>
                <div class="spacer-half"></div>
                <a class="button button--inverted w-inline-block" id="Search-Pricing-Button" href="<%= listing.properties.phoneTrack %>" target="_blank"><%= listing.properties.phoneTrack %>
                    <div class="button__text">Services&nbsp;&amp;&nbsp;Pricing</div>
                </a>
            <% if (listing.properties.openStatus === 'Now Hiring') { %>
                <a class="button button--hiring" id="Search-NowHiring-Button" href="/jobs">Now Hiring</a>
            <% } %>
        </div>
    </div>
<% } %>
`

    function renderListingsTemplate(listings) {
        return ejs.render(template, {listings: listings.features});
    }

// Set these variables during migration to hhc.ooo
    const geocoderContainerId = 'Search-Map-Form';
    const mapContainerId = 'map';
    const mapboxAccessToken = 'pk.eyJ1IjoiY2hvb3NlcmVhY2giLCJhIjoiY2tzMmZwaXRoMDB3czJxcDlpbTgyY2I3MiJ9.lG3fr5o7dEr-9Cj3C4dgbg';
    const mapboxStyle = 'mapbox://styles/choosereach/ckrjazfmp4px617p0h6oyj9dd';
    // Coordinates that cover the lower continental United States
    const unitedStatesBounds = [-126, 18.5, -65, 50]

    mapboxgl.accessToken = mapboxAccessToken

    const map = new mapboxgl.Map({
        container: mapContainerId,
        style: mapboxStyle,
        // Zoom to United States by default
        bounds: unitedStatesBounds,
        scrollZoom: true
    });

    function mapHHCLocationToMapboxFormat(hccLocation) {

        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [
                    hccLocation.longitude,
                    hccLocation.latitude,
                ]
            },
            "properties": {
                'icon': 'hhc-chicken-icon-original',
                ...hccLocation
            }
        }
    }

//
    const stores = {
        "type": "FeatureCollection",
        "features": allLocations.map(mapHHCLocationToMapboxFormat)
    }

    /* Assign a unique ID to each store */
    stores.features.forEach(function (store, i) {
        store.properties.id = i;
    });

    map.on('load', () => {

        map.addSource('stores', {
            'type': 'geojson',
            'data': stores,
            // Group close stores under the same marker
            cluster: true,
            // Max zoom to cluster points on
            clusterMaxZoom: 14,
            // Radius of each cluster when clustering points
            clusterRadius: 50
        })

        // Create a layer to cluster close stores together
        map.addLayer({
            id: 'clusters',
            filter: ['has', 'point_count'],
            'type': 'symbol',
            'source': 'stores',
            'layout': {
                'icon-image': 'hhc-chicken-icon-original',
                'icon-allow-overlap': true
            }

        });

        // Add a text field inside chicken to show how many locations are in a cluster
        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'stores',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 16,
                // Position text in center of cluster chicken
                'text-offset': [-.1, .6]
            },
            paint: {
                'text-color': '#FFFFFF',
                "text-halo-color": "#FFFFFF",
                "text-halo-width": .5
            }
        });

        // Add a layer for individual stores (not clusters)
        map.addLayer({
            'id': 'unclustered_stores',
            'type': 'symbol',
            'source': 'stores',
            'filter': ['!', ['has', 'point_count']],
            'layout': {
                'icon-anchor': 'bottom',
                'icon-image': ['get', 'icon'],
                'icon-allow-overlap': true
            }
        });

        buildLocationList(stores);

        // Open a store page when clicking on a store
        map.on('click', 'unclustered_stores', (e) => {
            window.location.href = e.features[0].properties.link
        });

        // Zoom into a cluster of stores when clicked
        // Example cluster app here: https://docs.mapbox.com/mapbox-gl-js/example/cluster/
        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('stores').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });
    });

    // Change cursor while hovering over clusters or stores
    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'unclustered_stores', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered_stores', () => {
        map.getCanvas().style.cursor = '';
    });

    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        proximity: "ip",
        countries: "us",
        // https://docs.mapbox.com/api/search/geocoding/#data-types
        types: "country,region,postcode,district,place,locality,neighborhood"
    })

    const geocoderInput = geocoder.onAdd(map);
    document.getElementById(geocoderContainerId).appendChild(geocoderInput);
    geocoderInput.placeholder = "Search by city, state, zipcode etc"

    // When a location is selected from the dropdown, sort the listings by distance to that location
    geocoder.on('result', function (result) {

        // State / Neighborhood / County / Etc
        // Example: ['Summerlin South', 'Las Vegas', 'Clark County', 'Nevada', 'United States']
        const hasContexts = !!result.result.context
        const contexts = hasContexts ? result.result.context.map(x => x['text_en-US']) : []
        // The address selected by the user
        // This could be a State like 'Texas' or a full street address
        const searchText = result.result['text_en-US']

        const address = result.result

        // If we successfully found an address from the search box
        if (address) {
            const latitude = address.center[0];
            const longitude = address.center[1];

            // Append the distance of each store from the geocoder search result so that we can filter out far away locations
            stores.features.forEach(store => {
                const storeLat = store.geometry.coordinates[0]
                const storeLon = store.geometry.coordinates[1]

                store.distanceFromSearch = calculateDistanceBetweenTwoCoordinates(storeLat, storeLon, latitude, longitude)
            })

            // Filter to stores that:
            const filteredStores = stores.features.filter(store => {
                // Are within 100 miles of the geocoder search
                return store.distanceFromSearch <= 100 ||
                    // If this is a search for a country it won't have contexts, so just show everything
                    !hasContexts ||
                    // Are within the same state
                    contexts.includes(store.properties.state) ||
                    // Are an exact state match
                    searchText === store.properties.state
            })

            // Sort stores from closest to furthest
            const sortedStores = filteredStores.sort((store1, store2) => {
                return store1.distanceFromSearch - store2.distanceFromSearch
            })

            const closestStore = sortedStores[0]

            // Resize map to fit closet store and geocoder search result location
            if (!!closestStore) {

                // const coordinates = [
                //     // Closest Store
                //     [sortedStores[0].geometry.coordinates[0], sortedStores[0].geometry.coordinates[1]],
                //     // Geocoder Search Result Location
                //     [latitude, longitude]
                // ]
                //
                // const bounds = getBoundsOfCoordinates(coordinates)
                //
                // map.fitBounds(bounds, {
                //     padding: {top: 50, bottom:50, left: 50, right: 50} // Padding in pixels
                // });
            }

            // Resize map to fit all stores within the mile range
            if (sortedStores.length > 0) {
                const storeCoordinates = filteredStores.map((store) => store.geometry.coordinates);

                const bounds = getBoundsOfCoordinates(storeCoordinates.concat([address.center]))

                map.fitBounds(bounds, {
                    padding: {top: 50, bottom: 100, left: 50, right: 50} // Padding in pixels
                });
            }


            // Rebuild the listings sorted by distance
            buildLocationList({
                "type": "FeatureCollection",
                "features": sortedStores
            });
        }
    })

    // Gets geographical area containing all supplied coordinates
    function getBoundsOfCoordinates(coordinates) {
        let ne = [coordinates[0][0], coordinates[0][1]]
        let sw = [coordinates[0][0], coordinates[0][1]]

        coordinates.map((coordinate) => {
            if (coordinate[0] > ne[0]) {
                ne[0] = coordinate[0];
            }
            if (coordinate[1] > ne[1]) {
                ne[1] = coordinate[1];
            }
            if (coordinate[0] < sw[0]) { //sw = south west
                sw[0] = coordinate[0];
            }
            if (coordinate[1] < sw[1]) {
                sw[1] = coordinate[1];
            }
        });

        // Add some padding around bound

        return [ne, sw]
    }


    function buildLocationList(stores) {

        const emptyResultsMessage = document.querySelector("#Search-Map-Empty")
        const listings = document.getElementById('Search-Map-List');

        if (stores.features.length > 0) {
            // If more than one store is displayed
            // Hide the empty results message if it is displayed
            emptyResultsMessage.style.display = "none";

            // Build the left side list of locations

            listings.innerHTML = "";
            listings.innerHTML = renderListingsTemplate(stores)

        } else {
            // If there are no stores, show the empty results message and hide listings
            emptyResultsMessage.style.display = "block";
            listings.innerHTML = "";
        }
    }

    // Returns distance in miles between two coordinates
    function calculateDistanceBetweenTwoCoordinates(latt1, lonn1, latt2, lonn2) {
        const R = 6371; // km
        const dLat = toRad(latt2 - latt1);
        const dLon = toRad(lonn2 - lonn1);
        const lat1 = toRad(latt1);
        const lat2 = toRad(latt2);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) {
        return Value * Math.PI / 180;
    }
});
