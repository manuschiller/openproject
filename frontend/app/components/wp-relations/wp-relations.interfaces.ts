import {WorkPackageResourceInterface} from '../api/api-v3/hal-resources/work-package-resource.service';
import {HalResource} from '../api/api-v3/hal-resources/hal-resource.service';

export interface RelatedWorkPackage extends WorkPackageResourceInterface {
  relatedBy: HalResource;
}

export interface RelatedWorkPackagesGroup {
  [key: string] : RelatedWorkPackage;
}

