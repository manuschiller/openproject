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
import {WorkPackageResourceInterface} from '../api/api-v3/hal-resources/work-package-resource.service';



export class WorkPackageRelationsService {
  constructor(protected $rootScope,
              protected I18n,
              protected wpNotificationsService) {
  
  }

  public changeParent(workPackage, parentId) {
    const params = {
      parentId: parentId,
      lockVersion: workPackage.lockVersion
    };
    return workPackage.changeParent(params);
  }

  public removeParent(workPackage) {
    return this.changeParent(workPackage, null);
  }

  public addExistingChildWp(workPackage, relationType, relatedWorkPackage) {

  }

  public addNewChildWp() {
    
  }

  public addCommonRelation(workPackage, relationType, relatedWpId) {
    const params = {
      to_id: relatedWpId,
      relation_type: relationType
    };

    workPackage.addRelation(params);
  }

  public removeCommonRelation(relation, workPackage) {
    relation.remove().then(result => {
      this.handleSuccess('wp-relations.relationRemoved', workPackage);
    })
      .catch(error => this.handleError(error, workPackage));
  }

  public handleSuccess(successMessage:string, dataToEmit, updatedWorkPackage?:WorkPackageResourceInterface) {
    this.$rootScope.$emit(successMessage, dataToEmit);
    this.wpNotificationsService.showSave(updatedWorkPackage);
  }

  public handleError(error, workPackage?) {

  }

  public configuration = {
    relationTitles: {
      parent: this.I18n.t('js.relation_labels.parent'),
      children: this.I18n.t('js.relation_labels.children'),
      relatedTo: this.I18n.t('js.relation_labels.relates'),
      duplicates: this.I18n.t('js.relation_labels.duplicates'),
      duplicated: this.I18n.t('js.relation_labels.duplicated'),
      blocks: this.I18n.t('js.relation_labels.blocks'),
      blocked: this.I18n.t('js.relation_labels.blocked'),
      precedes: this.I18n.t('js.relation_labels.precedes'),
      follows: this.I18n.t('js.relation_labels.follows'),
      includes: this.I18n.t('js.relation_labels.includes'),
      partof: this.I18n.t('js.relation_labels.part_of'),
      requires: this.I18n.t('js.relation_labels.requires'),
      required: this.I18n.t('js.relation_labels.required_by')
    },
    relationTypes: [
      {name: 'parent', type: 'parent'},
      {name: 'children', type: 'children'},
      {name: 'relatedTo', type: 'Relation::Relates', id: 'relates'},
      {name: 'duplicates', type: 'Relation::Duplicates'},
      {name: 'duplicated', type: 'Relation::Duplicated'},
      {name: 'blocks', type: 'Relation::Blocks'},
      {name: 'blocked', type: 'Relation::Blocked'},
      {name: 'precedes', type: 'Relation::Precedes'},
      {name: 'follows', type: 'Relation::Follows'},
      {name: 'includes', type: 'Relation::Includes'},
      {name: 'partof', type: 'Relation::Partof'},
      {name: 'requires', type: 'Relation::Requires'},
      {name: 'required', type: 'Relation::Required'}
    ]
  };
}

wpTabsModule.service('WpRelationsService', WorkPackageRelationsService);
