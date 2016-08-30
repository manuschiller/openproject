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
import {WpSingleRelationModel} from './wp-single-relation.model';

export interface WorkPackageRelationsConfigInterface {
  name:string;
  type:string;
  id?:string;
}

export class WorkPackageSingeRelation {

  public fullIdentifier;
  public linkToRelatedWp;
  public relationType;
  public relatedWpId;


  constructor(protected PathHelper,
              protected I18n,
              protected $q,
              protected $http,
              protected PathHelper,
              protected wpCacheService) {
  }

  public getCommonRelation(workPackage, relatedWorkPackage, relation){

  }

  public getParentRelation(workPackage, relatedWorkPackage){

  }
  public getChildRelation(workPackage, relatedWorkPackage){

  }

  public addRelation() {

  }

  public removeRelation() {

  }
  
  protected getFullIdentifier(workPackage) {
    
  }

  public findRelatableWorkPackages(workPackage, search:string) {
    const deferred = this.$q.defer();
    var params;

    workPackage.project.$load().then(() => {
      params = {
        q: search,
        scope: 'relatable',
        escape: false,
        id: workPackage.id,
        project_id: workPackage.project.id
      };

      this.$http({
        method: 'GET',
        url: URI(this.PathHelper.workPackageJsonAutoCompletePath()).search(params).toString()
      })
        .then((response:any) => deferred.resolve(response.data))
        .catch(deferred.reject);
    })
      .catch(deferred.reject);

    return deferred.promise;
  }

  protected init() {

  }

  private relationsConfig:WorkPackageRelationsConfigInterface[] = [
    {name: 'parent', type: 'parent'},
    {name: 'children', type: 'children'},
    {name: 'relatedTo', type: 'Relation::Relates', id: 'relates'},
    {name: 'duplicates', type: 'Relation::Duplicates'},
    {name: 'duplicated', type: 'Relation::Duplicated'},
    {name: 'blocks', type: 'Relation::Blocks'},
    {name: 'blocked', type: 'Relation::Blocked'},
    {name: 'precedes', type: 'Relation::Precedes'},
    {name: 'follows', type: 'Relation::Follows'}
  ];

}

function WpSingleRelationService(...args) {
  [] = args;
  return WorkPackageSingeRelation;
}

WpSingleRelationService.$inject = [];

wpTabsModule.factory('WorkPackageSingleRelationService', WpSingleRelationService);
