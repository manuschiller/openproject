import {wpTabsModule} from '../../../angular-modules';
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from '../../api/api-v3/hal-resources/work-package-resource.service';
import {RelatedWorkPackage, RelationResource} from "../wp-relations.interfaces";


class WpRelationRowDirectiveController {
  public relatedWorkPackage:RelatedWorkPackage;
  public relationType:string;

  public showRelationControls:boolean;
  public showRelationInfo:boolean = false;

  public userInputs = {
    description: this.relatedWorkPackage.relatedBy.description,
    showDescriptionEditForm: false
  };

  public relation:RelationResource = this.relatedWorkPackage.relatedBy;

  constructor(protected $scope:ng.IScope,
              protected $element,
              protected wpCacheService,
              protected PathHelper,
              protected wpNotificationsService,
              protected WpRelationsService) {
    if (this.relation) {
      var relationType = this.WpRelationsService.getRelationTypeObjectByType(this.relation._type);
      this.relationType = angular.isDefined(relationType) ? this.WpRelationsService.getTranslatedRelationTitle[relationType.name] : 'unknown';
    }

    console.log('row', this.relation);
  };

  public toggleUserDescriptionForm() {
    this.userInputs.showDescriptionEditForm = !this.userInputs.showDescriptionEditForm;
  }

  public updateRelationDescription() {
    console.log('relatedWp', this.relatedWorkPackage);
    console.log('relation', this.relation);
    this.WpRelationsService.changeRelationDescription(this.relation, this.userInputs.description)
      .then(() => {
        this.relation.description = this.userInputs.description;
      })
      .catch(err => console.log(err))
      .finally(this.toggleUserDescriptionForm());
  }

  public removeRelation() {
    const relation = this.relation;
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
