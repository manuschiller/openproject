import {wpTabsModule} from '../../../angular-modules';
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from "../../api/api-v3/hal-resources/work-package-resource.service";


class WpRelationsHierarchyRowDirectiveController {
  public workPackage;
  public wpForm;
  public relationType;
  public indentBy;

  constructor(protected $scope, protected wpCacheService, protected PathHelper) {
    console.log(this.relationType);
    if (this.relationType) {
      wpCacheService.loadWorkPackage(this.workPackage.id).subscribe(wp => {
        this.wpForm = wp;
      });
    }else {
      this.wpForm = this.workPackage;
    }
  };

  public getFullIdentifier(hideType?:boolean) {
    var type = ' ';
    if (this.workPackage.type && !hideType) {
      type += this.workPackage.type.name + ': ';
    }
    return `#${this.workPackage.id}${type}${this.workPackage.subject}`;
  }

  public removeRelation() {
    if (this.relationType === 'child') {
      //remove child
    }else if (this.relationType === 'parent') {
      this.workPackage.changeParent(null);
    }
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
      relationType: '@'
    },
    controller: WpRelationsHierarchyRowDirectiveController,
    controllerAs: '$ctrl',
    bindToController: true
  };
}

wpTabsModule.directive('wpRelationsHierarchyRow', WpRelationsHierarchyRowDirective);
