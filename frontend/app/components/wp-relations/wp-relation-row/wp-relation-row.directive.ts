import {wpTabsModule} from '../../../angular-modules';
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from '../../api/api-v3/hal-resources/work-package-resource.service';


class WpRelationRowDirectiveController {
  public relatedWorkPackage;
  public relationType;

  public showRelationControls:boolean;
  public showRelationInfo:boolean = false;

  public userInputs = {
    description: this.relatedWorkPackage.relatedBy.description,
    showDescriptionEditForm: false
  };

  constructor(protected $scope,
              protected $element,
              protected wpCacheService,
              protected PathHelper,
              protected wpNotificationsService,
              protected WpRelationsService) {
    if (this.relatedWorkPackage.relatedBy) {
      var relationType = this.WpRelationsService.getRelationTypeObjectByType(this.relatedWorkPackage.relatedBy._type);
      this.relationType = angular.isDefined(relationType) ? this.WpRelationsService.getTranslatedRelationTitle[relationType.name] : 'unknown';
    }
  };

  public toggleUserDescriptionForm() {
    this.userInputs.showDescriptionEditForm = !this.userInputs.showDescriptionEditForm;
  }

  public updateRelationDescription() {
    this.WpRelationsService.changeRelationDescription(this.relatedWorkPackage.relatedBy, this.userInputs.description)
      .then(() => {
        this.relatedWorkPackage.relatedBy.description = this.userInputs.description;
      })
      .catch(err => console.log(err))
      .finally(this.toggleUserDescriptionForm());
  }

  public removeRelation() {
    const relation = this.relatedWorkPackage.relatedBy;
    this.WpRelationsService.removeCommonRelation(relation).then(() => {
      this.$scope.$emit('wp-relations.removed', relation);
      // TODO: WpRelationsService.handleSuccess()
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
