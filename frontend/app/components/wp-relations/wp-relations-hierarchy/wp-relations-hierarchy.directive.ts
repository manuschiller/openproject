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
import {WorkPackageResourceInterface} from "../../api/api-v3/hal-resources/work-package-resource.service";
import {RelatedWorkPackage} from "../wp-relations.interfaces";
import {WorkPackageCacheService} from "../../work-packages/work-package-cache.service";

export class WorkPackageRelationsHierarchyController {
  public parent;
  public children = [];
  public workPackage:RelatedWorkPackage;
  public showEditForm:boolean = false;
  public workPackagePath = this.PathHelper.workPackagePath;

  constructor(protected $scope,
              protected $rootScope,
              protected $q:ng.IQService,
              protected PathHelper,
              protected wpCacheService) {
    // TODO: refactor to using wpCacheService instead of $q

    this.registerEventListeners();

    if (angular.isNumber(this.workPackage.parentId)) {
      this.wpCacheService.loadWorkPackage(this.workPackage.parentId)
        .take(1)
        .subscribe((parent:WorkPackageResourceInterface) => {
        this.parent = parent;
      });
    }
    // move to wpcacheservice
    if (this.workPackage.children) {
      let relatedChildrenPromises = [];

      this.workPackage.children.forEach(child => relatedChildrenPromises.push(child.$load()));

      $q.all(relatedChildrenPromises).then(children => this.children = children);
    }

  }

  protected removedChild(evt, workPackage) {
    _.remove(this.children, {'id' : workPackage.id});
    this.$rootScope.$emit('workPackagesRefreshInBackground');
  }

  protected addedChild(evt, addedChildWorkPackage) {
    this.children.push(addedChildWorkPackage);
    this.$rootScope.$emit('workPackagesRefreshInBackground');
  }

  private registerEventListeners() {
    this.$scope.$on('wp-relations.changedParent', this.updateParent.bind(this));
    this.$scope.$on('wp-relations.removedChild', this.removedChild.bind(this));
    this.$scope.$on('wp-relations.addedChild', this.addedChild.bind(this));
  }

  private updateParent(evt, changedData) {
    if (changedData.parentId !== null) {
      this.wpCacheService.loadWorkPackage([changedData.parentId])
        .take(1)
        .subscribe((parent:WorkPackageResourceInterface) => {
          this.parent = parent;
          this.$rootScope.$emit('workPackagesRefreshInBackground');
        });
    } else {
      this.$rootScope.$emit('workPackagesRefreshInBackground');
      this.parent = null;
    }
    this.workPackage = changedData.updatedWp;
  }
}

function wpRelationsDirective() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/components/wp-relations/wp-relations-hierarchy/wp-relations-hierarchy.template.html',

    scope: {
      workPackage: '=',
      relationType: '@'
    },

    controller: WorkPackageRelationsHierarchyController,
    controllerAs: '$ctrl',
    bindToController: true,
  };
}

wpTabsModule.directive('wpRelationsHierarchy', wpRelationsDirective);
