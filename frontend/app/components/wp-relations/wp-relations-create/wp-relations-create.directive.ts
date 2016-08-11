import {wpTabsModule} from '../../../angular-modules';

export class WpRelationsCreateController {

  public showRelationsCreateForm: boolean = false;
  public relationTypes;
  public selectedRelationType;
  public wpToAddId;
  protected relationTitles;

  constructor(protected $scope,
              protected NotificationsService,
              protected wpRelations,
              protected I18n,
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

    this.selectedRelationType = _.find(this.relationTypes, {name: 'relatedTo'});
  }
  
  public createRelation() {
    console.log("relationType",this.selectedRelationType);
    console.log("wpToAddId",this.wpToAddId);
    this.selectedRelationType.addRelation(this.wpToAddId).then((res)=>{
      console.log("added",res);
    })
  }

  public toggleRelationsCreateForm() {
    this.showRelationsCreateForm = !this.showRelationsCreateForm;
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
      relationTypes: '='
    }
  };
}

wpTabsModule.directive('wpRelationsCreate', wpRelationsCreate);
