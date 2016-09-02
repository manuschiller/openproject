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
  public showRelationInfo:boolean = false;

  constructor(protected $scope,
              protected $element,
              protected wpCacheService,
              protected PathHelper,
              protected wpNotificationsService) {
    if (this.relatedWorkPackage.relatedBy) {
      this.relationType = this.relatedWorkPackage.relatedBy._type.split('::').pop();
    }
    this.wpForm = this.relatedWorkPackage;
  };



  public getFullIdentifier(hideType?:boolean) {
    var type = ' ';
    if (this.relatedWorkPackage.type && !hideType) {
      type += this.relatedWorkPackage.type.name + ': ';
    }
    return `#${this.relatedWorkPackage.id}${type}${this.relatedWorkPackage.subject}`;
  }

  public removeRelation() {
    var relatedBy = this.relatedWorkPackage.relatedBy;
    this.relatedWorkPackage.relatedBy.remove().then(res => {
      this.$scope.$emit('wp-relations.removed', relatedBy);
      this.wpNotificationsService.showSave(this.relatedWorkPackage);
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
