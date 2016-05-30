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

describe('WorkPackageDetailsController', function() {
  var scope;
  var promise;
  var buildController, ctrl;
  var stateParams = {};
  var I18n = { t: angular.identity },
      workPackage = {
        props: {
        },
        embedded: {
          author: {
            props: {
              id: 1,
              status: 'active'
            }
          },
          id: 99,
          project: {
            props: {
              id: 1
            }
          },
          activities: {
            links: {
              self: { href: "/api/v3/work_packages/820/activities" }
            },
            _type: "Collection",
            total: 0,
            count: 0,
            embedded: {
              elements: []
            }
          },
          watchers: [],
          attachments: {
            links: {
              self: { href: "/api/v3/work_packages/820/attachments" }
            },
            _type: "Collection",
            total: 0,
            count: 0,
            embedded: {
              elements: []
            }
          },
          type: {
            props: {
              name: 'Milestone'
            }
          },
          relations: [
            {
              props: {
                _type: "Relation::Relates"
              },
              links: {
                relatedFrom: {
                  fetch: sinon.spy()
                },
                relatedTo: {
                  fetch: sinon.spy()
                }
              }
            }
          ]
        },
        links: {
          self: { href: "it's a me, it's... you know..." },
          availableWatchers: {
            fetch: function() { return {then: angular.noop}; }
          },
          schema: {
            fetch: function() { return {then: angular.noop}; }
          }
        },
        link: {
          addWatcher: {
            fetch: function() { return {then: angular.noop}; }
          }
        }
      };

  beforeEach(angular.mock.module('openproject.api', 'openproject.layout', 'openproject.services',
    'openproject.workPackages.controllers', 'openproject.services', 'openproject'));

  beforeEach(angular.mock.module('openproject.templates', function($provide) {
    var configurationService = {};

    configurationService.isTimezoneSet = sinon.stub().returns(false);

    $provide.constant('ConfigurationService', configurationService);
  }));

  beforeEach(angular.mock.module('openproject.templates', function($provide) {
    var state = { go: function() { return false; } };
    $provide.value('$state', state);
    $provide.constant('$stateParams', stateParams);
  }));

  beforeEach(inject(function($rootScope, $controller, $timeout, $httpBackend, WorkPackageService, $q) {
    $httpBackend.when('GET', '/api/v3/work_packages/99').respond(workPackage);

    WorkPackageService.getWorkPackage = function() { return $q.when(workPackage) };

    buildController = function(done) {
      var testState = {
        params: { workPackageId: 99 },
        current: { url: '/activity' }
      };
      scope = $rootScope.$new();

      ctrl = $controller("WorkPackageDetailsController", {
        $scope:  scope,
        $state: testState,
        I18n: I18n,
        ConfigurationService: {
          commentsSortedInDescendingOrder: function() {
            return false;
          }
        },
        workPackage: workPackage,
      });

      $timeout.flush();

      promise = scope.initializedWorkPackage;
    };

  }));

  describe('initialisation', function() {
    it('should initialise', function() {
      return buildController();
    });
  });

  describe('#scope.canViewWorkPackageWatchers', function() {
    describe('when the work package does not contain the embedded watchers property', function() {
      beforeEach(function() {
        workPackage.embedded.watchers = undefined;
        buildController();
      });

      it('returns false', function() {
        expect(promise).to.eventually.be.fulfilled.then(function() {
          expect(scope.canViewWorkPackageWatchers()).to.be.false;
        });
      });
    });

    describe('when the work package contains the embedded watchers property', function() {
      beforeEach(function() {
        workPackage.embedded.watchers = [];
        return buildController();
      });

      it('returns true', function() {
        expect(promise).to.eventually.be.fulfilled.then(function() {
          expect(scope.canViewWorkPackageWatchers()).to.be.true;
        });
      });
    });
  });

  describe('work package properties', function() {
    describe('relations', function() {
      beforeEach(function() {
        return buildController();
      });

      it('Relation::Relates', function() {
        expect(promise).to.eventually.be.fulfilled.then(function() {
          expect(scope.relatedTo).to.be.ok;
        });
      });

      it('is the embedded type', function() {
        expect(promise).to.eventually.be.fulfilled.then(function() {
          expect(scope.type.props.name).to.eql('Milestone');
        });
      });
    });
  });

  describe('showStaticPagePath', function() {
    it('points to old show page', function() {
      expect(promise).to.eventually.be.fulfilled.then(function() {
        expect(scope.showStaticPagePath).to.eql('/work_packages/99');
      });
    });
  });
});
