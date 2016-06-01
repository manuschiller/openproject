/**
 * Created by manu on 17.05.16.
 */
import {WorkPackageEditFormController} from "../../wp-edit/wp-edit-form.directive";
import {WorkPackageEditFieldService} from "../../wp-edit/wp-edit-field/wp-edit-field.service";
import {WpAttachmentsFormattableService} from "./wp-attachments-formattable-field.service";
import {Field} from "../../wp-edit/wp-edit-field/wp-edit-field.module";

import {InsertMode,ViewMode} from './enums'
import {DropModel,EditorModel,MarkupModel,SingleAttachmentModel} from './models'

export class WpAttachmentsFormattableCreateController {

  public workPackage:any;
  private fieldName:string;
  private insertMode: InsertMode;
  private $location;

  private viewMode: ViewMode = ViewMode.SHOW;
  private insertMode: InsertMode = InsertMode.LINK;

  constructor(protected $scope: any, //ng.IScope
              protected $element: ng.IAugmentedJQuery,
              protected $rootScope,
              protected $location,
              protected wpAttachments,

              protected $timeout){

    this.$location = $location;
    this.workPackage = $scope.vm.workPackage;

    console.log("create directive running");

    $element.get(0).addEventListener("drop",this.handleDrop);
    $element.bind("dragenter",this.prevDefault)
      .bind("dragleave",this.prevDefault)
      .bind("dragover",this.prevDefault);
  }

  public handleDrop = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    let textarea = this.$element.find("textarea");
    this.viewMode  = (textarea.length > 0) ? ViewMode.EDIT : ViewMode.SHOW;

    let workPackage: any = this.$scope.vm.workPackage;
    let dropData: any = new DropModel(evt.dataTransfer,workPackage,this.$location);
    let description: any;

    if(this.viewMode === ViewMode.EDIT){
      description = new EditorModel(textarea,new MarkupModel());
    }

    if(angular.isUndefined(dropData.webLinkUrl) && angular.isUndefined(dropData.files))
      return;

    if(dropData.isUpload){
      if(dropData.filesAreValidForUploading()){
        this.$rootScope.$broadcast("addPendingAttachments",dropData.files);
        if(dropData.filesCount == 1){
          let currentFile = new SingleAttachmentModel(dropData.files[0]);
          description.insertAttachmentLink(currentFile.url,(currentFile.isAnImage) ? InsertMode.INLINE : InsertMode.ATTACHMENT);
        }else if(dropData.filesCount > 1){
          _.each(dropData.files,function(file){
            description.insertAttachmentLink(file.name, InsertMode.ATTACHMENT,true);
          })
        }
        description.save();
      }
    }
    else {
      let insertUrl: string = dropData.isAttachmentOfCurrentWp() ? dropData.removeHostInformationFromUrl() : dropData.webLinkUrl;
      let insertAlternative: InsertMode = dropData.isWebImage() ? InsertMode.INLINE : InsertMode.LINK;
      let insertMode: InsertMode = dropData.isAttachmentOfCurrentWp() ? InsertMode.ATTACHMENT : insertAlternative;

      description.insertWebLink(insertUrl,insertMode);
      description.save();
    }
  };

  public prevDefault = (evt) =>{
    evt.preventDefault();
    evt.stopPropagation();
  }
}

function wpAttachmentsFormattable() {
  return {
    restrict: 'A',
    controller: WpAttachmentsFormattableCreateController,
    bindToController: true,
    require: '^wpAttachments',
    link: function(scope,ele,attrs,controllers){
      console.log("controllers",controllers);
    }
  };
}

//TODO: Use 'openproject.wpEdit' module
angular
  .module('openproject')
  .directive('wpAttachmentsFormattableCreate', wpAttachmentsFormattable);
