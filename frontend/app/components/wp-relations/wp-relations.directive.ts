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

import {wpTabsModule} from '../../angular-modules';
import {WorkPackageNotificationService} from '../wp-edit/wp-notification.service';
import {WorkPackageResource} from '../api/api-v3/hal-resources/work-package-resource.service';


export class WorkPackageRelationsController {
  public workPackage;
  public relationGroups;

  constructor(protected $scope,
              protected $q,
              protected I18n,
              protected WpRelationsService,
              protected wpCacheService,
              protected wpNotificationsService:WorkPackageNotificationService,
              protected NotificationsService) {
    this.loadRelations();
  }

  protected loadRelations() {
    var relatedWpPromises = [];
    var relatedWpSubscribes = [];

    var relatedIds = [];

    if (this.workPackage.parent) {
      relatedWpPromises.push(this.workPackage.parent.$load());
      relatedIds.push(this.workPackage.parentId);
    }

    this.workPackage.relations.$load().then(relations => {
      relations.$embedded.elements.forEach(relation => {
        if (relation.relatedTo.href === this.workPackage.href) {
          relatedWpPromises.push(relation.relatedFrom.href.$load(true));
        }
        relatedWpPromises.push(relation.relatedFrom.$load(true));
      });


      this.$q.all(relatedWpPromises).then(relatedWorkPackages => {
        if (angular.isArray(this.workPackage.children)) {
          relatedWorkPackages.push(...this.workPackage.children);
        }

        var loadWps = [];
        relatedWorkPackages.forEach(wp => {
          loadWps.push(wp.$load());
        });

        this.$q.all(loadWps).then(wps => {
          this.relationGroups = (_.groupBy(relatedWorkPackages, (wp) => { return wp.type.name; }) as Array);
          console.log("relation groups", this.relationGroups);
          this.WpRelationsService.getWpRelationGroup(this.workPackage, relatedWorkPackages, relations);
        });


      });
    });
  }
}

function wpRelationsDirective() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/components/wp-relations/wp-relations.template.html',

    scope: {
      workPackage: '='
    },

    controller: WorkPackageRelationsController,
    controllerAs: '$ctrl',
    bindToController: true,
  };
}

wpTabsModule.directive('wpRelations', wpRelationsDirective);
