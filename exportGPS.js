let mapMini = document.getElementById("tracks-map-mini");	// The small map display provided by eBird
if (mapMini) {	// If the map is there
	let Track = document.querySelector(".Track");	// Get the track data if it's there
	if (Track) {
		if (Track.dataset.maptrackData) {
			let pathPart = window.location.pathname.split("/");
			let subId = pathPart[pathPart.length - 1];	// Get the subId; it's the last element of the path

			let time = document.getElementsByTagName("TIME")[0].dateTime;	// Get the checklist time
			let title = "<![CDATA[" + document.title + "]]>";
			let observer = "<![CDATA[" + document.querySelector('meta[name="author"]').content + "]]>";
		
			let ar = Track.dataset.maptrackData.split(",");	// Convert the coordinate string into an array
			let trackPoint = [];	// Set up the array that we will put in the xml
			for (let i = 0, c = 0; i < ar.length; i += 2, c++) {
				trackPoint[c] = "<trkpt lon=\"" + ar[i] + "\" lat=\"" + ar[i + 1] + "\"></trkpt>";
			}
			// Set the checklist link that we'll include in the xml.
			let checklistLink = "<link href=\"https://ebird.org" + window.location.pathname + "\"><text>eBird checklist " + subId + "</text></link>";
			// Finalize the xml
			let xmlOutput = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><gpx version=\"1.1\" creator=\"eBird\"><metadata><name>eBird checklist " + subId + "</name><time>" + time + "</time>" + checklistLink +
				"<desc>" + title + "</desc><author>" + observer + "</author></metadata><trk><name>" + subId + "</name><trkseg>" + trackPoint.reduce(trackJoiner) + "</trkseg></trk></gpx>";
			// Put the anchor element in the span
			let downloadSpan = document.getElementById('downloadGPX');
			if (!document.body.contains(downloadSpan)) {	// If we previously created our span element, reuse it
				downloadSpan = document.createElement('span');	// Else create our span element
				downloadSpan.setAttribute('id', 'downloadGPX');	// Give it an id for reference
				mapMini.parentNode.insertBefore(downloadSpan, mapMini.nextSibling);	// Insert it below the map
				downloadSpan.style = 'margin:0 0 0 70px;padding:0 8px;border:thin blue solid;background-color:#F0F6FA;font-size:.75rem;width:9em';
				// Set up the link (anchor element)
				let a = document.createElement('a');
				let linkText = document.createTextNode("Download track");
				a.appendChild(linkText);
				downloadSpan.appendChild(a);
				a.setAttribute("download", "eBird track " + subId + ".gpx");
				a.href = window.URL.createObjectURL(new Blob([xmlOutput], { type: 'text/xml' }))
			}
			if (localStorage.getItem('NoTrackDownload'))
				downloadSpan.style.display = 'none';
			else
				downloadSpan.style.display = 'block';
		}
	}
}


function trackJoiner(complete, element) {
  return complete + element;
}
