//= require hzmap/sidebar
//= require hzmap/ga
//= require hzmap/cookies
/* jshint unused: false */
/* jshint undef: false */

describe ('Testing sidebar operations', function() {
  beforeEach(function() {
    fixture.cleanup();
    this.fixtures = fixture.load("hz_mock_sidebar.html", "hz_mock_legend.html", true);
    HZApp.SidebarUtils.buildSidebar();
    sidebar = HZApp.SidebarUtils.sidebar;
  });

  afterEach(function() {
    HZApp.SidebarUtils.sidebar = {};
    sidebar = {};
  });

  it ("should create a sidebar", function(){
    expect(sidebar).toBeDefined();
  });
  it ("should be hidden initially", function() {
    expect(sidebar.hasClass('hidden')).toBe(true);
  });
  describe("sidebar opening behavior", function(){
    it ("should open and move legend on mobile", function() {
      sidebar.open();
      expect(sidebar.hasClass('on')).toBe(true);
      expect($('#legend')[0].className).toContain('legend-mobile');
    });

    it ("should catch the button click to trigger the sidebar to close", function() {
      sidebar.open();
      HZApp.SidebarUtils.triggerSidebar();
      expect(sidebar.hasClass('closed')).toBe(true);
    });
  });

  describe("sidebar closing behavior", function(){
    it ("should close and move legend on mobile", function() {
      sidebar.close();
      expect(sidebar.hasClass('hidden')).toBe(true);
      expect($('#legend')[0].className).not.toContain('legend-mobile');
    });

    it ("should catch the button click to trigger the sidebar to open", function() {
      sidebar.close();
      HZApp.SidebarUtils.triggerSidebar();
      expect(sidebar.hasClass('on')).toBe(true);
    });
  });


  describe("sidebar clearing behavior", function(){
    it ("should empty out divs", function() {
      sidebar.clear();
      expect(sidebar.hasClass('hidden')).toBe(true);
      $('.clearable').each(function(i, elem) {
        expect(elem.innerHTML).toEqual('');
      });
    });
  });

  describe("additional details open/close behavior", function(){
    var accordion, rows;
    // before each, set the accordion to the 'closed' state
    beforeEach(function(){
      accordion = $('.additional-details-expand');
      rows = document.querySelectorAll('.designation-details-row');
      HZApp.Cookies.setItem('hz-sbq-open', false);
      document.querySelector('span.additional-details-expand.show').hidden = false;
      document.querySelector('span.additional-details-expand.hide').hidden = true;
    });

    it ("should be closed by default on sidebar open", function(){
      sidebar.open();
      expect(document.querySelector('span.additional-details-expand.show').hidden).toEqual(false);
      expect(document.querySelector('span.additional-details-expand.hide').hidden).toEqual(true);
      expect(HZApp.Cookies.getItem('hz-sbq-open')).toEqual('false');
    });

    it ("should open the additonal details panel", function(){
      sidebar.open();
      accordion = $('.additional-details-expand.show');
      HZApp.SidebarUtils.bindAccordion(accordion);
      accordion.trigger('click');
      expect(document.querySelector('span.additional-details-expand.show').hidden).toEqual(true);
      expect(document.querySelector('span.additional-details-expand.hide').hidden).toEqual(false);
      expect(HZApp.Cookies.getItem('hz-sbq-open')).toEqual('true');
    });

    it ("should close the additonal details panel", function(){
      sidebar.open();
      accordion = $('.additional-details-expand.hide');
      HZApp.SidebarUtils.bindAccordion(accordion);
      HZApp.SidebarUtils.setAccordionOpenState(accordion, true);
      accordion.trigger('click');
      expect(document.querySelector('span.additional-details-expand.show').hidden).toEqual(false);
      expect(document.querySelector('span.additional-details-expand.hide').hidden).toEqual(true);
      expect(HZApp.Cookies.getItem('hz-sbq-open')).toEqual('false');
    });

    it ("should load a closed accordion if the cookie is closed on load", function(){
      HZApp.Cookies.setItem('hz-sbq-open', false);
      accordion = $('.additional-details-expand.show');
      HZApp.SidebarUtils.setAccordionStateFromCookie(accordion);
      expect(document.querySelector('span.additional-details-expand.show').hidden).toEqual(false);
      expect(document.querySelector('span.additional-details-expand.hide').hidden).toEqual(true);
      expect(HZApp.Cookies.getItem('hz-sbq-open')).toEqual('false');
    });

    it ("should load a open accordion if the cookie is open on load", function(){
      HZApp.Cookies.setItem('hz-sbq-open', true);
      accordion = $('.additional-details-expand.show');
      HZApp.SidebarUtils.setAccordionStateFromCookie(accordion);
      expect(document.querySelector('span.additional-details-expand.show').hidden).toEqual(true);
      expect(document.querySelector('span.additional-details-expand.hide').hidden).toEqual(false);
      expect(HZApp.Cookies.getItem('hz-sbq-open')).toEqual('true');
    });

    it ("should set the cookie accordion state, and bind clicks to accordion", function(){
      HZApp.Cookies.setItem('hz-sbq-open', true);
      accordion = $('.additional-details-expand.hide');
      HZApp.SidebarUtils.updateAccordion(accordion);
      accordion.trigger('click');
      expect(document.querySelector('span.additional-details-expand.show').hidden).toEqual(false);
      expect(document.querySelector('span.additional-details-expand.hide').hidden).toEqual(true);
      expect(HZApp.Cookies.getItem('hz-sbq-open')).toEqual('false');
    });
  });

  it ("should update the attributes on the qualifications div for the screen reader", function(){
    var hz_elem  = $('#hubzone-qualifications');
    spyOn(hz_elem, 'focus').and.callThrough();
    HZApp.SidebarUtils.updateA11yFocus(hz_elem);
    expect(hz_elem.attr('aria-live')).toEqual('rude');
    expect(hz_elem.attr('tabindex')).toEqual('-1');
    expect(hz_elem.focus.calls.count()).toEqual(1);
  });
  it ("should recenter the map when the address marker is clicked", function(){
    var hz_clickable_marker  = $('#hubzone-clickable-marker');

    //spy on updating the center
    spyOn(HZApp.SidebarUtils, 'clickableMapMarker').and.callThrough();

    //trigger the button click and expect the update center to be called
    hz_clickable_marker.trigger('click');

    expect(HZApp.SidebarUtils.clickableMapMarker.calls.count()).toEqual(1);
  });
});
