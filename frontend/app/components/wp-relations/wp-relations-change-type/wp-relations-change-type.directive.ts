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
import {RelationResource} from '../wp-relations.interfaces';
import {WorkPackageResourceInterface} from '../../api/api-v3/hal-resources/work-package-resource.service';
import {WorkPackageRelationsService} from "../wp-relations.service";


export class WorkPackageRelationsChangeTypeController {
  public relation: RelationResource;
  public relationTypes = angular.copy(this.WpRelationsService.getRelationTypes(true));
  protected relationTitles = angular.copy(this.WpRelationsService.getRelationTitles(true));

  // TODO: copy relationTypeInterface....
  public selectedRelationType;
  public editType:boolean;


  constructor(protected WpRelationsService:WorkPackageRelationsService) {
    this.selectedRelationType = this.WpRelationsService.getRelationTypeObjectByType(this.relation._type);
  }

  public changeRelationType() {
    let relation_type = this.selectedRelationType.name === 'relatedTo' ? this.selectedRelationType.id : this.selectedRelationType.name;

    // TODO: success / error handling
    this.WpRelationsService.changeRelationType(this.relation, relation_type)
      .then(() => {
        // successmessage
      })
      .catch(err => console.log(err))
      .finally(() => { this.editType = false; });
  }

  public getRelationTitle() {
    return this.WpRelationsService.getTranslatedRelationTitle(this.selectedRelationType.name);
  }
}

function wpRelationsChangeType() {
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
