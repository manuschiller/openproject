import {wpTabsModule} from '../../../angular-modules';

export class WpRelationsCreateController {

  public showRelationsCreateForm: boolean = false;
  public relationTypes;
  public selectedRelationType;
  public selectedWpId:number;
  protected relationTitles:Object;
  public workPackage;

  constructor(protected $scope,
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

    // Default relationType
    this.selectedRelationType = _.find(this.relationTypes, {name: 'relatedTo'});
  }

  public createRelation() {

    if (this.selectedRelationType.name === 'children') {
      this.addExistingChildWorkPackage();
      return;
    }

    this.selectedRelationType.addWpRelation(this.selectedWpId).then((res) => {
      this.NotificationsService.addSuccess('Relation saved');
    });
  }

  protected addExistingChildWorkPackage(){
    this.wpCacheService.loadWorkPackage(this.selectedWpId).first().subscribe(childWp => {
      childWp.changeParent({
        parentId: this.workPackage.id,
        lockVersion: childWp.lockVersion
      }).then( (wp) => {
        this.wpCacheService.updateWorkPackage([wp, childWp]);
        this.reloadRelations();
      });
    });
  }

  public toggleRelationsCreateForm(creationMode:string) {
    if (creationMode === 'createChildWp') {
      _.find(this.relationTypes, {type: 'children'}).addWpRelation();
    } else {
      this.showRelationsCreateForm = !this.showRelationsCreateForm;
    }

  }
}

function wpRelationsCreate() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/components/wp-relations/wp-relations-create/wp-relations-create.template.html',
    controller: WpRelationsCreateController,
    bindToController: true,
    controllerAs: '$relationsCreateCtrl',
    scope: {
      relationTypes: '=',
      workPackage: '=',
      reloadRelations: '&'
    }
  };
}

wpTabsModule.directive('wpRelationsCreate', wpRelationsCreate);
