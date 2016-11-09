require 'rails_helper'

describe 'Map search', type: :feature, js: true do
  before do
    visit root_path
  end
  context 'with qualified hubzone query' do
    it "should return qualified hubzone status" do
      fill_in 'search', with: 'navajo'
      click_button 'hubzone-search-button'
      expect(page).to have_content('Qualifed HUBZone')
    end
  end
  context 'with non-qualified hubzone query' do
    it "should return non qualified hubzone status" do
      fill_in 'search', with: 'banana'
      click_button 'hubzone-search-button'
      expect(page).to have_content('Not Qualified')
    end
  end
  context 'when searching for intersection' do
    it "should return the full address of the intersection" do
      fill_in 'search', with: '25th & st. paul, baltimore'
      click_button 'hubzone-search-button'
      expect(page).to have_content('St Paul St & E 25th St, Baltimore, MD 21218, USA')
    end
  end
end
