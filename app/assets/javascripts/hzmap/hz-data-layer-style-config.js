// hubzone data layer style config
var defaultFillOpacity = 0.5;
var defaultStrokeOpacity = 1;
var defaultStrokeWidth = 1.25;
// this object holds the current google overlays in the .overlay array and the per layer styles
// order in this object defines draw order on the map:
// first object is drawn first, then next on top of that, etc.
var hzWMSOverlays = {
  indian_lands: {
  	overlay: [],
  	style: {
	    fillColor: '#984EA3',
	    fillOpacity: defaultFillOpacity,
	    strokeColor: '#984EA3',
	    strokeOpacity: defaultStrokeOpacity,
	    strokeWidth: defaultStrokeWidth,
	    styleExpiring: false
  	}
  },
  qnmc: {
  	overlay: [],
  	style: {
	    fillColor: '#377EB8',
	    fillOpacity: defaultFillOpacity,
	    strokeColor: '#377EB8',
	    strokeOpacity: defaultStrokeOpacity,
	    strokeWidth: defaultStrokeWidth,
	    styleExpiring: true
  	}
  },
  qct: {
  	overlay:[],
  	style: {
	    fillColor: '#4DAF4A',
	    fillOpacity: defaultFillOpacity,
	    strokeColor: '#4DAF4A',
	    strokeOpacity: defaultStrokeOpacity,
	    strokeWidth: defaultStrokeWidth,
	    styleExpiring: true
  	}
  },
  brac: {
  	overlay: [],
  	style: {
	    fillColor: '#FF7F00',
	    fillOpacity: defaultFillOpacity,
	    strokeColor: '#FF7F00',
	    strokeOpacity: defaultStrokeOpacity,
	    strokeWidth: defaultStrokeWidth,
	    styleExpiring: true
  	}
  }
};

// helperfunction for building out the style object
/* exported constructSLDXML */
function constructSLDXML(layer){
	var style = hzWMSOverlays[layer].style;
  return encodeURIComponent('<?xml version="1.0" encoding="UTF-8"?>' +
          '<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">' + 
          '<NamedLayer>' +
          '<Name>hubzone-test:' + layer + '</Name>' +
          '<UserStyle>' +
          '<FeatureTypeStyle>' +
          (style.styleExpiring ? styleWithExpiration(style) : styleWithoutExpiration(style) ) + 
          '</FeatureTypeStyle>' +
          '</UserStyle>' +
          '</NamedLayer>' +
          '</StyledLayerDescriptor>');
}

function styleWithExpiration(style){
return ('<Rule>' + 
        '<Name>not expiring</Name>' + 
        '<ogc:Filter>' + 
        '<ogc:PropertyIsEqualTo>' + 
        '<ogc:Function name="isNull">' + 
        '<ogc:PropertyName>stop</ogc:PropertyName>' + 
        '</ogc:Function>' + 
        '<ogc:Literal>true</ogc:Literal>' + 
        '</ogc:PropertyIsEqualTo>' + 
        '</ogc:Filter>' + 
        '<PolygonSymbolizer>' + 
        '<Fill>' + 
        '<CssParameter name="fill">' + style.fillColor + '</CssParameter>' + 
        '<CssParameter name="fill-opacity">' + style.fillOpacity + '</CssParameter>' + 
        '</Fill>' + 
        '<Stroke>' + 
        '<CssParameter name="stroke">' + style.strokeColor + '</CssParameter>' + 
        '<CssParameter name="stroke-width">' + style.strokeWidth + '</CssParameter>' + 
        '</Stroke>' + 
        '</PolygonSymbolizer>' + 
        '</Rule>' + 
        '<Rule>' + 
        '<Name>expiring</Name>' + 
        '<ogc:Filter>' + 
        '<ogc:PropertyIsEqualTo>' + 
        '<ogc:Function name="isNull">' + 
        '<ogc:PropertyName>stop</ogc:PropertyName>' + 
        '</ogc:Function>' + 
        '<ogc:Literal>false</ogc:Literal>' + 
        '</ogc:PropertyIsEqualTo>' + 
        '</ogc:Filter>' + 
        '<PolygonSymbolizer>' + 
        '<Fill>' + 
        '<GraphicFill>' + 
        '<Graphic>' + 
        '<Mark>' + 
        '<WellKnownName>shape://backslash</WellKnownName>' + 
        '<Stroke>' + 
        '<CssParameter name="stroke">' + style.strokeColor + '</CssParameter>' + 
        '<CssParameter name="stroke-width">' + style.strokeWidth + '</CssParameter>' + 
        '</Stroke>' + 
        '</Mark>' + 
        '<Size>16</Size>' + 
        '</Graphic>' + 
        '</GraphicFill>' + 
        '</Fill>' + 
        '<Stroke>' + 
        '<CssParameter name="stroke">' + style.strokeColor + '</CssParameter>' + 
        '<CssParameter name="stroke-width">' + style.strokeWidth + '</CssParameter>' + 
        '</Stroke>' + 
        '</PolygonSymbolizer>' + 
        '</Rule>');
}

function styleWithoutExpiration(style){
  return ('<Rule>' + 
          '<Name>not expiring</Name>' + 
          '<PolygonSymbolizer>' + 
          '<Fill>' + 
          '<CssParameter name="fill">' + style.fillColor + '</CssParameter>' + 
          '<CssParameter name="fill-opacity">' + style.fillOpacity + '</CssParameter>' + 
          '</Fill>' + 
          '<Stroke>' + 
          '<CssParameter name="stroke">' + style.strokeColor + '</CssParameter>' + 
          '<CssParameter name="stroke-width">' + style.strokeWidth + '</CssParameter>' + 
          '</Stroke>' + 
          '</PolygonSymbolizer>' + 
          '</Rule>');
}

