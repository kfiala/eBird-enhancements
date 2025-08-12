if (document.getElementById("tracks-map-mini")) {	// If the small map display provided by eBird is there
	if (document.querySelector("#tracks-map-mini")) {	// If the track data is there

		let downloadSpan = document.createElement('span');
		downloadSpan.style = 'margin:0 0 0 70px;padding:0 8px;border:thin blue solid;background-color:#F0F6FA;font-size:.75rem;width:9em';
		downloadSpan.setAttribute('id', 'downloadAction');
		downloadSpan.textContent = 'Download track';
		downloadSpan.style.cursor = 'pointer';

		let h3 = document.querySelector("#tracks");
		let section = h3.parentNode;
		section.insertAdjacentElement("beforeend", downloadSpan);

		document.getElementById('downloadAction').addEventListener('click', (ev) => {
			ev.preventDefault();
			getOnlyTrack(location.pathname);
		});
		downloadButtonDisplay(downloadSpan);
	}
}

function downloadButtonDisplay(downloadSpan) {
	if (!options.trackDownload) {
		setTimeout(downloadButtonDisplay, 100, downloadSpan);
	} else {
		if (options.trackDownload == 'off')
			downloadSpan.style.display = 'none';
		else
			downloadSpan.style.display = 'block';
	}
}

async function getOnlyTrack(path) {
	sessionStorage.removeItem('subIdList');
	let promises = [];
	promises.push(fetchPage(path, 0, fetchTrackData));

	await Promise.allSettled(promises);
	handleDownload();
}
