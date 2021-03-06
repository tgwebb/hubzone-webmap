require 'rails_helper'
#rubocop:disable Metrics/BlockLength
describe "The Header", type: :feature do
  before do
    visit('/map')
  end
  it "will have Official U.S. Gov website copy" do
    expect(page).to have_content 'An official website of the United States government'
  end
  it "will find SBA Logo " do
    expect(page.find('#sba-logo')['src']).to have_content 'sba-logo'
  end
  it "will have SBA logo with alt text" do
    expect(page.find('#sba-logo')['alt']).to have_content 'U.S. Small Business Administration logo'
  end
  it "will have SBA Logo link to SBA.gov" do
    expect(page).to have_css('.logo-link')
  end
  it "will have HUBZone Map title" do
    expect(page).to have_content 'HUBZone Map'
  end
  it "will have Hubzone Map with aria label" do
    expect(page.find('.title-link')['aria-label']).to have_content 'hubzone map home'
  end
  it "will have a Help link" do
    expect(page).to have_css('#map-help-guide')
  end
  it "will have a help link with aria label" do
    expect(page.find('#map-help-guide')['aria-label']).to have_content 'Help'
  end
  it "will have HUBZone Program link" do
    expect(page).to have_content 'HUBZone Program'
  end
  it "will have HUBZone Program with aria label" do
    expect(page.find('#hubzone-program-link')['aria-label']).to have_content 'hubzone program'
  end
end
#rubocop:enable Metrics/BlockLength
