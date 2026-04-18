if (window.location.pathname.includes('region/') || window.location.href.includes('hotspot/')) {
	// Don't redirect if the first two path elements are the same as in referrer
	// In Firefox but not Chrome, document.referrer is empty string on a redirect; check for length of 0

	let referrer = document.referrer.split('?')[0]; // Strip off any query parameters
	
	let pathArray = referrer.split('/').slice(3);	// slice off protocol and domain
	let referringPath = pathArray[0] + '/' + pathArray[1];

	pathArray = window.location.pathname.split('/').slice(1);	// slice off leading '/'
	let currentPath = pathArray[0] + '/' + pathArray[1];

	if (referrer.length && currentPath !== referringPath) {
		reDirect();	// We are coming from a different page, so it is first entry, redirect if needed
	} else {
		finishRedirect(); // This should be the second entry, after the redirect. No further redirects.
	}
}

function finishRedirect() {
	if (!options.regionView) {
		setTimeout(finishRedirect, 100);
	} else {
		addRegionButton();	// Completion of second entry, just add our button.
	}
}

function reDirect() {
	if (!Object.hasOwn(options, 'regionView')) {
		setTimeout(reDirect, 100);
	} else {
		let target = setTarget();
		switchTo(target);
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
		case 'About':
			url += '/about';
			break;
		case 'IconicMonth':
			if (window.location.href.includes('hotspot/'))
				url += '/iconic-birds?yr=curM'; 
			break;
		case 'IconicYear':
			if (window.location.href.includes('hotspot/'))
				url += '/iconic-birds';
			break;
		case 'Bird List':
			url += '/bird-list';
			break;
		case 'Recent Checklists':
			url += '/recent-checklists';
			break;
		default:
	}
	window.location.href = url;
}

function selectListener() {
	let select = document.getElementById('selectView');
	let selected = select.options[select.selectedIndex].value;
	options.regionView = selected;
	saveOptions();

	let target = setTarget();
	switchTo(target);
}

function setTarget() {
	let target = options.regionView;
	if (window.location.href.includes('region/')) { // Regions don't do iconic
		switch (target) {
			case "IconicMonth":
				target = 'Month';
				break;
			case "IconicYear":
				target = 'Year';
				break;
			default:
		}
	}
	return target;
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

		function setupOption(code, display) {

			let option = document.createElement('option');
			option.setAttribute('value', code); // 'IconicMonth'
			if (options.regionView == code) {
				option.style.backgroundColor = focusColor;
			}
			option.append(display);	// 'Iconic Birds--This Month'
			select.append(option);
		}

		setupOption('Month', 'Overview--This Month');
		setupOption('Year', 'Overview--This Year');
		setupOption('About', 'About');
		setupOption('IconicMonth', 'Iconic Birds--This Month');
		setupOption('IconicYear', 'Iconic Birds--All Months');
		setupOption('Bird List', 'Bird List');
		setupOption('Recent Checklists', 'Recent Checklists');

		containerDiv.appendChild(myDiv);
	} else {
		setTimeout(500, addRegionButton);
	}
}
