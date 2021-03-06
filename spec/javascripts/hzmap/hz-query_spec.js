//= require hzmap/hz-query
//= require hzmap/markers
//= require hzmap/map-utils
//= require hzmap/sidebar
/* jshint unused: false */
/* jshint undef: false */

describe ('Testing hz-query functions', function() {
  beforeEach(function(){
    fixture.cleanup();
    this.fixtures = fixture.load("hz_mock_sidebar.html", "hz_mock_page.html", true);
    google = HZSpecHelper.google;
    HZApp.SidebarUtils.buildSidebar();
    sidebar = HZApp.SidebarUtils.sidebar;
    HZApp.map = new google.maps.Map();
    $('#sidebar').css('display', 'initial');
    HZApp.Markers.hzQueryMarker = new HZApp.Constructors.HubzoneMapMarker({icon: null});
    HZApp.HZQuery = HZSpecHelper.resetHZQuery(HZApp.HZQuery);
  });

  afterEach(function(){
    HZApp.map = {};
    HZSpecHelper.mockPage.destroy();
    HZApp.SidebarUtils.sidebar = {};
    sidebar = {};
  });

  //pass over the different search responses
  HZSpecHelper.searchResponses.map(function(response){
    describe ('should handle a ' + response.mockResponseType, function(){

      it ('should correctly parse the response object', function(){
        spyOn(HZApp.HZQuery, 'handleBadResponses');
        spyOn(HZApp.HZQuery, 'parseResponseGeometry');
        spyOn(HZApp.HZQuery, 'updateMap');

        HZApp.HZQuery.parseResponse(response);
        expect(HZApp.HZQuery.handleBadResponses.calls.count()).toEqual(1);
        expect(HZApp.HZQuery.parseResponseGeometry.calls.count()).toEqual(1);
        expect(HZApp.HZQuery.updateMap.calls.count()).toEqual(1);
        expect(HZApp.HZQuery.response).toEqual(response);
      });

      var sidebarVisibilty = (response.mockResponseType === 'good response');

      it ('the report button/card should be ' + (sidebarVisibilty ? ' visible' : ' not visible'), function(){
        HZApp.HZQuery.handleBadResponses(response.status);

        expect(HZApp.HZQuery.query.latlng).toEqual(null);
        expect(HZApp.HZQuery.query.q).toEqual(null);
        expect($('.sidebar-card.map-actions').is(':visible')).toBe(sidebarVisibilty);
      });

      it ('should update the map', function(){
        spyOn(HZApp.SidebarUtils.sidebar, 'open');
        spyOn(HZApp.Markers.hzQueryMarker, 'updateMarkers');

        HZApp.HZQuery.updateMap();

        expect(HZApp.SidebarUtils.sidebar.open.calls.count()).toEqual(1);
        expect(HZApp.Markers.hzQueryMarker.updateMarkers.calls.count()).toEqual(1);
      });

      if (response.mockResponseType === 'good response'){
        if (response.place_id !== null && response.place_id !== undefined){
          describe ('should correctly parse the response geometry from an address search', function(){
            beforeEach(function() {
              spyOn(HZApp.MapUtils, 'jumpToLocation');
              HZApp.HZQuery.parseResponseGeometry(response);
            });
            it ('should parse the geocodeLocation', function(){
              expect(HZApp.HZQuery.response.geocodeLocation).toEqual(response.geometry.location);
            });
            it ('should parse the formatted address', function(){
              expect(HZApp.HZQuery.query.q).toEqual(response.formatted_address);
            });
            it ('should have a null latlng', function(){
              expect(HZApp.HZQuery.query.latlng).toBe(null);
            });
            it ('should call jumpToLocation once', function(){
              expect(HZApp.MapUtils.jumpToLocation.calls.count()).toEqual(1);
            });
          });
        } else {
          describe ('should correctly parse the response geometry from a map click', function(){
            beforeEach(function() {
              spyOn(HZApp.MapUtils, 'jumpToLocation');
              HZApp.HZQuery.parseResponseGeometry(response);
            });
            it ('should parse the geocodeLocation', function(){
              expect(HZApp.HZQuery.response.geocodeLocation).toEqual(response.geometry.location);
            });
            it ('should have a null query', function(){
              expect(HZApp.HZQuery.query.q).toBe(null);
            });
            it ('should parse the latlng', function(){
              var latlng = [response.geometry.location.lat, response.geometry.location.lng ].join(',');
              expect(HZApp.HZQuery.query.latlng).toEqual(latlng);
            });
            it ('should call jumpToLocation once', function(){
              expect(HZApp.MapUtils.jumpToLocation.calls.count()).toEqual(1);
            });
            it ('should display the coordinates on the sidebar', function(){
              var display_coords = [response.geometry.location.lat.toFixed(6), response.geometry.location.lng.toFixed(6)].join(',');
              expect(document.getElementById('search-field-small').value).toEqual(display_coords);
            });
          });
        }
      } else {
        it ('should correctly parse the response geometry when a ' + response.mockResponseType, function(){
          spyOn(HZApp.HZQuery, 'handleBadResponses');
          spyOn(HZApp.HZQuery, 'parseResponseGeometry').and.callThrough();
          spyOn(HZApp.HZQuery, 'updateMap');
          HZApp.HZQuery.parseResponse(response);
          expect(HZApp.HZQuery.response.geocodeLocation).toBe(null);
        });
      }

    });
  });

  describe('should handle street view', function () {
    it ("should reset the street view on search", function(){
      var hz_elem  = $('div[jsaction="closeControl.click"]');
      spyOn(hz_elem, 'click').and.callThrough();
      HZApp.HZQuery.resetStreetView(hz_elem);
      expect(hz_elem.click.calls.count()).toEqual(1);
    });
  });

});
