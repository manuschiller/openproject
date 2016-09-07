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
  public workPackagePath = this.PathHelper.workPackagePath;

  constructor(protected $scope,
              protected WpRelationsHierarchyService,
              protected wpCacheService,
              protected PathHelper,
              protected wpNotificationsService) {

    if (!this.relatedWorkPackage && this.relationType !== 'parent') {
      this.relatedWorkPackage = angular.copy(this.workPackage);
    }
  };

  public removeRelation() {
    if (this.relationType === 'child') {
      this.removeChild();

    }else if (this.relationType === 'parent') {
     this.removeParent();
    }
  }

  protected removeChild() {
    this.WpRelationsHierarchyService.removeChild(this.relatedWorkPackage).then(exChildWp => {
      this.$scope.$emit('wp-relations.removedChild', exChildWp);
    });
  }

  protected removeParent() {
    this.WpRelationsHierarchyService.removeParent(this.workPackage).then((updatedWp) => {
      this.$scope.$emit('wp-relations.changedParent', {
        updatedWp: this.workPackage,
        parentId: null
      });
    });
  }

  protected changeParent(wpId) {
    // TODO: use WpRelationsService.handleSuccess()
    // TODO: error handling
    this.WpRelationsHierarchyService.changeParent(this.workPackage, wpId).then((updatedWp) => {
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
