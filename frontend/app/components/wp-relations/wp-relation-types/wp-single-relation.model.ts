export class WpSingleRelationModel {

  public fullIdentifier:string;
  public relationType:string;
  public relationLabel:string;
  public isParent:boolean;
  public isChild:boolean;

  constructor(protected workPackage,
              protected relatedWorkPackage,
              protected relation,
              protected PathHelper,
              protected I18n,
              protected wpCacheService) {

    this.fullIdentifier = this.getFullIdentifier(relatedWorkPackage);
    //this.relationLabel = this.relationTitles[];
  }

  private getFullIdentifier(workPackage) {
      var type = ' ';
      if (workPackage.type) {
        type += workPackage.type.name + ': ';
      }
      return `#${workPackage.id}${type}${workPackage.subject}`;
  }

  private relationTitles = {
    parent: this.I18n.t('js.relation_labels.parent'),
    children: this.I18n.t('js.relation_labels.children'),
    relatedTo: this.I18n.t('js.relation_labels.relates'),
    duplicates: this.I18n.t('js.relation_labels.duplicates'),
    duplicated: this.I18n.t('js.relation_labels.duplicated'),
    blocks: this.I18n.t('js.relation_labels.blocks'),
    blocked: this.I18n.t('js.relation_labels.blocked'),
    precedes: this.I18n.t('js.relation_labels.precedes'),
    follows: this.I18n.t('js.relation_labels.follows')
  };

  private relationsConfig:WorkPackageRelationsConfigInterface[] = [
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

  private getFullIdentifier() {
    
  } 
  
}
