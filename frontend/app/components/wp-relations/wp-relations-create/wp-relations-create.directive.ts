import {wpTabsModule} from '../../../angular-modules';

export class WpRelationsCreateController {

  public showRelationsCreateForm: boolean = false;
  public relationTypes;
  public selectedRelationType;
  public selectedWpId:number;
  public externalFormToggle: boolean;
  public fixedRelationType;
  protected relationTitles:Object;
  public workPackage;

  constructor(protected $scope,
              protected $rootScope,
              protected NotificationsService,
              //protected wpRelations,
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
    
    // Default relationType
    var defaultRelationType = angular.isDefined(this.fixedRelationType) ? this.fixedRelationType : 'relatedTo';
    this.selectedRelationType = _.find(this.relationTypes, {name: defaultRelationType});
  }

  public relationTypes:any[] = [
    {name: 'parent', type: 'parent'},
    {name: 'children', type: 'children'},
    {name: 'relatedTo', type: 'Relation::Relates', id: 'relates'},
    {name: 'duplicates', type: 'Relation::Duplicates'},
    {name: 'duplicated', type: 'Relation::Duplicated'},
    {name: 'blocks', type: 'Relation::Blocks'},
    {name: 'blocked', type: 'Relation::Blocked'},
    {name: 'precedes', type: 'Relation::Precedes'},
    {name: 'follows', type: 'Relation::Follows'}
  ];

  public createRelation() {

    if (this.selectedRelationType.name === 'children') {
      this.addExistingChildWorkPackage();
      return;
    }

    this.selectedRelationType.addWpRelation(this.selectedWpId).then((res) => {
      this.toggleRelationsCreateForm();
      this.$rootScope.$emit('workPackagesRefreshInBackground');
      this.wpNotificationsService.showSave(this.workPackage);
    });
  }

  public createNewChildWorkPackage() {
    _.find(this.relationTypes, {type: 'children'}).addWpRelation();
  }

  public toggleFixedRelationTypeForm() {
    this.externalFormToggle = !this.externalFormToggle;
  }

  public toggleRelationsCreateForm() {
    console.log(this);
    this.showRelationsCreateForm = !this.showRelationsCreateForm;
    this.externalFormToggle = !this.externalFormToggle;
  }

  public toggleExistingChildWorkPackageForm() {
    this.toggleRelationsCreateForm();
    if (this.showRelationsCreateForm) {
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
        if (!angular.isArray(this.workPackage.children)) {
          this.workPackage.children = [];
        }
        this.workPackage.subject = "Hallo Welt";
        this.workPackage.children.push(childWp);
        this.workPackage.save().then(wp => this.selectedRelationType.handleSuccess([wp, childWp]);)

      });
    });
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
      relationTypes: '=?',
      workPackage: '=?',
      fixedRelationType: '@?',
      externalFormToggle: '=?'
    }
  };
}

wpTabsModule.directive('wpRelationsCreate', wpRelationsCreate);
