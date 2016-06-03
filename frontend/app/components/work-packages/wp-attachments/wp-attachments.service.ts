// -- copyright
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
// ++

import {wpServicesModule} from '../../../angular-modules.ts';
import ArrayLiteralExpression = ts.ArrayLiteralExpression;

function wpAttachmentsService($q, $timeout, $http, Upload, I18n, NotificationsService) {
  var upload = (workPackage, files) => {

      if (angular.isDefined(workPackage.$links.attachments)){
        var uploadPath = workPackage.$links.addAttachment.$link.href;
        var uploads = _.map(files, (file:any) => {
          var options = {
            url: uploadPath,
            fields: {
              metadata: {
                fileName: file.name,
                description: file.description
              }
            },
            file: file
          };
          return Upload.upload(options);
        });

        // notify the user
        var message = I18n.t('js.label_upload_notification', {
          id: workPackage.id,
          subject: workPackage.subject
        });

        var notification = NotificationsService.addWorkPackageUpload(message, uploads);
        var allUploadsDone = $q.defer();
        $q.all(uploads).then(function () {
          $timeout(function () { // let the notification linger for a bit
            NotificationsService.remove(notification);
            allUploadsDone.resolve();
          }, 700);
        }, function (err) {
          allUploadsDone.reject(err);
        });
        return allUploadsDone.promise;
      }

    },

    load = (workPackage, reload:boolean = false) => {
      const attachments = $q.defer();

      if (workPackage.$links.attachments) {
        var path = workPackage.$links.attachments.$link.href;

        $http.get(path, {cache: !reload}).success(response => {
          _attachments = response._embedded.elements;
          attachments.resolve(response._embedded.elements);
        }).error(err => {
          attachments.reject(err);
        });
      }
      else {
        attachments.reject(null);
      }

      return attachments.promise;
    },

    remove = function (fileOrAttachment) {
      var removal = $q.defer();
      if (angular.isObject(fileOrAttachment._links)) {
        var path = fileOrAttachment._links.self.href;
        $http.delete(path).success(function () {
          _.remove(_attachments,fileOrAttachment);
          console.log("getCurrentAttachments:", getCurrentAttachments());
          removal.resolve(fileOrAttachment);
        }).error(function (err) {
          removal.reject(err);
        });
      } else {
        removal.resolve(fileOrAttachment);
      }
      return removal.promise;
    },

    hasAttachments = function (workPackage) {
      var existance = $q.defer();

      load(workPackage).then(function (attachments:any) {
        existance.resolve(attachments.length > 0);
      });
      return existance.promise;
    },

    getCurrentAttachments = function(){
      return _attachments;
    },

    resetAttachmentsList = function(){
      _attachments.length = 0;
    },

    addPendingAttachments = function(files){
      if(angular.isArray(files)){
        _.each(files,function(file){
          _attachments.push(file);
        });
      }else{
        _attachments.push(files);
      }
    },

    _attachments = [],

    uploadPendingAttachments = function(wp){
      if(angular.isDefined(wp) && _attachments.length > 0)
        return upload(wp,_attachments);
    };


  return {
    upload: upload,
    remove: remove,
    load: load,
    attachments: _attachments,
    hasAttachments: hasAttachments,
    addPendingAttachments: addPendingAttachments,
    resetAttachmentsList: resetAttachmentsList,
    getCurrentAttachments: getCurrentAttachments,
    uploadPendingAttachments: uploadPendingAttachments
  };
}

wpServicesModule.factory('wpAttachments', wpAttachmentsService);
