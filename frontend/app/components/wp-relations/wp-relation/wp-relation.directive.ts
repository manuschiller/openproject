import {wpTabsModule} from '../../../angular-modules';
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from "../../api/api-v3/hal-resources/work-package-resource.service";


class WpRelationDirectiveController {

  public state: string;
  public fullIdentifier: string;
  public relatedWorkPackage: WorkPackageResource;
  public relation;
  public workPackage;
  public relationGroup;
  public indentBy;
  public showEditForm: boolean = false;

  constructor(protected $scope, protected wpCacheService, protected PathHelper) {
    if (this.relationGroup && this.relation) {
      this.relationGroup.getRelatedWorkPackage(this.relation).then((workPackage) => {


        this.wpCacheService.loadWorkPackage(workPackage.id).first().subscribe((relatedWorkPackage:WorkPackageResourceInterface) => {
          this.relatedWorkPackage = relatedWorkPackage;
          this.fullIdentifier = this.getFullIdentifier(relatedWorkPackage);
          this.state = relatedWorkPackage.status.isClosed ? 'closed' : '';
        });

      });
    }else {
      this.relatedWorkPackage = this.workPackage;
      this.fullIdentifier = this.getFullIdentifier(this.workPackage);
      this.state = this.workPackage.status.isClosed  ? 'closed' : '';
    }
  };

  public getFullIdentifier(workPackage) {
    if (angular.isDefined(workPackage)) {
      var type = ' ';

      if (workPackage.type) {
        type += workPackage.type.name + ': ';
      }

      return `#${workPackage.id}${type}${workPackage.subject}`;
     }
  }

  public canRemoveRelation(relation?):boolean {
    return this.relationGroup.canRemoveRelation(relation);
  }

  public removeRelation(relation) {
    this.relationGroup.removeWpRelation(relation)
      .then(index => {
        //this.handleSuccess(index);
      })
      .catch(error => angular.noop()); //this.wpNotificationsService.handleErrorResponse(error, this.workPackage));
  }

  public toggleEditParentForm() {
    this.showEditParentForm = !this.showEditParentForm;
  }
}

function WpRelationDirective() {
  return {
    restrict: 'E',
    templateUrl: '/components/wp-relations/wp-relation/wp-relation.template.html',
    replace: true,
    scope: {
      relation: '=',
      relationGroup: '=',
      workPackage: '=',
      indentBy: '@'
    },
    controller: WpRelationDirectiveController,
    controllerAs: '$ctrl',
    bindToController: true
  };
}

wpTabsModule.directive('wpRelation', WpRelationDirective);
