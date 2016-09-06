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
import {RelatedWorkPackage, RelatedWorkPackagesGroup} from './wp-relations.interfaces';

import {WorkPackageResourceInterface} from '../api/api-v3/hal-resources/work-package-resource.service';
import {WorkPackageCacheService} from '../work-packages/work-package-cache.service';

export class WorkPackageRelationsController {
  public relationGroups:RelatedWorkPackagesGroup = [];
  public workPackage:WorkPackageResourceInterface;

  protected currentRelations = Array<RelatedWorkPackage>;

  constructor(protected $scope:ng.IScope,
              protected $q:ng.IQService,
              protected wpCacheService:WorkPackageCacheService) {

    this.registerEventListeners();
    if(this.workPackage.relations.count > 0) {
      if (!this.workPackage.relations.$loaded) {
        this.workPackage.relations.$load().then(relations => {
          this.loadRelations();
        });
      } else {
        this.loadRelations();
      }
    }
  }

  protected removeSingleRelation(evt, relation) {
    this.currentRelations = _.remove(this.currentRelations, (latestRelation) => {
      return latestRelation.relatedBy.href !== relation.href;
    });
    this.buildRelationGroups();
  }


  protected getRelatedWorkPackages(workPackageIds:Array<String>) {
    let observablesToGetZipped = [];
    workPackageIds.forEach(wpId => {
      observablesToGetZipped.push(this.wpCacheService.loadWorkPackage(wpId));
    });

    if (observablesToGetZipped.length > 1) {
      return Rx.Observable
        .zip(observablesToGetZipped)
        .take(1);
    } else {
      return observablesToGetZipped[0].take(1);
    }
  }

  protected getRelatedWorkPackageId(relation):string {
    if (relation.relatedTo.href === this.workPackage.href) {
      return relation.relatedFrom.href.split('/').pop();
    } else {
      return relation.relatedTo.href.split('/').pop();
    }
  }

  protected buildRelationGroups() {
    this.relationGroups = (_.groupBy(this.currentRelations, (wp) => {
      return wp.type.name;
    }) as Array);
  }

  protected addSingleRelation(evt, relation) {
    var relatedWorkPackageId = [this.getRelatedWorkPackageId(relation)];
    this.getRelatedWorkPackages(relatedWorkPackageId).subscribe((relatedWorkPackage:RelatedWorkPackage) => {
      relatedWorkPackage.relatedBy = relation;
      this.currentRelations.push(relatedWorkPackage);
      this.buildRelationGroups();
    });
  }

  protected loadRelations():void {
    // TODO: could be easier to map the relations to the corresponding wps...
    var relatedWpIds = [];
    var relations = [];
    
    this.workPackage.relations.elements.forEach(relation => {
      relatedWpIds.push(this.getRelatedWorkPackageId(relation));
      relations[this.getRelatedWorkPackageId(relation)] = relation;
    });

    this.getRelatedWorkPackages(relatedWpIds)
      .subscribe(relatedWorkPackages => {
        relatedWorkPackages.forEach(relatedWorkPackage => {
          relatedWorkPackage.relatedBy = relations[relatedWorkPackage.id];
        });

        this.currentRelations = relatedWorkPackages;
        this.buildRelationGroups();
      });
  }

  private registerEventListeners() {
    this.$scope.$on('wp-relations.added', this.addSingleRelation.bind(this));
    this.$scope.$on('wp-relations.removed', this.removeSingleRelation.bind(this));
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
