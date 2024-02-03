if (window.location.href.includes('/mychecklists')) {
	if (sessionStorage.getItem('doCountEm') || sessionStorage.getItem('showAllHref')) {
		if (checkURL())
			countem();
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

	let itemObject1 = menuItem('Check for hidden checklists');
	let itemObject2 = menuItem('Help');
	let itemObject3 = menuItem('Cancel');

	dropDiv.append(itemObject1.item);
	dropDiv.append(itemObject2.item);
	dropDiv.append(itemObject3.item);

	itemObject1.p.addEventListener('click', () => {
		sessionStorage.setItem('doCountEm', 1);
		location.reload();
	});

	itemObject2.p.addEventListener('click', () => {
		location.href = 'https://www.faintlake.com/eBird/extension/Enhancements/#E1';
	});

	itemObject3.p.addEventListener('click', () => {
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

function checkURL() {
	// Inexplicably, eBird sometimes redirects to the base URL with search parameters deleted.
	// We deal with that here.
	let nextHref = '', prevHref = '';
	let bottomButtonList = document.getElementById('prev-next-all');
	if (!bottomButtonList) {
		return (true);
	}
	bottomButtonList = bottomButtonList.querySelectorAll('a'); // Previous, Next, and Show
	let showAllIndex = bottomButtonList.length - 1;	// Show all is last (Previous may be absent)

	sessionStorage.removeItem('doCountEm');

	if (showAllIndex > 0) {
		let nextButtonIndex = showAllIndex - 1;	// Next is next to last
		nextHref = bottomButtonList[nextButtonIndex].href; 	// The "Next" button at the bottom
		bottomButtonList[nextButtonIndex].addEventListener('click', () => {
			sessionStorage.setItem('nextPage', nextHref);
			sessionStorage.setItem('doCountEm', 1)
		})

		if (nextButtonIndex > 0) {
			let prevButtonIndex = nextButtonIndex - 1;	// prev is before next, if present
			prevHref = bottomButtonList[prevButtonIndex].href; 	// The "Previous" button at the bottom
			bottomButtonList[prevButtonIndex].addEventListener('click', () => {
				sessionStorage.setItem('nextPage', prevHref);
				sessionStorage.setItem('doCountEm', 1)
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
				sessionStorage.setItem('doCountEm', 1);
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
	displayToggle();
}

function countOne(listItems, i) {
	let checklistID, href;
	let li = listItems[i];
	if (li.getAttribute('id')) {
		checklistID = li.getAttribute('id');
		href = li.querySelector('a').getAttribute('href').trim();
		li.querySelector('a').setAttribute('target', '_blank');
		fetchHTML(href, checklistID);
	}
	if (i+1 < listItems.length) {
		setTimeout(() => {
			countOne(listItems, i+1);
		}, 235);
	}
}

function displayToggle() {
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
	myDiv.append("Show only hidden");
	myDiv.addEventListener('click', () => {
		let text = myDiv.textContent;
		let all;
		if (text == "Show only hidden") {
			myDiv.textContent = "Show hidden/unhidden";
			all = false;
		} else {
			myDiv.textContent = "Show only hidden";
			all = true;
		}
		for (let li of listItems) {
			if (all) {
				li.style.display = 'grid';
			} else {
				if (!li.classList.contains('hiddenChecklist')) {
					li.style.display = 'none';
				}
			}
		}
	});
}

async function fetchHTML(path, id) {
	let url = 'https://ebird.org' + path;
	await fetch(url, {mode: "cors"})
		.then((response) => {
			return response.text();
		})
		.then((data) => {
			if (data.indexOf('>Checklist flagged</span>') > 0) {
				document.getElementById(id).style.backgroundColor = 'yellow';
				document.getElementById(id).classList.add('hiddenChecklist');
			} else {
				document.getElementById(id).style.backgroundColor = '#8f8';
			}			

		})
		.catch(function (error) {
			console.log('Error on ' + id);
			console.log(error);
		});
}

