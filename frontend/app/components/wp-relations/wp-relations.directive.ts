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

import {
  WorkPackageResourceInterface
} from '../api/api-v3/hal-resources/work-package-resource.service';

export class WorkPackageRelationsController {
  public relationGroups:RelatedWorkPackagesGroup = [];
  public workPackage:WorkPackageResourceInterface;
  protected currentRelations = [];

  constructor(protected $scope,
              protected $q,
              protected I18n) {

    this.loadRelations();

    $scope.$on('wp-relations.added', this.addSingleRelation);
    $scope.$on('wp-relations.removed', this.removeSingleRelation);
  }

  protected addSingleRelation(evt, relation):void {
    this.getRelationLoadPromise(relation).then((relatedWorkPackage:RelatedWorkPackage) => {
      relatedWorkPackage.relatedBy = relation;
      this.buildRelationGroups();
    });
  }

  protected removeSingleRelation(evt, relation):void {
    this.currentRelations = _.remove(this.currentRelations, (latestRelation) => {
      return latestRelation.relatedBy.href !== relation.href;
    });
    this.buildRelationGroups();
  }

  protected getRelationLoadPromise(relation):Promise {
    if (relation.relatedTo.href === this.workPackage.href) {
      return relation.relatedFrom.$load();
    } else {
      return relation.relatedTo.$load();
    }
  }

  protected getRelatedWorkPackageId(relation):string {
    if (relation.relatedTo.href === this.workPackage.href) {
      return relation.relatedFrom.href.split('/').pop();
    } else {
      return relation.relatedTo.href.split('/').pop();
    }
  }

  protected loadRelations():void {
    var relatedWpPromises = Array<Promise>;
    var wpRelations = [];

    this.workPackage.relations.$load(true).then(relations => {
      if (relations.count > 0) {
        relations.$embedded.elements.forEach(relation => {
          relatedWpPromises.push(this.getRelationLoadPromise(relation));
          // TODO: use underscore's map instead of mapping to arrays manually
          wpRelations[this.getRelatedWorkPackageId(relation)] = relation;
        });

        this.$q.all(relatedWpPromises).then(relatedWorkPackages => {
          var loadWps = [];

          relatedWorkPackages.forEach(wp => loadWps.push(wp.$load()));

          this.$q.all(loadWps).then(wps => {
            wps.forEach(wp => (wp as RelatedWorkPackage).relatedBy = wpRelations[wp.id]);

            this.currentRelations = wps;
            this.buildRelationGroups();
          });
        });
      }

    });
  }

  protected buildRelationGroups():void {
    this.relationGroups = (_.groupBy(this.currentRelations, (wp) => { return wp.type.name; }) as Array);
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
