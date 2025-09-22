if (window.location.pathname.includes('region/') || window.location.href.includes('hotspot/')) {
	// Don't redirect if the first two path elements are the same as in referrer
	// In Firefox but not Chrome, document.referrer is empty string on a redirect; check for length of 0

	let pathArray = document.referrer.split('/').slice(3);	// slice off protocol and domain
	let referringPath = pathArray[0] + '/' + pathArray[1];

	pathArray = window.location.pathname.split('/').slice(1);	// slice off leading '/'
	let currentPath = pathArray[0] + '/' + pathArray[1];

	if (document.referrer.length && currentPath !== referringPath) {
		// We are coming from a different page, so redirect if needed
		reDirect();
	} else {
		// Not redirecting because coming from same page or referrer empty
		addRegionButton();
	}
}

function reDirect() {
	if (!options.regionView) {
		setTimeout(reDirect, 100);
	} else {
		if (options.regionView != 'Month') {	// Redirect unless they are asking for the default
			switchTo(options.regionView);
		}
	}
}

function switchTo(target) {	// Redirect to the desired view
	let URLarray = window.location.pathname.slice(1).split('/');
	let url = window.location.origin + '/' + URLarray[0] + '/' + URLarray[1];	// Keep only the first two elements of the path

	switch (target) {
		case 'Month':
			break;
		case 'Year':
			url += '?yr=cur';
			break;
		case 'Bird List':
			url += '/bird-list';
			break;
		case 'Recent Checklists':
			url += '/recent-checklists';
			break;
		default:
	}
	console.log('Switching to', window.location.href = url);
	window.location.href = url;
}

function selectListener() {
	let select = document.getElementById('selectView');
	let selected = select.options[select.selectedIndex].value;
	options.regionView = selected;
	saveOptions();

	switchTo(selected);
}
	
function addRegionButton() {
	const focusColor = '#eeddbb';

	let containerDiv = document.querySelector('div.RegionSearch');
	if (containerDiv) {
		let myDiv = document.createElement('div');
		myDiv.setAttribute('tabindex', '-1');
		myDiv.setAttribute('class', 'Dropdown');;

		let h3 = document.createElement('h3');
		h3.setAttribute('tabindex', '-1');
		h3.setAttribute('class', 'Dropdown-heading');
		h3.classList.add('u-text-3');
		myDiv.append(h3);

		let h3div = document.createElement('div');
		h3.append(h3div)
		h3div.append('Add-ons');

		let closerSpan = document.createElement('span');
		closerSpan.setAttribute('class', 'Dropdown-closer');
		h3.append(closerSpan);

		let panelDiv = document.createElement('div');
		panelDiv.setAttribute('tabindex', '-1');
		panelDiv.setAttribute('class', 'Dropdown-panel');
		myDiv.append(panelDiv);

		let panelTitleDiv = document.createElement('div');
		panelTitleDiv.append('Add-on Options');
		panelDiv.append(panelTitleDiv);

		let selectDiv = document.createElement('div');
		selectDiv.setAttribute('dontsaveselection', '');
		selectDiv.setAttribute('class', 'InputSelect');
		panelDiv.append(selectDiv);

		let label = document.createElement('label');
		label.append('Default view');
		selectDiv.append(label);
		let select = document.createElement('select');
		selectDiv.append(select);
		let optionNull = document.createElement('option');
		optionNull.setAttribute('value', '');
		optionNull.setAttribute('selected', 'selected');
		optionNull.setAttribute('disabled', 'disabled');
		optionNull.append('Change default view');
		select.style.height = '3em';
		select.setAttribute('id', 'selectView');
		select.addEventListener('change', selectListener);
		select.append(optionNull);

		let option1 = document.createElement('option');
		option1.setAttribute('value', 'Month');
		if (options.regionView == 'Month') {
			option1.style.backgroundColor = focusColor;
		}
		option1.append('This Month');
		select.append(option1);

		let option2 = document.createElement('option');
		option2.setAttribute('value', 'Year');
		if (options.regionView == 'Year') {
			option2.style.backgroundColor = focusColor;
		}
		option2.append('This Year');
		select.append(option2);

		let option3 = document.createElement('option');
		option3.setAttribute('value', 'Bird List');
		if (options.regionView == 'Bird List') {
			option3.style.backgroundColor = focusColor;
		}
		option3.append('Bird List');
		select.append(option3);

		let option4 = document.createElement('option');
		option4.setAttribute('value', 'Recent Checklists');
		if (options.regionView == 'Recent Checklists') {
			option4.style.backgroundColor = focusColor;
		}
		option4.append('Recent Checklists');
		select.append(option4);

		containerDiv.appendChild(myDiv);
	} else {
		console.log('Waiting to add region button');
		setTimeout(500, addRegionButton);
	}
}
