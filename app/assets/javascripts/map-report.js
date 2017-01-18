 function loadPage(){
  console.log("weee something happened");
    // baltimore harbor
    var center = {
     lat: 39.26642,
     lng: -76.57007
    };
    var zoom = 17;
    var check = []

    // usa
    var center = {
     lat: 37.09024,
     lng: -95.44922
    };
    var zoom = 5;

    // earth
    var center = {
     lat: 0,
     lng: 0
    };
    var zoom = 1;

    // // // 4 corners
    // // var center = {
    // //  lat: 36.99871,
    // //  lng: -109.04343
    // // };
    // // var zoom = 10;
    // // var check = []

    // // // texas  multicolor
    // // var center = {
    // //   lat: 33.95020,
    // //   lng: -99.37134
    // // };
    // // var zoom = 8;
    // // var check = []

    // // texas  downtown
    // var center = {
    //  lat: 33.90234,
    //  lng: -98.48419
    // };
    // var zoom = 15;
    // var check = []

    var width = 512;
    var height = width;
    var scale = 1;

    var bbox = latLngToBbox(center.lat, center.lng, zoom, width, height, 256);
    console.log(bbox);

    document.getElementById('qnmc-image').src = buildWMSUrl({
      bbox: bbox.join(','),
      width: width*scale,
      height:height*scale,
      layer: 'qnmc'
    });

    document.getElementById('qct-image').src = buildWMSUrl({
      bbox: bbox.join(','),
      width: width*scale,
      height:height*scale,
      layer: 'qct'
    });

    document.getElementById('il-image').src = buildWMSUrl({
      bbox: bbox.join(','),
      width: width*scale,
      height:height*scale,
      layer: 'indian_lands'
    });

    document.getElementById('map-image').src = googleStatic({
      center: center,
      width: width,
      height: height,
      scale: scale,
      zoom: zoom
    });
  };

  // ////////////////
  // coordinate converters
  // ////////////////


  function getTileNumber(lat, lng, zoom){
    var xtile, ytile;
    n = 2**zoom;
    xtile = (n * (lng+180.0)/360.0);
    lat_rad = Math.radians(lat);
    ytile = ((1.0 - Math.log(Math.tan(lat_rad) + Math.sec(lat_rad) ) / Math.PI) / 2.0 * n);
    return [xtile, ytile];
  }

  function tile2Lng(xtile, zoom){
    var n = 2 ** zoom;
    return xtile / n * 360.0 - 180.0;
  }

  function tile2Lat(ytile, zoom){
    var n = 2 ** zoom;
    return Math.degrees( Math.atan( Math.sinh( Math.PI * (1 - 2 * ytile / n) ) ) );
  }

  function latLngToBbox(lat, lng, zoom, width, height, tile_size){
    var xtile_w, xtile_e, ytile_s, ytile_n;
    var bbox = {};
    var tileNumbers = getTileNumber(lat, lng, zoom);
    var tileNumberX_fraction = 1*('0.' + tileNumbers[0].toString().split('.')[1]) || 0;
    var tileNumberY_fraction = 1*('0.' + tileNumbers[1].toString().split('.')[1]) || 0;
    xtile_w = (tileNumbers[0] * tile_size - (width/2)) / tile_size;
    xtile_e = (tileNumbers[0] * tile_size + (width/2)) / tile_size;
    ytile_s = (tileNumbers[1] * tile_size + (height/2)) / tile_size;
    ytile_n = (tileNumbers[1] * tile_size - (height/2)) / tile_size;
    bbox.w = tile2Lng(xtile_w, zoom);
    bbox.s = tile2Lat(ytile_s, zoom);
    bbox.e = tile2Lng(xtile_e, zoom);
    bbox.n = tile2Lat(ytile_n, zoom);
    webMSW = toWebMercator(bbox.w, bbox.s);
    webMNE = toWebMercator(bbox.e, bbox.n);
    console.log(webMSW, webMNE);
    // return [bbox.w, bbox.s, bbox.e, bbox.n];
    return [webMSW[0], webMSW[1], webMNE[0], webMNE[1]]

  }

  // ////////////////
  // url builders
  // ////////////////

  function buildWMSUrl(options){
    var url = "http://localhost:8080/geoserver/hubzone-test/wms?service=WMS";
    url += "&REQUEST=GetMap";
    url += "&SERVICE=WMS";
    url += "&VERSION=1.1.0";
    url += "&LAYERS=hubzone-test:" + options.layer;
    url += "&FORMAT=image/png" ;
    url += "&TRANSPARENT=TRUE";
    // url += "&SRS=EPSG:4326";
    url += "&SRS=EPSG:900913";
    url += "&BBOX=" + options.bbox;
    url += "&WIDTH=" + options.width;
    url += "&HEIGHT=" + options.height;
    url += "&" + styles[options.layer];
    return url;
  };

  function googleStatic(options){
    var staticMap = "https://maps.googleapis.com/maps/api/staticmap";
    staticMap += "?center=" + options.center.lat + "," + options.center.lng;
    staticMap += "&zoom=" + options.zoom;
    staticMap += "&size=" + options.width + "x" + options.height;
    staticMap += "&scale=" + options.scale;
    staticMap += "&maptype=roadmap";
    staticMap += "&key=";
    return staticMap;
  }

  // ////////////////
  // math helpers
  // ////////////////

  function toWebMercator(xLon, yLat){
    var semimajorAxis, xLon, yLat, east, north, northing;
    if ((Math.abs(xLon) > 180) && (Math.abs(yLat) > 90)){
      // coordinate out of range
      return;
    } else {
      semimajorAxis = 6378137.0;
      east = xLon * 0.017453292519943295;
      north = yLat * 0.017453292519943295;
      northing = 3189068.5 * Math.log((1.0 + Math.sin(north)) / (1.0 - Math.sin(north)))
      easting = semimajorAxis * east
      return [easting, northing];
    }
  }

  function toWGS84(xLon, yLat){
    var semimajorAxis, xLon, yLat, east, latitude, longitude;
    if ((Math.abs(xLon) < 180) && (Math.abs(yLat) > 90)){
      // coordinate out of range
      return;
    } else if ((Math.abs(xLon) > 20037508.3427892) || (Math.abs(yLat) > 20037508.3427892)){
      return;
    } else {
      semimajorAxis = 6378137.0
      latitude = (1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * yLat) / semimajorAxis)))) * (180/Math.PI);
      longitude = ((xLon / semimajorAxis) * 57.295779513082323) - ((Math.floor((((xLon / semimajorAxis) * 57.295779513082323) + 180.0) / 360.0)) * 360.0);
      return [longitude, latitude];
    }
  };

  // secant
  Math.sec = function(aValue){
    return 1/Math.cos(aValue);
  }

  // Converts from degrees to radians.
  Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
  };

  // Converts from radians to degrees.
  Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
  };

  var styles = {
    indian_lands: "SLD_BODY=%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3CStyledLayerDescriptor%20xmlns%3D%22http%3A%2F%2Fwww.opengis.net%2Fsld%22%20xmlns%3Aogc%3D%22http%3A%2F%2Fwww.opengis.net%2Fogc%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20xmlns%3Axsi%3D%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema-instance%22%20version%3D%221.0.0%22%20xsi%3AschemaLocation%3D%22http%3A%2F%2Fwww.opengis.net%2Fsld%20StyledLayerDescriptor.xsd%22%3E%3CNamedLayer%3E%3CName%3Ehubzone-test%3Aindian_lands%3C%2FName%3E%3CUserStyle%3E%3CFeatureTypeStyle%3E%3CRule%3E%3CName%3Enot%20expiring%3C%2FName%3E%3CPolygonSymbolizer%3E%3CFill%3E%3CCssParameter%20name%3D%22fill%22%3E%23984EA3%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22fill-opacity%22%3E0.5%3C%2FCssParameter%3E%3C%2FFill%3E%3CStroke%3E%3CCssParameter%20name%3D%22stroke%22%3E%23984EA3%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22stroke-width%22%3E1.25%3C%2FCssParameter%3E%3C%2FStroke%3E%3C%2FPolygonSymbolizer%3E%3C%2FRule%3E%3C%2FFeatureTypeStyle%3E%3C%2FUserStyle%3E%3C%2FNamedLayer%3E%3C%2FStyledLayerDescriptor%3E",
    qct: "SLD_BODY=%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3CStyledLayerDescriptor%20xmlns%3D%22http%3A%2F%2Fwww.opengis.net%2Fsld%22%20xmlns%3Aogc%3D%22http%3A%2F%2Fwww.opengis.net%2Fogc%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20xmlns%3Axsi%3D%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema-instance%22%20version%3D%221.0.0%22%20xsi%3AschemaLocation%3D%22http%3A%2F%2Fwww.opengis.net%2Fsld%20StyledLayerDescriptor.xsd%22%3E%3CNamedLayer%3E%3CName%3Ehubzone-test%3Aqct%3C%2FName%3E%3CUserStyle%3E%3CFeatureTypeStyle%3E%3CRule%3E%3CName%3Enot%20expiring%3C%2FName%3E%3Cogc%3AFilter%3E%3Cogc%3APropertyIsEqualTo%3E%3Cogc%3AFunction%20name%3D%22isNull%22%3E%3Cogc%3APropertyName%3Eexpires%3C%2Fogc%3APropertyName%3E%3C%2Fogc%3AFunction%3E%3Cogc%3ALiteral%3Etrue%3C%2Fogc%3ALiteral%3E%3C%2Fogc%3APropertyIsEqualTo%3E%3C%2Fogc%3AFilter%3E%3CPolygonSymbolizer%3E%3CFill%3E%3CCssParameter%20name%3D%22fill%22%3E%234DAF4A%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22fill-opacity%22%3E0.5%3C%2FCssParameter%3E%3C%2FFill%3E%3CStroke%3E%3CCssParameter%20name%3D%22stroke%22%3E%234DAF4A%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22stroke-width%22%3E1.25%3C%2FCssParameter%3E%3C%2FStroke%3E%3C%2FPolygonSymbolizer%3E%3C%2FRule%3E%3CRule%3E%3CName%3Eexpiring%3C%2FName%3E%3Cogc%3AFilter%3E%3Cogc%3APropertyIsEqualTo%3E%3Cogc%3AFunction%20name%3D%22isNull%22%3E%3Cogc%3APropertyName%3Eexpires%3C%2Fogc%3APropertyName%3E%3C%2Fogc%3AFunction%3E%3Cogc%3ALiteral%3Efalse%3C%2Fogc%3ALiteral%3E%3C%2Fogc%3APropertyIsEqualTo%3E%3C%2Fogc%3AFilter%3E%3CPolygonSymbolizer%3E%3CFill%3E%3CGraphicFill%3E%3CGraphic%3E%3CMark%3E%3CWellKnownName%3Eshape%3A%2F%2Fbackslash%3C%2FWellKnownName%3E%3CStroke%3E%3CCssParameter%20name%3D%22stroke%22%3E%234DAF4A%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22stroke-width%22%3E1.25%3C%2FCssParameter%3E%3C%2FStroke%3E%3C%2FMark%3E%3CSize%3E16%3C%2FSize%3E%3C%2FGraphic%3E%3C%2FGraphicFill%3E%3C%2FFill%3E%3CStroke%3E%3CCssParameter%20name%3D%22stroke%22%3E%234DAF4A%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22stroke-width%22%3E1.25%3C%2FCssParameter%3E%3C%2FStroke%3E%3C%2FPolygonSymbolizer%3E%3C%2FRule%3E%3C%2FFeatureTypeStyle%3E%3C%2FUserStyle%3E%3C%2FNamedLayer%3E%3C%2FStyledLayerDescriptor%3E",
    qnmc: "SLD_BODY=%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3CStyledLayerDescriptor%20xmlns%3D%22http%3A%2F%2Fwww.opengis.net%2Fsld%22%20xmlns%3Aogc%3D%22http%3A%2F%2Fwww.opengis.net%2Fogc%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20xmlns%3Axsi%3D%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema-instance%22%20version%3D%221.0.0%22%20xsi%3AschemaLocation%3D%22http%3A%2F%2Fwww.opengis.net%2Fsld%20StyledLayerDescriptor.xsd%22%3E%3CNamedLayer%3E%3CName%3Ehubzone-test%3Aqnmc%3C%2FName%3E%3CUserStyle%3E%3CFeatureTypeStyle%3E%3CRule%3E%3CName%3Enot%20expiring%3C%2FName%3E%3Cogc%3AFilter%3E%3Cogc%3APropertyIsEqualTo%3E%3Cogc%3AFunction%20name%3D%22isNull%22%3E%3Cogc%3APropertyName%3Eexpires%3C%2Fogc%3APropertyName%3E%3C%2Fogc%3AFunction%3E%3Cogc%3ALiteral%3Etrue%3C%2Fogc%3ALiteral%3E%3C%2Fogc%3APropertyIsEqualTo%3E%3C%2Fogc%3AFilter%3E%3CPolygonSymbolizer%3E%3CFill%3E%3CCssParameter%20name%3D%22fill%22%3E%23377EB8%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22fill-opacity%22%3E0.5%3C%2FCssParameter%3E%3C%2FFill%3E%3CStroke%3E%3CCssParameter%20name%3D%22stroke%22%3E%23377EB8%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22stroke-width%22%3E1.25%3C%2FCssParameter%3E%3C%2FStroke%3E%3C%2FPolygonSymbolizer%3E%3C%2FRule%3E%3CRule%3E%3CName%3Eexpiring%3C%2FName%3E%3Cogc%3AFilter%3E%3Cogc%3APropertyIsEqualTo%3E%3Cogc%3AFunction%20name%3D%22isNull%22%3E%3Cogc%3APropertyName%3Eexpires%3C%2Fogc%3APropertyName%3E%3C%2Fogc%3AFunction%3E%3Cogc%3ALiteral%3Efalse%3C%2Fogc%3ALiteral%3E%3C%2Fogc%3APropertyIsEqualTo%3E%3C%2Fogc%3AFilter%3E%3CPolygonSymbolizer%3E%3CFill%3E%3CGraphicFill%3E%3CGraphic%3E%3CMark%3E%3CWellKnownName%3Eshape%3A%2F%2Fbackslash%3C%2FWellKnownName%3E%3CStroke%3E%3CCssParameter%20name%3D%22stroke%22%3E%23377EB8%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22stroke-width%22%3E1.25%3C%2FCssParameter%3E%3C%2FStroke%3E%3C%2FMark%3E%3CSize%3E16%3C%2FSize%3E%3C%2FGraphic%3E%3C%2FGraphicFill%3E%3C%2FFill%3E%3CStroke%3E%3CCssParameter%20name%3D%22stroke%22%3E%23377EB8%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22stroke-width%22%3E1.25%3C%2FCssParameter%3E%3C%2FStroke%3E%3C%2FPolygonSymbolizer%3E%3C%2FRule%3E%3C%2FFeatureTypeStyle%3E%3C%2FUserStyle%3E%3C%2FNamedLayer%3E%3C%2FStyledLayerDescriptor%3E"
  };
