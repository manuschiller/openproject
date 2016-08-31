//-- copyright
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
//++

import {wpTabsModule} from '../../../../angular-modules';

function wpRelationsAutocompleteDirective(I18n, $q, PathHelper, $http) {
  return {
    restrict: 'E',
    templateUrl: '/components/wp-relations/wp-relations-create/wp-relations-autocomplete/wp-relations-autocomplete.template.html',
    scope: {
      selectedWpId: '=',
      selectedRelationType: '=',
      workPackage: '='
    },
    link: function (scope) {
      scope.onSelect = function(wpId){
        scope.selectedWpId = wpId;
      };

      scope.autocompleteWorkPackages = (term) => {
        if (!term || !scope.selectedRelationType) {
          return;
        }

        findRelatableWorkPackages(term).then(workPackages => {
          // TODO: filter self and already related wps
          scope.options = workPackages;
        });
      };

      function findRelatableWorkPackages(search:string) {
        const deferred = $q.defer();
        var params;

        scope.workPackage.project.$load().then(() => {
          params = {
            q: search,
            scope: 'relatable',
            escape: false,
            id: scope.workPackage.id,
            project_id: scope.workPackage.project.id
          };

          $http({
            method: 'GET',
            url: URI(PathHelper.workPackageJsonAutoCompletePath()).search(params).toString()
          })
            .then((response:any) => deferred.resolve(response.data))
            .catch(deferred.reject);
        })
          .catch(deferred.reject);

        return deferred.promise;
      }
    }
  };
}

wpTabsModule.directive('wpRelationsAutocomplete', wpRelationsAutocompleteDirective);
