const portalObject = {};

if (window.location.href.includes('/mychecklists')) {
	if (sessionStorage.getItem('doCountEm') || sessionStorage.getItem('showAllHref')) {
		if (checkURL('doCountEm'))
			countem();
	} else if (sessionStorage.getItem('doMapEm')) {
		if (checkURL('doMapEm'))
			runTheTracks();
	} else {
		addChecklistsButton();
	}
}

function addChecklistsButton() {	// Add our main menu button
	setPortals();
	let containerDiv = document.querySelector('div#toolbar');

	let myDiv = document.createElement('div');
	myDiv.setAttribute('class', 'Toolbar-group');
	myDiv.setAttribute('id', 'myDivId');
	containerDiv.append(myDiv);

	let subDiv = document.createElement('div');
	subDiv.setAttribute('class', 'Toolbar-item');
	subDiv.classList.add('Toolbar-item--hasDropdown');
	myDiv.append(subDiv);

	let myAnchor = document.createElement('a');
	myAnchor.setAttribute('class', 'Toolbar-item-button');
	myAnchor.classList.add('Toolbar-item-button--hasDropdown');
	myAnchor.setAttribute('href', '#addons-dropdown');
	myAnchor.setAttribute('aria-controls', 'addons-dropdown');
	subDiv.append(myAnchor);

	let mySpan = document.createElement('span');
	mySpan.setAttribute('class', 'u-showForMedium');
	mySpan.append(document.createTextNode('Add-ons'));
	mySpan.setAttribute('id', 'KLFdiv');
	myAnchor.append(mySpan);

	let dropDiv = document.createElement('div');
	dropDiv.setAttribute('id', 'addons-dropdown');
	dropDiv.setAttribute('class', 'Toolbar-item-dropdown');
	dropDiv.style.color = 'green';
	dropDiv.classList.add('u-inset-md');
	dropDiv.classList.add('u-stack-sm');
	subDiv.append(dropDiv);

	let myH4 = document.createElement('h4');
	myH4.setAttribute('class', 'Heading');
	myH4.classList.add('u-stack-sm');
	myH4.append('Add-ons');
	dropDiv.append(myH4);

	let itemObject1 = menuItem('Check for flagged checklists');
	let itemObject2 = menuItem('Download all GPS tracks');
	let itemObjectH = menuItem('Help');
	let itemObjectC = menuItem('Cancel');

	dropDiv.append(itemObject1.item);
	dropDiv.append(itemObject2.item);
	dropDiv.append(itemObjectH.item);
	dropDiv.append(itemObjectC.item);

	itemObject1.p.addEventListener('click', () => {
		sessionStorage.setItem('doCountEm', 1);
		location.reload();
	});

	itemObject2.p.addEventListener('click', () => {
		sessionStorage.setItem('doMapEm', 1);
		location.reload();
	});

	itemObjectH.p.addEventListener('click', () => {
		location.href = 'https://www.faintlake.com/eBird/extension/Enhancements/#E1';
	});

	itemObjectC.p.addEventListener('click', () => {
		myDiv.remove();
		addChecklistsButton();
	});
}

function menuItem(itemText) {
	const boxBackgroundColor = '#edf4fe', itemBackgroundColor = '#113245';
	let item = document.createElement('div');
	item.setAttribute('class', 'GridFlex');
	let p = document.createElement('p');
	p.append(itemText);
	item.append(p);
	p.style.backgroundColor = boxBackgroundColor;
	p.style.padding = '.5em';
	p.addEventListener('mouseenter', () => { p.style.backgroundColor = itemBackgroundColor });
	p.addEventListener('mouseenter', () => { p.style.color = 'white' });
	p.addEventListener('mouseleave', () => { p.style.backgroundColor = boxBackgroundColor });
	p.addEventListener('mouseleave', () => { p.style.color = 'black' });
	return ({ item: item, p: p });
}

function checkURL(storageItem) {
	// Inexplicably, eBird sometimes redirects to the base URL with search parameters deleted.
	// We deal with that here.
	let nextHref = '', prevHref = '';
	let bottomButtonList = document.getElementById('prev-next-all');
	if (!bottomButtonList) {
		return (true);
	}
	bottomButtonList = bottomButtonList.querySelectorAll('a'); // Previous, Next, and Show
	let showAllIndex = bottomButtonList.length - 1;	// Show all is last (Previous may be absent)

	sessionStorage.removeItem(storageItem);

	if (showAllIndex > 0) {
		let nextButtonIndex = showAllIndex - 1;	// Next is next to last
		nextHref = bottomButtonList[nextButtonIndex].href; 	// The "Next" button at the bottom
		bottomButtonList[nextButtonIndex].addEventListener('click', () => {
			sessionStorage.setItem('nextPage', nextHref);
			sessionStorage.setItem(storageItem, 1)
		})

		if (nextButtonIndex > 0) {
			let prevButtonIndex = nextButtonIndex - 1;	// prev is before next, if present
			prevHref = bottomButtonList[prevButtonIndex].href; 	// The "Previous" button at the bottom
			bottomButtonList[prevButtonIndex].addEventListener('click', () => {
				sessionStorage.setItem('nextPage', prevHref);
				sessionStorage.setItem(storageItem, 1)
			})
		}
	}

	let showAllHref = bottomButtonList[showAllIndex].href;	// Either Show all or Show fewer
	bottomButtonList[showAllIndex].addEventListener('click', () => { sessionStorage.setItem('showAllHref', showAllHref) })

	let expectedPage = sessionStorage.getItem('showAllHref');
	if (expectedPage) {
		sessionStorage.removeItem('showAllHref');
	} else {
		expectedPage = sessionStorage.getItem('nextPage');
		if (expectedPage) {
			sessionStorage.removeItem('nextPage');
		} else {
			sessionStorage.setItem('reloadCounter', 0);
		}
	}

	if (expectedPage) {
		reloadCounter = Number(sessionStorage.getItem('reloadCounter'));
		if (expectedPage != location.href && location.search == '') {
			sessionStorage.setItem('reloadCounter', ++reloadCounter);
			if (reloadCounter < 2) {
				sessionStorage.setItem(storageItem, 1);
				location.replace(expectedPage);
				return false;
			}
		} else {
			sessionStorage.setItem('reloadCounter', 0);
		}
	}
	return true;
}

function countem() {
	let listItems = document.getElementById('place-species-observed-results').querySelectorAll('li.ResultsStats');

	if (!document.getElementById('myDivId'))
		addChecklistsButton();

	countOne(listItems, 0);
	displayToggle('flag');
}

function countOne(listItems, i) {
	let checklistID, href;
	let li = listItems[i];
	if (li.getAttribute('id')) {
		checklistID = li.getAttribute('id');
		href = li.querySelector('a').getAttribute('href').trim();
		fetchHTML(href, checklistID);
	}
	if (i+1 < listItems.length) {
		setTimeout(() => {
			countOne(listItems, i+1);
		}, 235);
	}
}

function displayToggle(type) {
	let bottomButtonList = document.getElementById('prev-next-all');
	if (!bottomButtonList) return;
	let listItems = document.getElementById('place-species-observed-results').querySelectorAll('li');
	let myDiv = document.createElement('div');
	myDiv.style.padding = '0.85em 1em';
	myDiv.style.fontWeight = '700';
	myDiv.style.fontSize = '.9rem';
	myDiv.style.lineHeight = '1';
	myDiv.style.borderRadius = '3px';
	myDiv.style.cursor = 'pointer';
	myDiv.style.color = 'white';
	myDiv.style.backgroundColor = '#007bc2';
	myDiv.style.verticalAlign = 'middle';
	bottomButtonList.append(myDiv);
	let buttonText = [];
	if (type == 'flag') {
		buttonText = ["Show flagged/unflagged", "Show only flagged"];
	} else if (type == 'tracks') {
		buttonText = ["Show green or yellow", "Show only green"];		
	}
	myDiv.append(buttonText[1]);
	myDiv.addEventListener('click', () => {
		let text = myDiv.textContent;
		let all;
		if (text == buttonText[0]) {
			myDiv.textContent = buttonText[1];
			all = true;
		} else {
			myDiv.textContent = buttonText[0];
			all = false;
		}
		for (let li of listItems) {
			if (all) {
				li.style.display = 'grid';
			} else {
				if (!li.classList.contains('alwaysShow')) {
					li.style.display = 'none';
				}
			}
		}
	});
}

async function fetchHTML(path, id) {
	let url = 'https://ebird.org' + path;
	console.log('fetchHTML', url);
	fetch(url, {redirect: "follow"})
		.then(
			(response) => { return response.text(); },	// success
			(reason) => {										// failure
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
						.then((data) => { checkIfFlagged(data, id); return (data); })
					
					
				}
			}
		)
		.then((data) => {
			if (data) {
				checkIfFlagged(data, id);
			}

		})
		.catch(function (error) {
			console.log('Error on ', id);
			console.log(error);
		});
}

function checkIfFlagged(data, id) {;
	if (data.indexOf('>Checklist flagged</span>') > 0) {
		document.getElementById(id).style.backgroundColor = 'yellow';
		document.getElementById(id).classList.add('alwaysShow');
	} else {
		document.getElementById(id).style.backgroundColor = '#8f8';
	}
}

let trackList = {};
let subIdList = [];

function runTheTracks() {
	let listItems = document.getElementById('place-species-observed-results').querySelectorAll('li.ResultsStats');
	if (!document.getElementById('myDivId'))
		addChecklistsButton();

	getOneTrack(listItems, 0);
	displayToggle('tracks');
}

function getOneTrack(listItems, i) {
	let li = listItems[i];
	if (li.getAttribute('id')) {
		fetchGPS(li.querySelector('a').getAttribute('href').trim(), li.getAttribute('id'));
	}
	if (i + 1 < listItems.length) {
		setTimeout(() => {
			getOneTrack(listItems, i + 1);
		}, 235);
	} else {	// At the end
		downloadTracks(subIdList);
	}
}

async function fetchGPS(path, id) {
	let url = 'https://ebird.org' + path;
	fetch(url)
		.then(
			(response) => { return response.text(); },	// success
			() => {													// failure, try redirect to portal URL
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
						.then((response) => { return response.text(); })
						.then((data) => { fetchTrackData(data, id, url) })
				}
			}
		)
		.then((data) => { if (data) fetchTrackData(data, id, url); })
		.catch(function (error) {
			console.log('Error on ' + url);
			console.log(error);
		});
}

function fetchTrackData(data, id, url) {
	let subId = url.slice(url.lastIndexOf('/') + 1);
	let checklistTitleA = data.match('<title>.*</title>');	// Get the html title
	let checklistTitle = checklistTitleA[0].slice(7, -8);
	let canonical = url;

	// Find the checklist URL
	let URLoffset = data.search('<link rel="canonical" href=".*">');
	if (URLoffset) {
		let canonical = data.slice(URLoffset + '<link rel="canonical" href="'.length);
		canonical = canonical.split('"')[0];
	}

	if (data.search('<h3 id="flagged"') < 0) {	// Exclude flagged checklists
		let offset = data.indexOf('data-maptrack-data');	// Look for the GPS data in the text
		if (offset > 0) {	// If it's there, process it
			let linend = data.indexOf('"', offset + 'data-maptrack-data="'.length + 2);
			data = data.slice(offset + 'data-maptrack-data="'.length, linend);
			storeTrack(subId, { points: data, title: checklistTitle, canonical: canonical });
			document.getElementById(id).style.backgroundColor = '#8f8';
			document.getElementById(id).classList.add('alwaysShow');
		} else {
			document.getElementById(id).style.backgroundColor = 'yellow';
		}
	}
}
function storeTrack(subId, checklistObject) {	// Take the string of coordinates and turn them into xml
	let ar = checklistObject.points.split(',');	// Convert the coordinate string into an array
	let trackPoint = [];	// Set up the array that we will put in the xml
	for (let i = 0, c = 0; i < ar.length; i += 2, c++) {
		trackPoint[c] = '<trkpt lon="' + ar[i] + '" lat="' + ar[i + 1] + '"></trkpt>';
	}
	trackList[subId] = '<trk><name>' + subId + '</name><desc><![CDATA[' + checklistObject.canonical + ' ' + checklistObject.title + ']]></desc><trkseg>' + trackPoint.reduce(joiner) + '</trkseg></trk>';
	subIdList.push(subId);

	function joiner(complete, element) {
		return complete + element;
	}
}

async function downloadTracks(subIdList) { // Wait for all the xml to be ready then save it
	let total = 0;
	let XML = '<?xml version="1.0" encoding="UTF-8" ?><gpx version="1.1" creator="eBird"><metadata>'
		+ '<name><![CDATA[' + document.title + ']]></name>'
		+ '<desc><![CDATA[' + document.title + ']]></desc>'
		+ '</metadata>';


	for (let i = 0; i < subIdList.length; i++) {
		let subId = subIdList[i];
		let track = trackList[subId];
		if (track) {
			XML += track;
			total += track.length;
		}
	}
	XML += '</gpx>';

	if (!total) {	// If no tracks found
		setTimeout(abort, 50);
		return;
	}

	// Set up a dummy anchor for downloading the xml file, then click it
	const link = document.createElement('a')
	link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(XML))
	link.setAttribute('download', document.title + '.gpx');
	//	link.style.display = 'none';

	link.append('Click here');

	let thing = document.getElementById('myChecklistsForm');
	thing.append(link);
	console.log('Appended link to thing');
	//	document.body.appendChild(link);
	link.click();
	//	document.body.removeChild(link);

	function abort() {
		console.log('No tracks');
	}
}

function setPortals() {
	portalObject["Alaska eBird"] = "/ak";
	portalObject["Arkansas eBird"] = "/ar";
	portalObject["aVerAves"] = "/averaves";
	portalObject["BCN"] = "/bcn";
	portalObject["eBird"] = "";
	portalObject["eBird Argentina"] = "/argentina";
	portalObject["eBird Armenia"] = "/armenia";
	portalObject["eBird Australia"] = "/australia";
	portalObject["eBird Bolivia"] = "/bolivia";
	portalObject["eBird Brasil"] = "/brasil";
	portalObject["eBird Canada"] = "/canada";
	portalObject["eBird Caribbean"] = "/caribbean";
	portalObject["eBird Central America"] = "/camerica";
	portalObject["eBird Chile"] = "/chile";
	portalObject["eBird Colombia"] = "/colombia";
	portalObject["eBird España"] = "/spain";
	portalObject["eBird India"] = "/india";
	portalObject["eBird Japan"] = "/japan";
	portalObject["eBird Malaysia"] = "/malaysia";
	portalObject["eBird Pacific Northwest"] = "/pnw";
	portalObject["eBird Paraguay"] = "/paraguay";
	portalObject["eBird Peru"] = "/peru";
	portalObject["eBird Portugal"] = "/portugal";
	portalObject["eBird Québec"] = "/qc";
	portalObject["eBird Rwanda"] = "/rwanda";
	portalObject["eBird Singapore"] = "/singapore";
	portalObject["eBird Taiwan"] = "/taiwan";
	portalObject["eBird Uruguay"] = "/uruguay";
	portalObject["eBird Zambia"] = "/zambia";
	portalObject["eBird Zimbabwe"] = "/zimbabwe";
	portalObject["eKusbank"] = "/turkey";
	portalObject["Israel Breeding Bird Atlas"] = "/atlasilps";
	portalObject["Maine Bird Atlas"] = "/me";
	portalObject["Maine eBird"] = "/me";
	portalObject["Maryland-DC Breeding Bird Atlas"] = "/atlasmddc";
	portalObject["Mass Audubon eBird"] = "/massaudubon";
	portalObject["Minnesota eBird"] = "/mn";
	portalObject["Missouri eBird"] = "/mo";
	portalObject["Montana eBird"] = "/mt";
	portalObject["New Hampshire eBird"] = "/nh";
	portalObject["New Jersey eBird"] = "/nj";
	portalObject["New York Breeding Bird Atlas"] = "/atlasny";
	portalObject["New Zealand Bird Atlas"] = "/atlasnz";
	portalObject["New Zealand eBird"] = "/newzealand";
	portalObject["North Carolina Bird Atlas"] = "/atlasnc";
	portalObject["Pennsylvania Bird Atlas"] = "/atlaspa";
	portalObject["Pennsylvania eBird"] = "/pa";
	portalObject["PR eBird"] = "/pr";
	portalObject["Taiwan Bird Atlas"] = "/atlastw";
	portalObject["Texas eBird"] = "/tx";
	portalObject["Vermont eBird"] = "/vt";
	portalObject["Virginia Breeding Bird Atlas"] = "/atlasva";
	portalObject["Virginia eBird"] = "/va";
	portalObject["Wisconsin Breeding Bird Atlas"] = "/atlaswi";
	portalObject["Wisconsin eBird"] = "/wi";
}
