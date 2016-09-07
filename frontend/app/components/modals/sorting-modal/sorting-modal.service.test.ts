// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {wpControllersModule, opServicesModule, opModelsModule} from '../../../angular-modules';

describe('sortingModal service', () => {
  var scope;
  var ctrl;
  var buildController;

  var columns: any[] = [
    {name: 'parent', title: 'Parent', sortable: true},
    {name: 'cheese', title: 'Cheesy column', sortable: true},
    {name: 'cake', title: 'Cake', sortable: true}
  ];

  beforeEach(angular.mock.module(
    wpControllersModule.name,
    opServicesModule.name,
    opModelsModule.name
  ));

  beforeEach(angular.mock.inject(function ($rootScope,
                                           $controller,
                                           $timeout,
                                           $filter,
                                           Sortation) {
    scope = $rootScope.$new();

    scope.sortElements = [];

    buildController = () => {
      ctrl = $controller('SortingModalController', {
        $scope: scope,
        sortingModal: {},
        I18n: {t: angular.noop},
        $filter: $filter,
        QueryService: {
          loadAvailableColumns: () => $timeout(() => columns),
          getSortation: () => new Sortation()
        }
      });

      $timeout.flush();
    };
  }));

  describe('when setting up the controller', () => {
    beforeEach(() => {
      buildController();
    });

    it('should format the columns for select', () => {
      var columnData = scope.availableColumnsData[0];

      expect(columnData).to.have.property('id', 'parent');
      expect(columnData).to.have.property('label', 'Parent');
    });
  });

  describe('when a column is not sortable', () => {
    var unsortableColumn = {name: 'author', title: 'Author'};

    beforeEach(() => {
      columns.push(unsortableColumn);
      buildController();
    });

    it('should not be contained by the available columns data', () => {
      expect(scope.availableColumnsData).to.not.contain({
        id: 'author',
        label: 'Author',
        other: 'Author'
      });
    });
  });
});
