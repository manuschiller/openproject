import {wpTabsModule} from '../../../angular-modules';
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from "../../api/api-v3/hal-resources/work-package-resource.service";


class WpRelationsHierarchyRowDirectiveController {
  public workPackage;
  public relatedWorkPackage;
  public relationType;
  public indentBy;

  constructor(protected $scope,
              protected wpCacheService,
              protected PathHelper,
              protected wpNotificationsService) {
    if (!this.relatedWorkPackage) {
      this.relatedWorkPackage = angular.copy(this.workPackage);
    }
  };

  public getFullIdentifier(hideType?:boolean) {
    var type = ' ';
    if (this.workPackage.type && !hideType) {
      type += this.workPackage.type.name + ': ';
    }
    return `${type}${this.workPackage.subject}`;
  }

  public removeRelation() {
    if (this.relationType === 'child') {
      //remove child
    }else if (this.relationType === 'parent') {
      this.changeParent(null);
    }
  }

  protected changeParent(wpId) {
    var params = {
      parentId: wpId,
      lockVersion: this.workPackage.lockVersion
    };

    this.workPackage.changeParent(params).then((wp) => {
      console.log("removed", wp);
      this.wpCacheService.updateWorkPackage([this.workPackage]);
      wp.save().then(wp => {
        this.wpNotificationsService.showSave(this.workPackage);
      })
    }).catch(err => console.log(err))
      .finally(any => console.log("finally", any));
  }
}

function WpRelationsHierarchyRowDirective() {
  return {
    restrict: 'E',
    templateUrl: '/components/wp-relations/wp-relations-hierarchy-row/wp-relations-hierarchy-row.template.html',
    replace: true,
    scope: {
      indentBy: '@?',
      workPackage: '=',
      relatedWorkPackage: '=?',
      relationType: '@'
    },
    controller: WpRelationsHierarchyRowDirectiveController,
    controllerAs: '$ctrl',
    bindToController: true
  };
}

wpTabsModule.directive('wpRelationsHierarchyRow', WpRelationsHierarchyRowDirective);
