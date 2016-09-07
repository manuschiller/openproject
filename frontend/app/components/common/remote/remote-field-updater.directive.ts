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

import {wpDirectivesModule} from "../../../angular-modules";

function remoteFieldUpdater($http) {
  return {
    restrict: 'E',
    scope: {
      url: '@',
      method: '@'
    },
    link: (scope, element) => {
      const input = element.find('.remote-field--input');
      const target = element.find('.remote-field--target');
      const htmlMode = target.length > 0;
      const method = (scope.method || 'GET').toUpperCase();

      function buildRequest(params) {
        const request = {
          url: scope.url,
          method: method,
          headers: {},
        };

        // In HTML mode, expect html response
        if (htmlMode) {
          request.headers['Accept'] = 'text/html';
        } else {
          request.headers['Accept'] = 'application/javascript';
        }

        // Append request to either URL params or body
        // Angular doesn't differentiate between those two on its own.
        if (method === 'GET') {
          request['params'] = params;
        } else {
          request['data'] = params;
        }

        return request;
      }

      function updater() {
        var params = {};

        // Gather request keys
        input.each((i, el) => {
          var field = angular.element(el);
          params[field.data('remoteFieldKey')] = field.val();
        });

        $http(buildRequest(params)).then(response => {
          // Replace the given target
          if (htmlMode) {
            target.html(response.data);
          } else {
            eval(response.data);
          }
        });
      }

      input.on('keyup change', _.throttle(updater, 1000, { leading: true }));
    }
  };
}

wpDirectivesModule.directive('remoteFieldUpdater', remoteFieldUpdater);
