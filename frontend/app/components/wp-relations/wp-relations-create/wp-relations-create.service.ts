import {wpTabsModule} from '../../../angular-modules';

export class WpRelationsCreateService {

  constructor(protected I18n){}
  
  // TODO: MOVE TO SERVICE
  public relationTitles = {
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
}

wpTabsModule.service('WpRelationsCreateService', WpRelationsCreateService);
