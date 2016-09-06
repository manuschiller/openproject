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
  protected relationTitles = this.WpRelationsService.configuration.relationTitles;

  constructor(protected $scope,
              protected WpRelationsService,
              protected wpNotificationsService,
              protected wpCacheService,
              protected $state) {

    var defaultRelationType = angular.isDefined(this.fixedRelationType) ? this.fixedRelationType : 'relatedTo';
    this.selectedRelationType = _.find(this.WpRelationsService.configuration.relationTypes, {name: defaultRelationType});
  }

  public createRelation() {
    // TODO: ADD ERROR HANDLING

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
    this.wpCacheService.loadWorkPackage([this.selectedWpId])
      .take(1)
      .subscribe(wpToBecomeChild => {
        wpToBecomeChild.parentId = this.workPackage.id;
        wpToBecomeChild.save()
          .then(addedChildWp => {
            this.$scope.$emit('wp-relations.addedChild', addedChildWp);
          })
          .finally(this.toggleRelationsCreateForm());
      });
  }

  protected createNewChildWorkPackage() {
    this.workPackage.project.$load()
      .then(() => {
        const args = [
          'work-packages.list.new',
          {
            parent_id: this.workPackage.id,
            projectPath: this.workPackage.project.identifier
          }
        ];

        if (this.$state.includes('work-packages.show')) {
          args[0] = 'work-packages.new';
        }

        (<any>this.$state).go(...args);
      });
  }

  // TODO: avoid copy paste
  // move all create / update / remove actions to service
  protected changeParent() {
    this.workPackage.parentId = this.selectedWpId;
      this.workPackage.save().then(updatedWp => {
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
      externalFormToggle: '=?'
    },

    controller: WpRelationsCreateController,
    bindToController: true,
    controllerAs: '$relationsCreateCtrl',
  };
}

wpTabsModule.directive('wpRelationsCreate', wpRelationsCreate);
