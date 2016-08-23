import {wpTabsModule} from '../../../angular-modules';

export class WpRelationsCreateController {

  public showRelationsCreateForm: boolean = false;
  public relationTypes;
  public selectedRelationType;
  public selectedWpId:number;
  public externalFormToggle: boolean;
  protected relationTitles:Object;
  public workPackage;

  constructor(protected $scope,
              protected $rootScope,
              protected NotificationsService,
              protected wpRelations,
              protected WorkPackageParentRelationGroup,
              protected I18n,
              protected wpCacheService,
              protected wpNotificationsService) {

    this.relationTitles = {
      parent: I18n.t('js.relation_labels.parent'),
      children: I18n.t('js.relation_labels.children'),
      relatedTo: I18n.t('js.relation_labels.relates'),
      duplicates: I18n.t('js.relation_labels.duplicates'),
      duplicated: I18n.t('js.relation_labels.duplicated'),
      blocks: I18n.t('js.relation_labels.blocks'),
      blocked: I18n.t('js.relation_labels.blocked'),
      precedes: I18n.t('js.relation_labels.precedes'),
      follows: I18n.t('js.relation_labels.follows')
    };

    console.log("create form", this);

    // Default relationType
    this.selectedRelationType = _.find(this.relationTypes, {name: 'relatedTo'});
  }

  public createRelation() {

    if (this.selectedRelationType.name === 'children') {
      this.addExistingChildWorkPackage();
      return;
    }

    this.selectedRelationType.addWpRelation(this.selectedWpId).then((res) => {
      this.toggleRelationsCreateForm();
      this.wpNotificationsService.showSave(this.workPackage);
    });
  }

  public createNewChildWorkPackage() {
    _.find(this.relationTypes, {type: 'children'}).addWpRelation();
  }

  public toggleFixedRelationTypeForm() {
    this.externalFormToggle = !this.externalFormToggle;
  }

  public toggleExistingChildWorkPackageForm() {
    this.toggleRelationsCreateForm();
    if(this.showRelationsCreateForm) {
      this.selectedRelationType = _.find(this.relationTypes, {name: 'children'});

    }
  }

  protected addExistingChildWorkPackage() {
    this.toggleExistingChildWorkPackageForm();
    this.wpCacheService.loadWorkPackage(this.selectedWpId).first().subscribe(childWp => {
      childWp.changeParent({
        parentId: this.workPackage.id,
        lockVersion: childWp.lockVersion
      }).then( (updatedWp) => {
        this.$rootScope.$emit('workPackagesRefreshInBackground');
        this.selectedRelationType.handleSuccess([updatedWp, childWp]);
      });
    });
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
    controller: WpRelationsCreateController,
    bindToController: true,
    controllerAs: '$relationsCreateCtrl',
    scope: {
      relationTypes: '=',
      workPackage: '=',
      fixedRelationType: '@',
      externalFormToggle: '=?'
    }
  };
}

wpTabsModule.directive('wpRelationsCreate', wpRelationsCreate);
