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
import {RelatedWorkPackage} from '../wp-relations.interfaces';
import {WorkPackageResourceInterface} from '../../api/api-v3/hal-resources/work-package-resource.service';
import {HalResource} from "../../api/api-v3/hal-resources/hal-resource.service";


export class WorkPackageRelationsChangeTypeController {
  public relation: HalResource;
  public relationTypes = this.WpRelationsService.configuration.relationTypes;
  public selectedRelationType;
  public editType:boolean;
  protected relationTitles = this.WpRelationsService.configuration.relationTitles;

  constructor(protected WpRelationsService) {
    console.log('relation', this.relation);
    this.selectedRelationType = _.find(this.WpRelationsService.configuration.relationTypes, {type: this.relation._type});
  }
  
  public changeRelationType() {
    let relation_type = this.selectedRelationType.name === 'relatedTo' ? this.selectedRelationType.id : this.selectedRelationType.name;
    this.relation.updateRelation({
      relation_type: relation_type
    }).then(() => {
      this.editType = false;
    });
  }
  
  public getRelationTitle() {
    return this.WpRelationsService.configuration.relationTitles[this.selectedRelationType.name];
  }
}

function wpRelationsChangeType() {
  // TODO: Possibly obsolete now
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/components/wp-relations/wp-relations-change-type/wp-relations-change-type.template.html',

    scope: {
      relation: '=?'
    },

    controller: WorkPackageRelationsChangeTypeController,
    controllerAs: '$ctrl',
    bindToController: true
  };
}

wpTabsModule.directive('wpRelationsChangeType', wpRelationsChangeType);
