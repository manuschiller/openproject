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

import {wpTabsModule} from "../../../angular-modules";
import {WorkPackageRelationsController} from "../wp-relations.directive";
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from "../../api/api-v3/hal-resources/work-package-resource.service";

function wpRelationRowDirective(PathHelper, $rootScope, wpCacheService) {
  var getFullIdentifier = (workPackage) => {
    var type = ' ';

    if (workPackage.type) {
      type += workPackage.type.name + ': ';
    }

    return `#${workPackage.id}${type}${workPackage.subject}`;
  };

  function wpRelationsDirectiveLink(scope) {
    scope.workPackagePath = PathHelper.workPackagePath;
    scope.userPath = PathHelper.userPath;

    // TODO: must be possible easier..
    scope.$ctrl.relationGroup.getRelatedWorkPackage(scope.relation)
      .then((relatedWorkPackage) => {
        wpCacheService.loadWorkPackage(relatedWorkPackage.id).subscribe(relatedWp => {
          scope.relatedWorkPackage = relatedWp;
          scope.fullIdentifier = getFullIdentifier(relatedWp);
          scope.state = relatedWp.status.isClosed ? 'closed' : '';
        });
      });
  }

  return {
    restrict: 'A',
    link: wpRelationsDirectiveLink
  };
}

wpTabsModule.directive('wpRelationRow', wpRelationRowDirective);
