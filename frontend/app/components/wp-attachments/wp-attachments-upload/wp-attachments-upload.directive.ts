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

import {wpDirectivesModule} from '../../../angular-modules';
import {WorkPackageResourceInterface} from '../../api/api-v3/hal-resources/work-package-resource.service';
import IDirective = angular.IDirective;

export class WorkPackageUploadDirectiveController {
  public workPackage: WorkPackageResourceInterface;
  public text: any;
  public maxFileSize: number;
  public rejectedFiles: File[] = [];

  constructor(ConfigurationService) {
    ConfigurationService.api().then(settings => {
      this.maxFileSize = settings.maximumAttachmentFileSize;
    });
  }
}

function wpUploadDirective(): IDirective {
  function wpUploadDirectiveLink(scope, element) {
    element.click(() => element.children().first().click());
  }

  return {
    restrict: 'AE',
    template: `
      <div
        class="wp-attachment-upload"
        ng-if="$ctrl.workPackage.canAddAttachments"
        ngf-drop
        ng-model="$ctrl.workPackage.pendingAttachments"
        ng-model-rejected="$ctrl.rejectedFiles"
        ngf-select
        ngf-multiple="true"
        ngf-change="$ctrl.workPackage.uploadPendingAttachments()"
        ngf-max-size="{{ ::$ctrl.maxFileSize }}"
        click-on-keypress="[13, 32]"
        ng-transclude>
      </div>`,

    transclude: true,

    scope: {
      workPackage: '='
    },

    controller: WorkPackageUploadDirectiveController,
    controllerAs: '$ctrl',
    bindToController: true,

    link: wpUploadDirectiveLink
  };
}

wpDirectivesModule.directive('wpAttachmentsUpload', wpUploadDirective);
