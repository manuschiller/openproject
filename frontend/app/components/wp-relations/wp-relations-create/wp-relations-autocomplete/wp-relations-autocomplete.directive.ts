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
import {WorkPackageRelationsController} from "../../wp-relations.directive";
import {WorkPackageRelationsHierarchyController} from "../../wp-relations-hierarchy/wp-relations-hierarchy.directive";

function wpRelationsAutocompleteDirective($q, PathHelper, $http) {
  return {
    restrict: 'E',
    templateUrl: '/components/wp-relations/wp-relations-create/wp-relations-autocomplete/wp-relations-autocomplete.template.html',
    require: ['^wpRelations', '?^wpRelationsHierarchy'],
    scope: {
      selectedWpId: '=',
      selectedRelationType: '=',
      workPackage: '='
    },
    link: function (scope, element, attrs, controllers ) {
      scope.relatedWps = [];
      getRelatedWorkPackages();

      scope.onSelect = function(wpId){
        scope.selectedWpId = wpId;
      };

      scope.autocompleteWorkPackages = (term) => {
        if (!term) {
          return;
        }

        findRelatableWorkPackages(term).then(workPackages => {
          // reject already related work packages, self, children and parent
          // to prevent invalid relations
          scope.options = _.reject(workPackages, (wp) => {
            return scope.relatedWps.indexOf(parseInt(wp.id)) > -1;
          });
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
            .then((response:any) => {
              // TODO: THE JSON AUTOCOMPLETE MUST BE EXTENDED TO CONTAIN A REFERENCE TO THE
              // ACTUAL WP-TYPE SINCE MILESTONES MAY NOT BE A PARENT ELEMENT AND THEREFORE THEY
              // MUST BE REJECTED
              deferred.resolve(response.data);
            })
            .catch(deferred.reject);
        })
          .catch(deferred.reject);

        return deferred.promise;
      }

    function getRelatedWorkPackages() {
        /** NOTE: THIS METHOD COULD PROBABLY DONE MORE EFFICIENTLY BY THE BACKEND **/
        const wpRelationsController:WorkPackageRelationsController = controllers[0];
        const wpRelationsHierarchyController:WorkPackageRelationsHierarchyController = controllers[1];

        let wps = [scope.workPackage.id];

        wps = wps.concat(wpRelationsController.currentRelations.map(relation => relation.id));

        if (scope.workPackage.parentId) {
          wps.push(scope.workPackage.parentId);
        }

        if (wpRelationsHierarchyController) {
          wps = wps.concat(wpRelationsHierarchyController.children.map(child => child.id));
        } else {
          if (scope.workPackage.children) {
            var childPromises = [];
            if (scope.workPackage.children.length > 0) {
              childPromises = childPromises.concat(scope.workPackage.children.map(child => child.$load()));
              $q.all(childPromises).then(children => {
                wps = wps.concat(children.map(child => child.id));
                scope.relatedWps = wps;
              });
            }
          }
        }
        scope.relatedWps = wps;
      }
    }
  };
}

wpTabsModule.directive('wpRelationsAutocomplete', wpRelationsAutocompleteDirective);
