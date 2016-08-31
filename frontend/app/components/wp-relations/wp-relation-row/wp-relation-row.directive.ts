import {wpTabsModule} from '../../../angular-modules';
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from "../../api/api-v3/hal-resources/work-package-resource.service";


class WpRelationRowDirectiveController {
  public relatedWorkPackage;
  public wpForm;
  public relation;
  public relationType;

  public workPackagePath = this.PathHelper.workPackagePath;
  public showRelationControls:boolean;
  public showRelationInfo:boolean;

  constructor(protected $scope, protected $element, protected wpCacheService, protected PathHelper) {
    if (this.relatedWorkPackage.relatedBy) {
      this.relationType = this.relatedWorkPackage.relatedBy._type.split('::').pop();
    }
    wpCacheService.loadWorkPackage(this.relatedWorkPackage.id).subscribe(wp => {
      this.wpForm = wp;
    })
  };



  public getFullIdentifier(hideType?:boolean) {
    var type = ' ';
    if (this.relatedWorkPackage.type && !hideType) {
      type += this.relatedWorkPackage.type.name + ': ';
    }
    return `#${this.relatedWorkPackage.id}${type}${this.relatedWorkPackage.subject}`;
  }

  public removeRelation() {
    this.relatedWorkPackage.relatedBy.remove().then(res => {
      this.wpCacheService.updateWorkPackage([this.relatedWorkPackage]);
    });
  }
}

function WpRelationRowDirective() {
  return {
    restrict: 'E',
    templateUrl: '/components/wp-relations/wp-relation-row/wp-relation-row.template.html',
    replace: true,
    scope: {
      relatedWorkPackage: '='
    },
    controller: WpRelationRowDirectiveController,
    controllerAs: '$ctrl',
    bindToController: true
  };
}

wpTabsModule.directive('wpRelationRow', WpRelationRowDirective);
