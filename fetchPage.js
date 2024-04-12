async function fetchPage(path, id, callback) {
	let url = 'https://demo.ebird.org' + path;
	console.log('fetchPage', url, 'with callback');
	fetch(url, { redirect: "follow" })
		.then(
			(response) => { return response.text(); },	// success
			() => {	// failure
				let portal = false;
				let subid = url.split('/').slice(-1);
				let details = document.getElementById('details-' + subid);
				if (details) {
					let portalDiv = details.querySelector('.ResultsStats-optionalDetails-portal');
					if (portalDiv) {
						portal = portalDiv.textContent.trim();
					}
				}
				if (portal) {
					url = 'https://ebird.org' + portalObject[portal] + path;
					fetch(url)
						.then(
							(response) => { return response.text(); }
						)
						.then((data) => { callback(data, { id: id, url: url }); })
				}
			}
		)
		.then((data) => {
			if (data) {
				callback(data, { id: id, url: url });
			}

		})
		.catch(function (error) {
			console.log('Error on ', id);
			console.log(error);
		});
}