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
/**
 * Contains methods and attributes shared across common relations 
 * and parent child relations
 */
export class WorkPackageSingleRelationController {
  public workPackagePath = this.PathHelper.workPackagePath;

  constructor(protected PathHelper) {
  }

  public getFullIdentifier(workPackage, hideType?:boolean) {
    var type = ' ';
    if (workPackage.type && !hideType) {
      type += workPackage.type.name + ': ';
    }
    //return `#${workPackage.id}${type}${workPackage.subject}`;
    return workPackage.subject;
  }

  public canRemoveRelation(relation):boolean {
      return !!relation.remove;
  }

  public canAddRelation(workPackage) {
    return !!workPackage.addRelation;
  }
}

function wpSingleRelationDirective() {
  return {
    restrict: 'A',
    controller: WorkPackageSingleRelationController,
    controllerAs: '$singleRelation',
    bindToController: true,
  };
}

wpTabsModule.directive('wpSingleRelation', wpSingleRelationDirective);
