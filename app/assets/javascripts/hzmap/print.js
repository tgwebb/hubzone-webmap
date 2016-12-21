// Container for map bounds so we can reset it after print
var mapBounds = {};
var mapCenter = {};
var mapZoom = null;

// Catch control+p and re-layout page for printing
$(document).bind("keydown", catchKeyStrokeToPrint);

function catchKeyStrokeToPrint(e){
  if((e.ctrlKey || e.metaKey) && e.keyCode === 80){
    catchPrintEvent(e, 1000);
  } else {
    return;
  }
}

// Listener for map icon click
$(function() {
  $('#map-print').click(catchPrintEvent);
});

// Handle the print event
function catchPrintEvent(e, wait){
  e.preventDefault();
  wait = wait || 1000;
  beforePrint();
  window.setTimeout(function(){
    window.print();
  }, wait);
}

// Web-kit
var mediaQueryList = window.matchMedia('print');
mediaQueryList.addListener(catchMediaQuery);

//helper for catching the media query
function catchMediaQuery(mql){
  if (!mql.matches) {
      afterPrint();
  } else {
    return;
  }
}

// window.onbeforeprint = function() {
//   catchPrintEvent(1000);
// };
// window.onafterprint = function() {
//   afterPrint(mapBounds);
// };


// Rebuild the map before printing
function beforePrint() {
  mapBounds = map.getBounds();
  mapCenter = map.getCenter();
  mapZoom = map.getZoom();

  $('.map-body').addClass('printable-map');
  google.maps.event.removeListener(mapIdleListener);
  google.maps.event.trigger(map, 'resize');
  // map.fitBounds(mapBounds);

  if (mapMarkers.length > 0){
    map.setCenter(mapMarkers[0].position);
  } else {
    map.setCenter(mapCenter);
  }

  sidebar.close();

  $('#sidebar button.usa-accordion-button').map(clickAccordion);
}


//reset the map after print
function afterPrint() {
  $('.map-body').removeClass('printable-map');
  //add back in the map listener
  mapIdleListener = google.maps.event.addListener(map, 'idle', updateIdleMap);
  google.maps.event.trigger(map, 'resize');
  map.setCenter(mapCenter);
  map.setZoom(mapZoom);
  sidebar.open();
  $('#sidebar button.usa-accordion-button').map(clickAccordion);
}

// Helper for triggering accordions
function clickAccordion(index, el){
  $(el).trigger('click');
}
