let mapMini = document.getElementById("tracks-map-mini");	// The small map display provided by eBird
if (mapMini) {	// If the map is there
	let Track = document.querySelector("#tracks-map-mini");	// Get the track data if it's there
	if (Track) {
		getOnlyTrack(location.pathname);
	}
}