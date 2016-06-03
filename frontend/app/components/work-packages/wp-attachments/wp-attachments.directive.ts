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

import {wpDirectivesModule} from "../../../angular-modules";

function wpAttachmentsDirective(wpAttachments,
                                NotificationsService,
                                I18n,
                                ConfigurationService,
                                ConversionService) {
  var editMode = function (attrs) {
    return !angular.isUndefined(attrs.edit);
  };

  function WorkPackageAttachmentsController(scope, element, attrs) {
    scope.attachments = wpAttachments.getCurrentAttachments();
    scope.element = element;
    scope.files = [];

    console.log(editMode(attrs) ? "edit" : "normal");

    var workPackage = scope.workPackage(),
      upload = function (event, workPackage) {
        if (angular.isUndefined(scope.files)) return;

        if(workPackage.isNew){

          _.each(scope.files,(file)=>{
            scope.attachments.push(file);
          });

          return;
        }

        if (scope.files.length > 0) {
          wpAttachments.upload(workPackage, scope.files).then(function () {
            scope.files = [];
            loadAttachments();
          });
        }
      },
      loadAttachments = function () {
        if (!editMode(attrs)) {
          return;
        }
        scope.loading = true;
        wpAttachments.load(workPackage, true).then(function (attachments) {
          scope.attachments = wpAttachments.getCurrentAttachments();
        }).finally(function () {
          scope.loading = false;
        });
      };

    scope.I18n = I18n;
    scope.rejectedFiles = [];
    scope.size = ConversionService.fileSize;

    scope.hasRightToUpload = !!(workPackage.$links.addAttachment || workPackage.isNew);

    scope.remove = function(file){
      wpAttachments.remove(file).finally(function () {
        console.log(wpAttachments.getCurrentAttachments());
      });
    };

    var currentlyFocusing = null;

    scope.focus = function (attachment) {
      currentlyFocusing = attachment;
    };

    scope.focussing = function (attachment) {
      return currentlyFocusing === attachment;
    };

    scope.$on('uploadPendingAttachments', (event,wp)=>{
      upload(event,wp);
    });

    scope.filterFiles = function (files) {
      // Directories cannot be uploaded and as such, should not become files in
      // the sense of this directive.  The files within the directories will
      // be taken though.
      _.remove(files, (file:any) => {
        return file.type === 'directory';
      });
    };

    scope.uploadFilteredFiles = function (files) {
      scope.filterFiles(files);
      scope.$emit('uploadPendingAttachments', workPackage);
    };

    scope.$watch('rejectedFiles', function (rejectedFiles) {
      if (rejectedFiles.length === 0) {
        return;
      }
      var errors = _.map(rejectedFiles, (file:any) => {
          return file.name + ' (' + scope.size(file.size) + ')';
        }),
        message = I18n.t('js.label_rejected_files_reason',
          {maximumFilesize: scope.size(scope.maximumFileSize)}
        );
      NotificationsService.addError(message, errors);
    });

    // TODO: make this to work with wpAttachments.uploadQueue[]
    if(scope.workPackage.isNew){
      scope.$watch('files',(files)=>{
        if(files.length > 0)
        //wpAttachments.pendingAttachments = [];
        _.each(files,(file)=>{
          wpAttachments.pendingAttachments.push(file)
        });
      })
    }

    scope.fetchingConfiguration = true;
    ConfigurationService.api().then(function (settings) {
      scope.maximumFileSize = settings.maximumAttachmentFileSize;
      // somehow, I18n cannot interpolate function results, so we need to cache this once
      scope.maxFileSize = scope.size(settings.maximumAttachmentFileSize);
      scope.fetchingConfiguration = false;
    });

    scope.$on('reloadWpAttachments', function(){
      loadAttachments();
    });

    loadAttachments();
  }

  return {
    restrict: 'E',
    replace: true,
    require: '^wpSingleView',
    scope: {
      workPackage: '&'
    },
    templateUrl: (element, attrs) => {
        return editMode(attrs)
          ? '/components/work-packages/wp-attachments/wp-attachments-edit.directive.html'
          : '/components/work-packages/wp-attachments/wp-attachments.directive.html';
    },

    link: WorkPackageAttachmentsController
  };
}

wpDirectivesModule.directive('wpAttachments', wpAttachmentsDirective);
