
export const displayMap=(locations)=>{
    mapboxgl.accessToken = 'pk.eyJ1IjoibWlsbGUxMCIsImEiOiJjbDA3aWNsaTkwMG1sM2JwZHE1d28xeXphIn0.xxBGaowpTk-bBZHqXwATKQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mille10/cl07kr1g5004q15msw964dt14',
        scrollZoom:false
        // center:[-118.113491,34.111745],
        // zoom:10
    });

    const bounds=new mapboxgl.LngLatBounds();

    locations.forEach(loc=>{
    // Create Marker
    const el=document.createElement('div');
    el.className="marker";


    // Add Marker
    new mapboxgl.Marker({
        element:el,
        anchor:"bottom"
    }).setLngLat(loc.coordinates).addTo(map);

    // Add Popup

    // new mapboxgl.Popup({offset:30}).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map)

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates)
    })

    map.fitBounds(bounds,{
        padding:{
            top:200,
            bottom:150,
            left:100,
            right:100
        }
    })

}
