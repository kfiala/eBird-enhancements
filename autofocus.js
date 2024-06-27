
switch (window.location.pathname) {
	case '/map': 		document.getElementById('findspp').focus(); break;
	case '/hotspots': document.getElementById('find-hotspot').focus(); break;
	case '/explore': 	document.getElementById('species').focus(); break;
	case '/catalog': 	document.getElementById('taxonFinder').focus(); break;
	case '/targets': 	document.getElementById('targets-region-input').focus(); break;
	default:
}
