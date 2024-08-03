function getOptions() {
	localStorage.length;
	let options = JSON.parse(localStorage.getItem("extensionOptions"));
	let changed = false;
	if (options == null)
		options = {};
	if ('regionView' in options == false) {
		options.regionView = 'Month';
		changed = true;
	}
	if ('sharingURL' in options == false) {
		options.sharingURL = 'on';
		changed = true;
	}
	if ('trackDownload' in options == false) {
		options.trackDownload = 'on';
		changed = true;
	}
	if (changed) {
		localStorage.setItem('extensionOptions', JSON.stringify(options));
		options = JSON.parse(localStorage.getItem("extensionOptions"));
	}
	return options;
}

function setOption(optionName, optionValue) {
	let options = getOptions();
	options[optionName] = optionValue;
	localStorage.setItem('extensionOptions', JSON.stringify(options));
	options = JSON.parse(localStorage.getItem("extensionOptions"));
}

async function getOneTrack(checklists, i, promises) {
	let promise;
	if (i == 0) {
		sessionStorage.removeItem('subIdList');
	}
	let li = checklists[i];
	let id = li.getAttribute('id');
	if (!id) {
		id = 'liid' + i;
		li.setAttribute('id', id);
	}

	promises.push(fetchPage(li.querySelector('a').getAttribute('href').trim(), id, fetchTrackData));

	if (i + 1 < checklists.length) {
		setTimeout(() => {
			getOneTrack(checklists, i + 1, promises);
		}, 235);
	} else {	// At the end
		await Promise.allSettled(promises);
		let XML = prepareXML();
		if (XML) {
			performDownload(XML);
		}
	}
}

async function getOnlyTrack(URL) {
	sessionStorage.removeItem('subIdList');
	await fetchPage(URL, 0, fetchTrackData);
	let subId = URL.slice(URL.lastIndexOf('/') + 1);
	finishTheXML(subId);
}

async function finishTheXML(subId) {
	let XML = prepareXML()
	if (XML) {
		downloadButton(XML,subId);
	}
}

async function fetchPage(path, id, callback) {	// callback is checkIfFlagged or fetchTrackData
	const url = 'https://ebird.org' + path;
	
	const response = await fetch(url, { redirect: "follow" })
	const data = await response.text();
	callback(data, { id: id, url: url });
}

function fetchTrackData(data, parms) {
	let id = parms.id;
	let url = parms.url;
	let subId = url.slice(url.lastIndexOf('/') + 1);
	let checklistTitleA = data.match('<title>.*</title>');	// Get the html title
	let checklistTitle = checklistTitleA[0].slice(7, -8);
	let canonical = url;

	if (data.search('<h3 id="flagged"') < 0) {	// Do only non-flagged checklists
		// Find the checklist URL
		let URLoffset = data.search('<link rel="canonical" href=".*">');
		if (URLoffset) {
			let canonical = data.slice(URLoffset + '<link rel="canonical" href="'.length);
			canonical = canonical.split('"')[0];
		}

		let time = data.search(/<time datetime/i);
		if (time) {
			time = data.slice(time + 16).split('"', 1)[0];
		} else { time = false }

		let offset = data.indexOf('data-maptrack-data');	// Look for the GPS data in the text
		if (offset > 0) {	// If it's there, process it
			let linend = data.indexOf('"', offset + 'data-maptrack-data="'.length + 2);
			data = data.slice(offset + 'data-maptrack-data="'.length, linend);
			storeTrack(subId, { points: data, title: checklistTitle, canonical: canonical, time: time });
			if (id) {
				document.getElementById(id).style.backgroundColor = '#8f8';
				document.getElementById(id).classList.add('alwaysShow');
			}
		} else if (id) {
			document.getElementById(id).style.backgroundColor = '#CCC';
		}
	} else { document.getElementById(id).style.backgroundColor = 'yellow'; }
}

function storeTrack(subId, checklistObject) {	// Take the string of coordinates and turn them into xml
	let ar = checklistObject.points.split(',');	// Convert the coordinate string into an array
	let trackPoint = [];	// Set up the array that we will put in the xml
	for (let i = 0, c = 0; i < ar.length; i += 2, c++) {
		trackPoint[c] = '<trkpt lon="' + ar[i] + '" lat="' + ar[i + 1] + '"></trkpt>';
	}
	

	let subIdList = sessionStorage.getItem('subIdList');
	if (subIdList == null) subIdList = '';
	
	subIdList += ',' + subId;
	sessionStorage.setItem('subIdList', subIdList);
	
	let metadata = '<name>' + subId + '</name><desc><![CDATA[' + checklistObject.canonical + ' ' + checklistObject.title + ']]></desc>' 
	if (checklistObject.time) {
		metadata += '<time>' + checklistObject.time + '</time>'
	}

	sessionStorage.setItem(subId,
		'<trk>' + metadata + '<trkseg>' + trackPoint.reduce(joiner) + '</trkseg></trk>');

	function joiner(complete, element) {
		return complete + element;
	}
}

function prepareXML() {
	let List = sessionStorage.getItem('subIdList');
	if (!List) {	// If no tracks found
		// If a shared trip report, see who the current user is.
		let current;
		let peopleDiv = document.getElementsByClassName('ReportFilter-change')[0];
		if (peopleDiv) {
			current = peopleDiv.getElementsByClassName('current')[0].textContent;
		}

		setTimeout(noTracksFound, 50, current);
		return false;
	}

	List = List.slice(1); // Skip leading comma
	subIdList = List.split(',');

	sessionStorage.removeItem('subIdList');

	let total = 0;
	let XML = '<?xml version="1.0" encoding="UTF-8" ?><gpx version="1.1" creator="eBird"><metadata>'
		+ '<name><![CDATA[' + document.title + ']]></name>';
	let sourceURL = document.querySelector('link[rel="canonical"]');
	if (sourceURL) { // valid for single checklist and trip report, not mychecklists
		XML += '<link href="' + sourceURL.href + '"><text>' + sourceURL.href + '</text></link>'
	}
	let author = document.querySelector('meta[name="author"]');
	if (author) { // valid only for single checklist
		XML += '<author><![CDATA[' + author.content + ']]></author>'
	}
	XML += '<desc><![CDATA[' + document.title + ']]></desc>'
		+ '</metadata>';
	let subId, track;
	for (let i = 0; i < subIdList.length; i++) {
		subId = subIdList[i];
		track = sessionStorage.getItem(subId);
		sessionStorage.removeItem(subId);
		if (track) {
			XML += track;
			total += track.length;
		}
	}
	XML += '</gpx>';

	return XML;
}

function performDownload(XML) {
	// Set up a dummy anchor for downloading the xml file, then click it
	const link = document.createElement('a')
	link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(XML));
	link.setAttribute('download', document.title + '.gpx');
	link.style.display = 'none'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link);
}

function downloadButton(XML,subId) {
	let downloadSpan = document.createElement('span'); 
	downloadSpan.setAttribute('id', 'downloadGPX');
	downloadSpan.style = 'margin:0 0 0 70px;padding:0 8px;border:thin blue solid;background-color:#F0F6FA;font-size:.75rem;width:9em';

	let h3 = document.querySelector("#tracks");
	let section = h3.parentNode;
	section.insertAdjacentElement("beforeend", downloadSpan);

	// Set up the link (anchor element)
	let a = document.createElement('a');
	let linkText = document.createTextNode("Download track");
	a.appendChild(linkText);
	downloadSpan.appendChild(a);
	a.setAttribute("download", "eBird track " + subId + ".gpx");
	a.setAttribute('id', 'downloadAnchor');
	a.href = "data:text/plain," + XML;

	let options = JSON.parse(localStorage.getItem("extensionOptions"));
	if (options.trackDownload == 'off')
		downloadSpan.style.display = 'none';
	else
		downloadSpan.style.display = 'block';
}


function noTracksFound(current) {
	if (typeof current == 'undefined') {
		alert('No GPS tracks were found.');
	} else {
		let dataFor = document.getElementsByClassName('ReportFilter-current-label')[0].textContent;

		alert('There are no tracks for ' + current + '. \nWhere it says "' + dataFor.toLocaleUpperCase() + ' ' + current + '", change it by selecting your own name from the list.');
	}
}
