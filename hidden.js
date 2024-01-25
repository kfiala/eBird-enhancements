if (window.location.href.includes('/mychecklists')) {
	if (sessionStorage.getItem('doCountEm')) {
		checkLocation();
		countem();
//		sessionStorage.removeItem('doCountEm');
	} else {
		addChecklistsButton();
	}
}

function addChecklistsButton() {
	let containerDiv = document.querySelector('div#toolbar');

	let myDiv = document.createElement('div');
	myDiv.setAttribute('class', 'Toolbar-group');
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

	let subSpan = document.createElement('span');
	subSpan.setAttribute('class', 'u-hideForMedium');
	subSpan.classList.add('is-visuallyHidden');
	subSpan.append(document.createTextNode('Add-ons'));
	myAnchor.append(subSpan);

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

	let item1 = document.createElement('div');
	item1.setAttribute('class', 'GridFlex');
	dropDiv.append(item1);

	let p1 = document.createElement('p');
	p1.append('Check for hidden checklists');
	item1.append(p1);

	let item2 = document.createElement('div');
	item2.setAttribute('class', 'GridFlex');
	dropDiv.append(item2);

	let p2 = document.createElement('p');
	p2.append('Help');
	item2.append(p2);
	
	p1.addEventListener('click', () => {
		sessionStorage.setItem('doCountEm', 1);
		location.reload();
	});
	p2.addEventListener('click', () => {
		location.href = 'https://www.faintlake.com/eBird/extension/Enhancements/#E1';
	});
}

function checkLocation() {
	// Inexplicably, eBird sometimes redirects to the base URL with search parameters deleted.
	// We deal with that here.
	let hollowButtonList = document.querySelectorAll('a.Button--hollow');
	let next;
	sessionStorage.removeItem('doCountEm');
	for (let f = 0; f < hollowButtonList.length; f++) {
		if (hollowButtonList[f].textContent.trim() == 'Next') {
			next = hollowButtonList[f].href; 	// The "Next" button at the bottom
			hollowButtonList[f].addEventListener('click', () => { sessionStorage.setItem('doCountEm',1) })
		}
	}

	let expectedPage = sessionStorage.getItem('nextPage');
	if (expectedPage) {
		reloadCounter = Number(sessionStorage.getItem('reloadCounter'));
		console.log('Reload counter was ' + reloadCounter);
		if (expectedPage != location.href && location.search == '') {
			sessionStorage.setItem('reloadCounter', ++reloadCounter);
			if (reloadCounter < 2) {
				console.log('*********************************Need to reload*********************************************');
				sessionStorage.setItem('doCountEm', 1);
				location.replace(expectedPage);
			}
			else
				console.log('Too many mis-loads');
		} else if (expectedPage != location) {
			console.log(expectedPage + ' is expected; got ' + location);
		} else if (location.search == '') {
			console.log('Did not get search parms');
		} else {
			console.log('Got expected page, zeroing reloadCounter');
			sessionStorage.setItem('reloadCounter', 0);
		}
	}
	sessionStorage.setItem('nextPage', next);
}

function countem() {
	let checklistID, href;
	let listItems = document.getElementById('place-species-observed-results').querySelectorAll('li');
	for (let li of listItems) {
		if (li.getAttribute('id')) {
			checklistID = li.getAttribute('id');
			href = li.querySelector('a').getAttribute('href').trim();
			li.querySelector('a').setAttribute('target', '_blank');
			fetchHTML(href, checklistID);
		}
	}
	displayToggle();
}

function displayToggle() {
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
	document.getElementById('prev-next-all').append(myDiv);
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
			console.log(error);
		});
}

