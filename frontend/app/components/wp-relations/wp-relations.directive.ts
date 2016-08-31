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
import {scopedObservable} from '../../helpers/angular-rx-utils';
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from '../api/api-v3/hal-resources/work-package-resource.service';
import {HalResource} from "../api/api-v3/hal-resources/hal-resource.service";

interface RelatedWorkPackage extends WorkPackageResourceInterface {
  relatedBy: HalResource;
}

export class WorkPackageRelationsController {
  public workPackage;
  public relationGroups = [];

  private relationsCache = {
    relations: [],
    parentId: 0,
    children: []
  };

  constructor(protected $scope,
              protected $q,
              protected I18n,
              protected wpCacheService,
              protected wpNotificationsService:WorkPackageNotificationService,
              protected NotificationsService) {


  this.workPackage.addRelation({
    to_id: "138",
    relation_type: 'relatedTo'
  }).then(relation => {
    console.log("created relation", relation);
  });

    scopedObservable(this.$scope, this.wpCacheService.loadWorkPackage(this.workPackage.id))
      .subscribe((wp:WorkPackageResourceInterface) => {
        this.workPackage = wp;
        console.log("workPackage changed!!", this.workPackage);
        console.log("relations count", this.workPackage.relations.count);
      });

    this.loadRelations();
  }

  protected loadRelations() {
    var relatedWpPromises = [];
    var wpRelations = [];

    this.workPackage.relations.$load(true).then(relations => {
      console.log("initial relations", relations);
      relations.$embedded.elements.forEach(relation => {
        if (relation.relatedTo.href === this.workPackage.href) {
          relatedWpPromises.push(relation.relatedFrom.$load(true));
          wpRelations[relation.relatedFrom.href.split('/').pop()] = relation;
        } else {
          relatedWpPromises.push(relation.relatedTo.$load(true));
          wpRelations[relation.relatedTo.href.split('/').pop()] = relation;
        }
      });

      this.$q.all(relatedWpPromises).then(relatedWorkPackages => {
        var loadWps = [];
        relatedWorkPackages.forEach(wp => {
          loadWps.push(wp.$load());
        });

        this.$q.all(loadWps).then(wps => {
          wps.forEach(wp => {
            (wp as RelatedWorkPackage).relatedBy = wpRelations[wp.id];
          });
          this.relationGroups = (_.groupBy(wps, (wp) => { return wp.type.name; }) as Array);
          console.log("relation groups", this.relationGroups);
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
