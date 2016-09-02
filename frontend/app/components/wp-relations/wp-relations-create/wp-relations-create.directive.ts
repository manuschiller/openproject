import {wpTabsModule} from '../../../angular-modules';
import {WorkPackageResourceInterface} from '../../api/api-v3/hal-resources/work-package-resource.service';

export class WpRelationsCreateController {

  public showRelationsCreateForm: boolean = false;
  public workPackage:WorkPackageResourceInterface;
  public selectedRelationType:any;
  public selectedWpId:string;
  public externalFormToggle: boolean;
  public fixedRelationType:string;
  public relationTypes = this.WpRelationsCreateService.relationTypes;
  protected relationTitles = this.WpRelationsCreateService.relationTitles;

  constructor(protected $scope,
              protected WpRelationsCreateService,
              protected wpNotificationsService) {

    var defaultRelationType = angular.isDefined(this.fixedRelationType) ? this.fixedRelationType : 'relatedTo';
    this.selectedRelationType = _.find(this.WpRelationsCreateService.relationTypes, {name: defaultRelationType});
  }

  public createRelation() {
    // TODO: ADD ERROR HANDLING

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

  public toggleFixedRelationTypeForm() {
    this.externalFormToggle = !this.externalFormToggle;
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
      externalFormToggle: '=?'
    },

    controller: WpRelationsCreateController,
    bindToController: true,
    controllerAs: '$relationsCreateCtrl',
  };
}

wpTabsModule.directive('wpRelationsCreate', wpRelationsCreate);
