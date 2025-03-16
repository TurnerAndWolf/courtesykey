function waitUntilAllLocationsInitialized(cb) {
    if (typeof allLocations !== "undefined") {
        cb();
    } else {
        window.setTimeout(function () {
            waitUntilAllLocationsInitialized(cb)
        }, 100);
    }
}

// Enable reachDebugMap to disable script for live debugging
const debugEnabled = localStorage && (localStorage.getItem("reach.debug.map") === 'true')

!debugEnabled && waitUntilAllLocationsInitialized(function () {

    const template = `
<% for (let listing of listings) { %>
    <div class="search2__item"><a id="Search-Thumb-Link" href="<%= listing.properties.link %>" class="search2__thumb w-inline-block" style="background-image: url('<%= listing.properties.map %>');">
    <div class="search2__overlay">
        <div class="icon icon--search w-embed">
            <svg width="100%" height="100%" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 741.5 838.6">
                <path d="M733.5 388.3c-13-48.9-41.5-93.9-81.8-124.6-39-29.7-89.1-46.4-137.7-40.3-48.7 6.1-94.9 36.9-114.3 82-11.6 26.8-15.1 59.5-38.1 77.5-21.1 16.5-53 13.6-75-1.6s-35.5-40.3-43.1-66-10.2-52.5-15.4-78.8c-6.1-30.6-15.7-60.6-28.7-89-8.6-18.8-19-38.8-15.3-59.1 3.8-21.1 21.5-36.4 38.2-49.9l-28.2-2.3-.2-18c-9.7-3.5-21.2-1.5-29.2 5.1 5.2-13.6-13-26.6-27-22.8s-23.1 17-31 29.2c1.7-12.1-14-20.8-25.7-17.2-11 3.4-26.8 18.1-30.2 29.3-5.1 16.5 2.2 38.5 11.6 52l-61.9 25 68.1 11.5c-21.5 12.1-33.8 38.7-29.1 63 16.7-3.1 32.3-11.7 43.8-24.1C90 216.8 62 261.3 46.1 306.6c-30.9 88.1-14.4 191.2 42.4 265.2C145 645.6 234.2 687 299.1 753.7c9.3 9.6 18.7 22.1 15.3 35-1.9 7.1-7.3 12.6-12.9 17.3-18.9 16.1-41.8 27.4-66.1 32.6l217 .1c-16.9-11.1-36.4-18.1-52-30.8-15.7-12.7-27.1-34.3-19.5-53.1 3.8-9.4 11.8-16.5 20.1-22.4 19.1-13.4 41.1-22.1 61.4-33.6 95.7-54.1 146.6-176.7 117.4-282.6 45.6 34.4 80.2 83.1 97.6 137.5 8.1-63.3-16.6-130-64.2-172.6 57.2 32.2 77.8 103.1 93.2 166.9 8.8-78-19.6-159.4-75-214.9 31.2 12.1 55.5 38.2 71.6 67.6s24.9 62.1 33.1 94.6c7.9-35.3 6.6-72.1-2.6-107z"></path>
            </svg>
        </div>
    </div>
</a>
    <div class="search2__content"><a id="Search-Address-Link" href="<%= listing.properties.link %>" class="search2__address w-inline-block">
        <div class="search2__line1"><%= listing.properties.addressShort %></div>
        <div class="search2__line2"><%= listing.properties.addressLine2 %></div>
    </a>
        <div class="search2__buttons"><% if (!!listing.properties.orderToast) { %><a id="Search-Pickup-Button" href="<%= listing.properties.orderToast %>" target="_blank"
                                         class="button button--order">Pickup</a><% } %><% if (!!listing.properties.orderEZCater) { %><a id="Search-Catering-Button" href="<%= listing.properties.orderEZCater %>"
                                                                                   target="_blank"
                                                                                   class="button button--order">Catering</a><% } %><% if (!!listing.properties.orderDoordash) { %><a
                id="Search-Doordash-Button" href="<%= listing.properties.orderDoordash %>" target="_blank"
                class="button button__3pd button__3pd--dd w-inline-block">
            <div class="button__square--icon w-embed">
                <svg width="100%" height="100%" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 132.3 102.7">
                    <path d="M123.3 16.7C117.8 6.4 107.1 0 95.4 0H7.2c-1.7 0-3 1.4-3 3.1 0 .8.3 1.6.9 2.1l19.2 19.3c1.7 1.7 4 2.7 6.4 2.7h62.2c4.4 0 8.1 3.5 8.1 7.9s-3.5 8.1-7.9 8.1H50.2c-1.7 0-3 1.4-3 3.1 0 .8.3 1.6.9 2.1l19.1 19.3c1.7 1.7 4 2.7 6.4 2.7H93c25.3 0 44.4-27 30.3-53.7M3.1 90.5v9.1h2.3c2.5 0 4.4-2.1 4.4-4.5h0c.1-2.4-1.9-4.4-4.3-4.5h-.1-2.3zm2.4-2.8c4.3 0 7.6 3.3 7.6 7.4s-3.3 7.4-7.6 7.4H.4c-.2 0-.4-.2-.4-.4v-14c0-.2.2-.4.4-.4h5.1zm18.7 12.2c2.7 0 4.9-2.1 4.9-4.8s-2.1-4.9-4.8-4.9-4.9 2.1-4.9 4.8h0c-.1 2.7 2.1 4.9 4.8 4.9m0-12.5c4.5 0 8 3.5 8 7.7s-3.5 7.7-8 7.7-8-3.5-8-7.7c0-4.3 3.5-7.7 8-7.7m19 12.5c2.7 0 4.8-2.2 4.8-4.9s-2.2-4.8-4.9-4.8-4.8 2.2-4.8 4.8c.1 2.7 2.3 4.9 4.9 4.9h0m0-12.5c4.5 0 8 3.5 8 7.7s-3.5 7.7-8 7.7-8-3.5-8-7.7c0-4.3 3.5-7.7 8-7.7m18.6 3.1h-3.3v3.9h3.3c1.1.1 1.9-.8 2-1.8v-.1c0-1.1-.8-2-1.9-2h-.1m-6.4-2.4c0-.2.2-.4.4-.4H62c2.9 0 5.1 2.1 5.1 4.9 0 1.8-1 3.5-2.6 4.3l2.8 5c.1.2.1.4-.1.5-.1.1-.1.1-.2.1h-2.5c-.1 0-.3-.1-.3-.2l-2.7-5h-2.7v4.8c0 .2-.2.4-.4.4H56c-.2 0-.4-.2-.4-.4l-.2-14zm19.8 2.5v9.1h2.3c2.5 0 4.4-2.1 4.4-4.5h0c.1-2.4-1.8-4.4-4.3-4.5h-.1-2.3zm2.3-2.9c4.3 0 7.6 3.3 7.6 7.4s-3.3 7.4-7.6 7.4h-5.1c-.2 0-.4-.2-.4-.4v-14c0-.2.2-.4.4-.4h5.1zm17.2 3.7l-1.8 4.9h3.6l-1.8-4.9zm-2.8 7.5l-1.2 3.2c-.1.1-.2.3-.4.3h-2.5c-.2 0-.4-.1-.4-.3v-.2l5.5-14c.1-.1.2-.3.4-.2h2.9c.2 0 .3.1.4.2l5.5 14c.1.2 0 .4-.2.5h-.2-2.5c-.2 0-.3-.1-.4-.3l-1.2-3.2h-5.7 0 0zm13.1-7.3c0-2.3 2-4.3 5.2-4.3 1.7 0 3.3.6 4.6 1.7.1.1.1.4 0 .5l-1.4 1.4c-.1.1-.4.1-.5 0h0c-.7-.6-1.5-.9-2.4-1-1.3 0-2.2.7-2.2 1.6 0 2.7 7.5 1.1 7.5 6.4 0 2.7-2 4.7-5.6 4.7-2 0-3.9-.7-5.3-2.1-.1-.1-.1-.4 0-.5l1.4-1.4c.1-.1.4-.1.5 0h0c.9.8 2 1.3 3.2 1.3 1.6 0 2.6-.9 2.6-1.9-.2-2.6-7.6-1.1-7.6-6.4m24.2-3.6v5.5h-6.3V88c0-.2-.2-.4-.4-.4h-2.4c-.2 0-.4.2-.4.4v14c0 .2.2.4.4.4h2.4c.2 0 .4-.2.4-.4v-5.6h6.3v5.6c0 .2.2.4.4.4h2.4c.2 0 .4-.2.4-.4V88c0-.2-.2-.4-.4-.4h-2.4c-.3.1-.4.2-.4.4z"></path>
                </svg>
            </div>
        </a><% } %><% if (!!listing.properties.orderUberEats) { %><a id="Search-Uber-Button" href="<%= listing.properties.orderUberEats %>" target="_blank"
               class="button button__3pd button__3pd--ue w-inline-block">
            <div class="button__square--icon w-embed">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 309.1 233.7"
                     fill-rule="evenodd">
                    <path d="M285.9 103.1h0-15.4V27.9h15.4v8.4c3.6-6.4 11.4-9.2 18.4-9.2h4.6v15.1h-4.7c-12.9 0-18.3 6.8-18.3 19.2v41.7h0zM0 0h16.5v63c0 37.9 50.5 35.1 50.5-.1V0h15.6v103.1H67v-9.3c-8.1 7.5-17.3 11.1-26.4 11.4C19.7 106 0 88.8 0 60.9V0h0zm111 102.9h0-15.3V0H111v37c8.6-7.4 18.6-10.6 28.2-10.3 24.7.8 37.8 18.8 38.1 37.3.2 20-14.4 40.7-39.4 41.5-9.5.3-19.2-3.3-26.9-11.6v9h0zm25.6-62.4a25.59 25.59 0 1 0 0 51.2 25.59 25.59 0 1 0 0-51.2h0zm123.7 30.3h-60.7c4.2 14 14.5 21.3 25.2 21.1 7.6-.1 15.4-3.9 21.6-11.6l10.3 8c-10.8 19.3-42 20.6-58.3 7.9-11.8-9.2-14.9-20.6-14.7-31.7.4-24.6 21.1-38.7 40.8-38.5 19.3.3 37.6 14 35.8 44.8h0zm-15.5-12.1c-1.8-22.5-39.2-27.4-45 0h45z"
                          fill="#fff"></path>
                    <path d="M20.4 214.6v-25.4h51.4v-17.4H20.4v-25.4h53V129H.5v103h72.9v-17.4h-53 0zm286.3-34.5h-19.3c-.5-2.6-1.9-4.8-4.1-6.5-3-2.5-7.3-4.2-11.7-4.6-6.8-.7-14.6 2.8-14.8 7-.1 2.6 2.6 5.4 10.3 7.6 12.8 3.8 29.2 2.1 38.2 13.8 10.5 13.7-.5 35.3-30.8 36.3-18.1.6-37.1-7.4-39.6-26.6H254c1.5 3.1 3.6 6 7 8.1 6.6 4.1 26.3 4.9 27.5-4.6.2-1.4-.4-2.8-2.2-4-3.4-2.4-9.7-3.1-15.3-4.3-24.1-3.3-32.9-11.2-34.6-21.1-.7-4.3-.2-8.8 1.9-12.7 1.4-2.6 3.3-5 5.5-7.1 6.9-6.5 17.8-9.3 28.3-9 14.9.4 33.9 8.6 34.6 27.7h0zm-77 34.2v17.4h-21.2c-13.1 0-20.4-8.6-20.4-21v-37.6h-14.5v-17.2h14.5v-22h19.5v22h22.1v17.2h-22.1V206c0 7.2 2.5 8.3 9.4 8.3h12.7 0zm-84-52.1v-6.4h19.9v75.9h-19.9v-7.1c-8 6.3-17.4 9.4-26.3 9-20.2-1-39.5-17.9-39-40.9.5-23.3 21.5-39.2 42-38.9 8.1 0 16.3 2.7 23.3 8.4h0zm-23.1 8.5c-12.6 0-22.9 10.2-22.9 22.9 0 12.6 10.2 22.9 22.9 22.9 12.6 0 22.9-10.2 22.9-22.9s-10.2-22.9-22.9-22.9z"
                          fill="#70be36"></path>
                </svg>
            </div>
        </a><% } %><% if (!!listing.properties.orderGrubHub) { %><a id="Search-Grubhub-Button" href="<%= listing.properties.orderGrubHub %>" target="_blank"
               class="button button__3pd button__3pd--gh w-inline-block">
            <div class="button__square--icon w-embed">
                <svg width="100%" height="100%" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 932 197">
                    <path d="M649.876 3.051h-32.4c-1.8 0-3.2 1.4-3.2 3.2v71.6h-32.8v-71.6c0-1.8-1.4-3.2-3.2-3.2h-32.4c-1.8 0-3.2 1.4-3.2 3.2v184.4c0 1.8 1.4 3.2 3.2 3.2h32.4c1.8 0 3.2-1.4 3.2-3.2v-74h32.8v74.1c0 1.8 1.4 3.2 3.2 3.2h32.4c1.8 0 3.2-1.4 3.2-3.2V6.351c0-1.8-1.4-3.3-3.2-3.3m-274.93 0h-15.9-17.2c-1.8 0-3.2 1.3-3.2 2.8v85.6 45.8.2c0 6.3-1.5 11.2-4.3 14.8-2.7 3.3-6.2 4.9-10.9 4.9-4.6 0-8.2-1.6-10.9-4.9-2.9-3.6-4.3-8.5-4.3-14.8v-.2l-.1-45.8h0v-85.5c0-1.6-1.4-2.8-3.2-2.8h-18-15.1c-1.8 0-3.2 1.3-3.2 2.8v85.6 46.3c0 17.4 4.2 32.8 14.1 43.2 10 10.6 24.3 15.9 40.7 15.9h0c16.4 0 30.6-5.3 40.7-15.9 9.9-10.4 14.1-25.8 14.1-43.2v-46.3-85.6c-.1-1.6-1.5-2.9-3.3-2.9"></path>
                    <path d="M54.797-.004h0c-16.4 0-30.6 5.3-40.7 15.9-9.9 10.4-14.1 25.8-14.1 43.2v32.4 38.8 4.8 2.7c0 17.4 4.2 32.8 14.1 43.2 10 10.6 24.3 15.9 40.7 15.9s30.6-5.3 40.7-15.9c9.9-10.4 14.1-25.8 14.1-43.2v-7.5-2.1-24.8-8.8a3.33 3.33 0 0 0-3.3-3.3h-48.1c-1.8 0-3.4 1.5-3.4 3.3v32.1c0 1.8 1.6 3.3 3.4 3.3h12.5v.8h0v6.5c0 6.6-1.5 11.9-4.5 15.6-2.8 3.5-6.5 5.2-11.4 5.2s-8.6-1.7-11.4-5.2c-3-3.8-4.7-9-4.7-15.6v-7h0v-38.7-32.1c0-6.6 1.7-11.9 4.7-15.6 2.8-3.5 6.5-5.2 11.4-5.2s8.6 1.6 11.4 5.1c3 3.8 4.5 9 4.5 15.6v7.3c0 1.6 1.4 2.8 3.2 2.8h32.4c1.8 0 3.2-1.3 3.2-2.8v-7.7c0-17.4-4.2-32.8-14.1-43.2-10-10.5-24.2-15.8-40.6-15.8M499.732 95.35c6-5.4 15.6-19.1 15.6-35.8 0-19.5-7.4-31.9-13.6-39-9.9-11.3-24.1-17.5-40.1-17.5h-30.2-21.6c-1.8 0-3.2 1.4-3.2 3.2v184.4c0 1.8 1.4 3.2 3.2 3.2h19.8 34.4c17 0 32.5-6.9 42.6-19.4 5.8-7.2 12.1-19.9 12.1-39.2 0-22.2-13.7-35.7-19-39.9m-54.4-53.4h16.4c4.8 0 8.4 1.4 10.9 4.3 2.6 3 3.9 7.5 3.9 13.4 0 6.1-1.4 10.9-4 14s-6.1 4.6-10.8 4.6h-16.4v-36.3zm30.4 108.2c-2.7 3.3-6.5 5-11.7 5h-18.6v-39.4h18.6c4.9 0 8.7 1.7 11.5 5.1 3 3.6 4.4 8.3 4.4 14.4 0 6.4-1.4 11.5-4.2 14.9"></path>
                    <path d="M221.996 111.787h0c3.3-2.4 6.4-5.1 9.2-8.3 6.7-7.5 14.6-20.8 14.6-41.2 0-19.9-7.9-33.1-14.6-40.7-9.8-11.1-23.5-17.5-38.9-18.3v-.1h-2.9-.4 0-51.4c-1.8 0-3.2 1.4-3.2 3.2v184.4c0 1.8 1.4 3.2 3.2 3.2h32.4c1.8 0 3.2-1.4 3.2-3.2v-68.8h11.6l20.5 69.6c.4 1.4 1.7 2.3 3.1 2.3h34.4a3.32 3.32 0 0 0 2.6-1.3c.6-.8.8-1.9.5-2.9l-23.9-77.9zm-20-34c-3.2 3.6-7.5 5.4-13.1 5.4h-15.7v-41.3h15.7c5.6 0 9.9 1.7 13.1 5.3 3.3 3.7 4.9 8.6 4.9 15 0 6.7-1.7 11.9-4.9 15.6M913.005 95.35c6-5.4 15.6-19.1 15.6-35.8 0-19.5-7.4-31.9-13.6-39-9.9-11.3-24.1-17.5-40.1-17.5h-30.2-21.6c-1.8 0-3.2 1.4-3.2 3.2v184.4c0 1.8 1.4 3.2 3.2 3.2h19.8 34.2c17 0 32.5-6.9 42.6-19.4 5.8-7.2 12.1-19.9 12.1-39.2.2-22.2-13.5-35.7-18.8-39.9m-54.4-53.4h16.4c4.8 0 8.4 1.4 10.9 4.3 2.6 3 3.9 7.5 3.9 13.4 0 6.1-1.4 10.9-4 14s-6.1 4.6-10.8 4.6h-16.4v-36.3zm30.4 108.2c-2.7 3.3-6.5 5-11.7 5h-18.7v-39.4h18.6c4.9 0 8.7 1.7 11.5 5.1 3 3.6 4.4 8.3 4.4 14.4.1 6.4-1.3 11.5-4.1 14.9"></path>
                    <path d="M787.986 3.051h-15.9-17.2c-1.8 0-3.2 1.3-3.2 2.8v85.6 45.8.2c0 6.3-1.5 11.2-4.3 14.8-2.7 3.3-6.2 4.9-10.9 4.9-4.6 0-8.2-1.6-10.9-4.9-2.9-3.6-4.3-8.5-4.3-14.8v-.2l-.1-45.8h0v-85.5c0-1.6-1.4-2.8-3.2-2.8h-18-15.1c-1.8 0-3.2 1.3-3.2 2.8v85.6 46.3c0 17.4 4.2 32.8 14.1 43.2 10 10.6 24.3 15.9 40.7 15.9h0c16.4 0 30.6-5.3 40.7-15.9 9.9-10.4 14.1-25.8 14.1-43.2v-46.3-85.6c0-1.6-1.5-2.9-3.3-2.9"></path>
                </svg>
            </div>
        </a><% } %>
        <% if (listing.properties.openStatus === 'Now Hiring') { %><a id="Search-NowHiring-Button" href="/jobs" class="button button--hiring" style="display:flex;">Now Hiring</a><% } %>
        <% if (listing.properties.openStatus === 'Under Construction') { %><div id="Search-Construction-Overlay" class="button button--constr" style="display:flex;">Under Construction</div><% } %>
        </div>
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
