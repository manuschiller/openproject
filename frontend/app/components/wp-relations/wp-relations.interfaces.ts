import {WorkPackageResourceInterface} from '../api/api-v3/hal-resources/work-package-resource.service';
import {CollectionResourceInterface} from "../api/api-v3/hal-resources/collection-resource.service";

export interface RelatedWorkPackage extends WorkPackageResourceInterface {
  relatedBy: CollectionResourceInterface;
}

export interface RelatedWorkPackagesGroup {
  [key: string] : RelatedWorkPackage;
}

