import {wpTabsModule} from '../../../angular-modules';
import {WorkPackageResourceInterface} from '../../api/api-v3/hal-resources/work-package-resource.service';

export class WpRelationsCreateController {

  public showRelationsCreateForm: boolean = false;
  public workPackage:WorkPackageResourceInterface;
  public selectedRelationType:any;
  public selectedWpId:string;
  public externalFormToggle: boolean;
  public fixedRelationType:string;
  public relationTypes = this.WpRelationsService.configuration.relationTypes;
  public relatedWorkPackages;
  protected relationTitles = this.WpRelationsService.configuration.relationTitles;

  constructor(protected $scope,
              protected WpRelationsService,
              protected WpRelationsHierarchyService,
              protected wpNotificationsService,
              protected wpCacheService,
              protected $state) {

    var defaultRelationType = angular.isDefined(this.fixedRelationType) ? this.fixedRelationType : 'relatedTo';
    this.selectedRelationType = this.WpRelationsService.getRelationTypeObjectByName(defaultRelationType);

    // TODO: Toggle not working properly..
    if (angular.isDefined(this.externalFormToggle)) {
      this.showRelationsCreateForm = this.externalFormToggle;
    }
  }

  public createRelation() {
    switch (this.selectedRelationType.name) {
      case 'parent':
        this.changeParent();
        break;
      case 'children':
        this.addExistingChildRelation();
        break;
      default:
        this.createCommonRelation();
        break;
    }
  }

  protected addExistingChildRelation() {
    this.WpRelationsHierarchyService.addExistingChildWp(this.workPackage, this.selectedWpId)
      .then(newChildWp => {
        this.$scope.$emit('wp-relations.addedChild', newChildWp);
      }
    ).finally(this.toggleRelationsCreateForm());
  }

  protected createNewChildWorkPackage() {
    this.WpRelationsHierarchyService.addNewChildWp(this.workPackage);
  }

  protected changeParent() {
    this.WpRelationsHierarchyService.changeParent(this.workPackage, this.selectedWpId)
      .then(updatedWp => {
        // TODO: use WpRelations.handleSuccess();
        this.$scope.$emit('wp-relations.changedParent', {
          updatedWp: updatedWp,
          parentId: this.selectedWpId
        });
      })
      .catch(err => console.log(err))
      .finally(() => {
        this.toggleRelationsCreateForm();
      });
  }

  protected createCommonRelation() {
    let relation_type = this.selectedRelationType.name === 'relatedTo' ? this.selectedRelationType.id : this.selectedRelationType.name;
    const params = {
      to_id: this.selectedWpId,
      relation_type: relation_type
    };

    this.workPackage.addRelation(params)
      .then(relation => {
        this.$scope.$emit('wp-relations.added', relation);
        this.wpNotificationsService.showSave(this.workPackage);
      })
      .catch(err => console.log(err))
      .finally(this.toggleRelationsCreateForm());
  }

  public toggleRelationsCreateForm() {
    this.showRelationsCreateForm = !this.showRelationsCreateForm;
    this.externalFormToggle = !this.externalFormToggle;
  }
}

function wpRelationsCreate() {
  return {
    restrict: 'E',
    replace: true,

    templateUrl: (el, attrs) => {
      return '/components/wp-relations/wp-relations-create/' + attrs.template + '.template.html';
    },

    scope: {
      workPackage: '=?',
      fixedRelationType: '@?',
      externalFormToggle: '=?',
      relatedWorkPackages: '='
    },

    controller: WpRelationsCreateController,
    bindToController: true,
    controllerAs: '$relationsCreateCtrl',
  };
}

wpTabsModule.directive('wpRelationsCreate', wpRelationsCreate);
