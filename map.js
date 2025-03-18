function waitForAllLocations(cb) {
    if (typeof allLocations !== "undefined") {cb();} 
    else {window.setTimeout(function () {waitForAllLocations(cb)}, 100);
    }
}

// Enable reachDebugMap to disable script for live debugging
const debugEnabled = localStorage && (localStorage.getItem("reach.debug.map") === 'true')

!debugEnabled && waitForAllLocations(function () {
    const listingTemplate = 
    `
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
                    <div class="search__avatar" style="background-image: url('<%= listing.properties.avatar %>');"></div>
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
                    <a class="button button--inverted w-inline-block" id="Search-Pricing-Button" href="<%= listing.properties.link %>">
                        <div class="button__text">Services&nbsp;&amp;&nbsp;Pricing</div>
                    </a>
                    <% if (listing.properties.openStatus === 'Now Hiring') { %>
                        <a class="button button--hiring" id="Search-NowHiring-Button" href="/jobs">Now Hiring</a>
                    <% } %>
                </div>
            </div>
        </div>
    <% } %>
    `
    // Renders HTML from a GeoJSON listings objects using the template above
    function renderListingTemplate(listings) {return ejs.render(listingTemplate, {listings: listings.features});}

    const mapboxAccessToken = 'pk.eyJ1IjoiY2hvb3NlcmVhY2giLCJhIjoiY204YzY4dmIxMXc3MTJpcHNjMmF0MDNhdSJ9.jQ-0qtFKAdsf1qWxvmjTwA';
    const mapboxStyleUrl = 'mapbox://styles/choosereach/cm8amoube00g701so6iiehdgv';
    const mapContainerId = 'MapContainer';
    const searchContainerId = 'SearchContainer';
    const listingsContainer = document.getElementById('ListingsContainer');
    const emptyContainer = document.getElementById('EmptyContainer');
    const mapDefaultZoom = [-126, 18.5, -65, 50] // Continental United States
    
    mapboxgl.accessToken = mapboxAccessToken
    
    const map = new mapboxgl.Map({
        container: mapContainerId,
        style: mapboxStyleUrl,
        bounds: mapDefaultZoom,
        scrollZoom: true
    });
    
    /*
    const convertToMapboxFormat = ({ longitude, latitude, ...rest }) => ({
        type: "Feature",
        geometry: {type: "Point", coordinates: [longitude, latitude]},
        properties: {icon: "map-pin-50px", ...rest}
    });
    */

    function convertToMapboxFormat(listing) {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [
                    listing.longitude,
                    listing.latitude,
                ]
            },
            "properties": {
                'icon': 'map-pin-50px',
                ...listing
            }
        }
    }

    const mapboxListings = {
        "type": "FeatureCollection",
        "features": allLocations.map(convertToMapboxFormat)
    }
    
    buildListings(mapboxListings);
    
    mapboxListings.features.forEach(function (listing, i) {listing.properties.id = i;}); // Assign a unique ID to each listing
    
    map.on('load', () => {
        map.addSource('mapboxListings', {
            'type': 'geojson',
            'data': mapboxListings,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
        })
        
        // Create a layer to cluster close listings together
        map.addLayer({
            id: 'clusters',
            filter: ['has', 'point_count'],
            'type': 'symbol',
            'source': 'mapboxListings',
            'layout': {
                'icon-image': 'map-pin-50px',
                'icon-allow-overlap': true
            }
        });
        
        // Add a text field inside map pin icon to show how many listings are in a cluster
        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'mapboxListings',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 16,
                'text-offset': [-.1, .6] // Position text in center of cluster chicken
            },
            paint: {
                'text-color': '#FFFFFF',
                "text-halo-color": "#FFFFFF",
                "text-halo-width": .5
            }
        });
        
        // Add a layer for individual listings (not clusters)
        map.addLayer({
            'id': 'unclustered_listings',
            'type': 'symbol',
            'source': 'mapboxListings',
            'filter': ['!', ['has', 'point_count']],
            'layout': {
                'icon-anchor': 'bottom',
                'icon-image': ['get', 'icon'],
                'icon-allow-overlap': true
            }
        });
        
        // Open a listing page when clicking on a map pin
        map.on('click', 'unclustered_listings', (e) => {window.location.href = e.features[0].properties.link});
        
        // Zoom into a cluster of listings when clicked (https://docs.mapbox.com/mapbox-gl-js/example/cluster/)
        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('mapboxListings').getClusterExpansionZoom(
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

    // Change cursor while hovering over clusters or listings
    map.on('mouseenter', 'clusters', () => {map.getCanvas().style.cursor = 'pointer';});
    map.on('mouseleave', 'clusters', () => {map.getCanvas().style.cursor = '';});
    map.on('mouseenter', 'unclustered_listings', () => {map.getCanvas().style.cursor = 'pointer';});
    map.on('mouseleave', 'unclustered_listings', () => {map.getCanvas().style.cursor = '';});

    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        proximity: "ip",
        countries: "us",
        types: "country,region,postcode,district,place,locality,neighborhood", // https://docs.mapbox.com/api/search/geocoding/#data-types
        placeholder: "Search by city, state, zipcode etc"
    })

    const geocoderInput = geocoder.onAdd(map);
    document.getElementById(searchContainerId).appendChild(geocoderInput);

    // When a search query is selected from the dropdown, sort the listings by distance to that query
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

            // Append the distance of each listing from the geocoder search result so that we can filter out far away listings
            mapboxListings.features.forEach(listingItem => {
                const listingLat = listingItem.geometry.coordinates[0]
                const listingLon = listingItem.geometry.coordinates[1]

                listingItem.distanceFromSearch = calculateDistance(listingLat, listingLon, latitude, longitude)
            })

            // Filter to listings that:
            const filteredListings = mapboxListings.features.filter(listingItem => {
                // Are within 100 miles of the geocoder search
                return listingItem.distanceFromSearch <= 100 ||
                    // If this is a search for a country it won't have contexts, so just show everything
                    !hasContexts ||
                    // Are within the same state
                    contexts.includes(listingItem.properties.state) ||
                    // Are an exact state match
                    searchText === listingItem.properties.state
            })

            // Sort listings from closest to furthest
            const sortedListings = filteredListings.sort((listing1, listing2) => {
                return listing1.distanceFromSearch - listing2.distanceFromSearch
            })

            const closestListing = sortedListings[0]

            // Resize map to fit closest listing and geocoder search query
            if (!!closestListing) {
            }

            // Resize map to fit all listings within the mile range
            if (sortedListings.length > 0) {
                const listingCoordinates = filteredListings.map((listingItem) => listingItem.geometry.coordinates);
                const bounds = getBoundsOfCoordinates(listingCoordinates.concat([address.center]))
                map.fitBounds(bounds, {padding: {top: 50, bottom: 100, left: 50, right: 50}});
            }

            // Rebuild the listings sorted by distance
            buildListings({
                "type": "FeatureCollection",
                "features": sortedListings
            });
        }
    })

    // Gets geographical area containing all supplied coordinates
    function getBoundsOfCoordinates(coordinates) {
        let ne = [coordinates[0][0], coordinates[0][1]]
        let sw = [coordinates[0][0], coordinates[0][1]]

        coordinates.map((coordinate) => {
            if (coordinate[0] > ne[0]) {ne[0] = coordinate[0];}
            if (coordinate[1] > ne[1]) {ne[1] = coordinate[1];}
            if (coordinate[0] < sw[0]) {sw[0] = coordinate[0];}
            if (coordinate[1] < sw[1]) {sw[1] = coordinate[1];}
        });

        return [ne, sw]
    }

    function buildListings(listings) {
        if (listings.features.length > 0) {
            emptyContainer.style.display = "none";
            listingsContainer.innerHTML = "";
            listingsContainer.innerHTML = renderListingTemplate(listings)

        } else {
            emptyContainer.style.display = "block";
            listingsContainer.innerHTML = "";
        }
    }

    // Returns distance in miles between two coordinates
    function calculateDistance(latt1, lonn1, latt2, lonn2) {
        const R = 6371; // km
        const dLat = toRad(latt2 - latt1);
        const dLon = toRad(lonn2 - lonn1);
        const lat1 = toRad(latt1);
        const lat2 = toRad(latt2);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) {return Value * Math.PI / 180;}
});
