if (window.location.href.includes('/mychecklists')) {
	let filterMode = '';
	if (sessionStorage.getItem('showAllHref'))
		filterMode = sessionStorage.getItem('filtermode');

	if (sessionStorage.getItem('doCountEm') || filterMode == 'flagged') {
		if (checkURL('doCountEm'))
			countem();
	} else if (sessionStorage.getItem('doMapEm') || filterMode == 'tracks') {
		if (checkURL('doMapEm'))
			runTheTracks();
	} else if (sessionStorage.getItem('doIncomplete') || filterMode == 'incomplete') {
		if (checkURL('doIncomplete')) {
			scanIncomplete();
		}
	} else {
		addChecklistsButton();
	}
}

function addChecklistsButton() {	// Add our main menu button
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

	let itemObject1 = menuItem('Check for flagged (hidden) checklists');
	let itemObject2 = menuItem('Download all GPS tracks');
	let itemObject3 = menuItem('Check for incomplete checklists');
	let itemObjectH = menuItem('Help');
	let itemObjectC = menuItem('Cancel');

	dropDiv.append(itemObject1.item);
	dropDiv.append(itemObject3.item);
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

	itemObject3.p.addEventListener('click', () => {
		sessionStorage.setItem('doIncomplete', 1);
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
	sessionStorage.setItem('filtermode', 'flagged');
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
		fetchPage(href, checklistID, checkIfFlagged);
	}
	if (i+1 < listItems.length) {
		setTimeout(() => {
			countOne(listItems, i+1);
		}, 235);
	}
}

function runTheTracks() {
	sessionStorage.setItem('filtermode', 'tracks');
	const listItems = document.getElementById('place-species-observed-results').querySelectorAll('li.ResultsStats');
	let promises = [];
	if (!document.getElementById('myDivId'))
		addChecklistsButton();

	getOneTrack(listItems, 0, promises);
	displayToggle('tracks');
}

function scanIncomplete() {
	sessionStorage.setItem('filtermode', 'incomplete');
	const listItems = document.getElementById('place-species-observed-results').querySelectorAll('li.ResultsStats');

	if (!document.getElementById('myDivId'))
		addChecklistsButton();

	scan1incomplete(listItems, 0);
	displayToggle('flag');
}

function scan1incomplete(listItems, i) {
	let checklistID, href;
	let li = listItems[i];
	if (li.getAttribute('id')) {
		checklistID = li.getAttribute('id');
		href = li.querySelector('a').getAttribute('href').trim();
		fetchPage(href, checklistID, checkIfIncomplete);
	}
	if (i + 1 < listItems.length) {
		setTimeout(() => {
			scan1incomplete(listItems, i + 1);
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

function checkIfFlagged(data, parms) {
	let id = parms.id;
	if (data.indexOf('>Checklist flagged</span>') > 0) {
		document.getElementById(id).style.backgroundColor = 'yellow';
		document.getElementById(id).classList.add('alwaysShow');
	} else {
		document.getElementById(id).style.backgroundColor = '#8f8';
	}
}

function checkIfIncomplete(data, parms) {
	let id = parms.id;
	
	if (data.indexOf('title="Protocol: Incidental">') > 0) {
		document.getElementById(id).style.backgroundColor = '#89d0ff';
		document.getElementById(id).classList.add('alwaysShow');
	} else if (data.indexOf('<span class="Badge-label">Incomplete</span>') > 0) {
		document.getElementById(id).style.backgroundColor = 'yellow';
		document.getElementById(id).classList.add('alwaysShow');
	} else {
		document.getElementById(id).style.backgroundColor = '#8f8';
	}
}