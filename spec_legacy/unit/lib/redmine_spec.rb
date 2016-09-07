#-- encoding: UTF-8
#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See doc/COPYRIGHT.rdoc for more details.
#++
require 'legacy_spec_helper'

module RedmineMenuTestHelper
  # Assertions
  def assert_number_of_items_in_menu(menu_name, count)
    assert Redmine::MenuManager.items(menu_name).size >= count, "Menu has less than #{count} items"
  end

  def assert_menu_contains_item_named(menu_name, item_name)
    assert Redmine::MenuManager.items(menu_name).map(&:name).include?(item_name.to_sym), "Menu did not have an item named #{item_name}"
  end

  # Helpers
  def get_menu_item(menu_name, item_name)
    Redmine::MenuManager.items(menu_name).find { |item| item.name == item_name.to_sym }
  end
end

describe Redmine do
  include RedmineMenuTestHelper

  it 'should top_menu' do
    assert_number_of_items_in_menu :top_menu, 6
    assert_menu_contains_item_named :top_menu, :my_page
    assert_menu_contains_item_named :top_menu, :list_work_packages
    assert_menu_contains_item_named :top_menu, :news
    assert_menu_contains_item_named :top_menu, :time_sheet
    # do not test :projects here. it does not appear in the top_menu data structure, but will be generated by the TopMenuHelper
    assert_menu_contains_item_named :top_menu, :help
  end

  it 'should account_menu' do
    assert_number_of_items_in_menu :account_menu, 3
    assert_menu_contains_item_named :account_menu, :administration
    assert_menu_contains_item_named :account_menu, :my_account
    assert_menu_contains_item_named :account_menu, :logout
  end

  it 'should application_menu' do
    assert_number_of_items_in_menu :application_menu, 0
  end

  it 'should admin_menu' do
    assert_number_of_items_in_menu :admin_menu, 0
  end

  it 'should project_menu' do
    assert_number_of_items_in_menu :project_menu, 14
    assert_menu_contains_item_named :project_menu, :overview
    assert_menu_contains_item_named :project_menu, :activity
    assert_menu_contains_item_named :project_menu, :roadmap
    assert_menu_contains_item_named :project_menu, :work_packages
    assert_menu_contains_item_named :project_menu, :calendar
    assert_menu_contains_item_named :project_menu, :news
    assert_menu_contains_item_named :project_menu, :boards
    assert_menu_contains_item_named :project_menu, :repository
    assert_menu_contains_item_named :project_menu, :settings
  end
end
