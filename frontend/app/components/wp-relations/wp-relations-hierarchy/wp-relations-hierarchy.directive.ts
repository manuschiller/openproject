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

import {wpTabsModule} from '../../../angular-modules';

export class WorkPackageRelationsHierarchyController{
  public relationTypes;
  public parents = [];
  public children;
  public workPackage;

  constructor(protected $scope) {
    console.log(this.workPackage);
    if (this.workPackage.parentId) {
      this.workPackage.parent.$load().then(parent => {
        this.parents.push(parent);
      });
    }

    this.children = this.workPackage.children;
    console.log("parent", this.parents);
    console.log("base wp", this.workPackage);
    console.log("children", this.children);
  }
}

function wpRelationsDirective() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/components/wp-relations/wp-relations-hierarchy/wp-relations-hierarchy.template.html',

    scope: {
      workPackage: '='
    },

    controller: WorkPackageRelationsHierarchyController,
    controllerAs: '$ctrl',
    bindToController: true,
  };
}

wpTabsModule.directive('wpRelationsHierarchy', wpRelationsDirective);
