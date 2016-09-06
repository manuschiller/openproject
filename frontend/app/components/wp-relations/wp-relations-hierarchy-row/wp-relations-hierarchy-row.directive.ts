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
  public showEditForm: boolean = false;

  constructor(protected $scope,
              protected wpCacheService,
              protected PathHelper,
              protected wpNotificationsService) {
    if (!this.relatedWorkPackage && this.relationType !== 'parent') {
      this.relatedWorkPackage = angular.copy(this.workPackage);
    }
  };

  public getFullIdentifier(hideType?:boolean) {
    var type = ' ';
    if (this.relatedWorkPackage.type && !hideType) {
      type += this.relatedWorkPackage.type.name + ': ';
    }
    return `${type}${this.relatedWorkPackage.subject}`;
  }

  public removeRelation() {
    if (this.relationType === 'child') {
      this.removeChild();

    }else if (this.relationType === 'parent') {
     this.removeParent();
    }
  }

  protected removeChild() {
    this.relatedWorkPackage.parentId = null;
    this.relatedWorkPackage.save().then(relatedExChildWp => {
      this.$scope.$emit('wp-relations.removedChild', relatedExChildWp);
    });
  }

  protected removeParent() {
    this.changeParent(null);
  }

  protected changeParent(wpId) {
    this.workPackage.parentId = wpId;
    this.workPackage.save().then(wp => {
      this.$scope.$emit('wp-relations.changedParent', {
        updatedWp: this.workPackage,
        parentId: wpId
      });
    });
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
