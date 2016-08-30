import {wpTabsModule} from '../../../angular-modules';
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from "../../api/api-v3/hal-resources/work-package-resource.service";


class WpParentRelationDirectiveController {

  public state: string;
  public fullIdentifier: string;
  public relatedWorkPackage: WorkPackageResource;
  public relation;
  public workPackage;
  public relationGroup;
  public indentBy;
  public showEditForm: boolean = false;

  constructor(protected $scope, protected wpCacheService, protected PathHelper) {
  };
  
}

function WpParentRelation() {
  return {
    restrict: 'E',
    templateUrl: '/components/wp-relations/wp-parent-relation/wp-parent-relation.template.html',
    replace: true,
    scope: {
      relation: '=',
      relationGroup: '=',
      workPackage: '=',
    },
    controller: WpParentRelationDirectiveController,
    controllerAs: '$ctrl',
    bindToController: true
  };
}

wpTabsModule.directive('wpParentRelation', WpParentRelation);
