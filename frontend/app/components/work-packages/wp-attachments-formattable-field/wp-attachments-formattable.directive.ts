/**
 * Created by manu on 17.05.16.
 */
import {WorkPackageEditFormController} from "../../wp-edit/wp-edit-form.directive";
import {WorkPackageEditFieldService} from "../../wp-edit/wp-edit-field/wp-edit-field.service";
import {WpAttachmentsFormattableService} from "./wp-attachments-formattable-field.service";
import {Field} from "../../wp-edit/wp-edit-field/wp-edit-field.module";

import {InsertMode,ViewMode} from './wp-attachments-formattable.enums'
import {DropModel,EditorModel,MarkupModel,FieldModel,SingleAttachmentModel} from './wp-attachments-formattable.models'

export class WpAttachmentsFormattableController {

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
        }else{
            description = new FieldModel(workPackage,new MarkupModel())
        }

        if(angular.isUndefined(dropData.webLinkUrl) && angular.isUndefined(dropData.files))
            return;

        if(dropData.isUpload){
            if(dropData.filesAreValidForUploading()){
                if(!dropData.isDelayedUpload){
                    this.wpAttachments.upload(workPackage,dropData.files).then((upload) => {
                            this.wpAttachments.load(workPackage,true).then((updatedAttachments) => {
                                if(angular.isUndefined(updatedAttachments))
                                    return;

                                updatedAttachments.sort(function(a,b){
                                    return a.id > b.id ? 1 : -1;
                                });

                                if(dropData.filesCount == 1){
                                    let currentFile = new SingleAttachmentModel(updatedAttachments[updatedAttachments.length-1]);
                                    description.insertAttachmentLink(currentFile.url,(currentFile.isAnImage) ? InsertMode.INLINE : InsertMode.ATTACHMENT);
                                }else if(dropData.filesCount > 1){
                                    for(var i = updatedAttachments.length-1;
                                      i >= updatedAttachments.length - dropData.filesCount;
                                      i--){
                                    description.insertAttachmentLink(updatedAttachments[i]._links.downloadLocation.href, InsertMode.ATTACHMENT,true);
                                  }
                                }

                                description.save();
                                this.$rootScope.$broadcast("reloadWpAttachments");

                            })
                    },function(err){
                        console.log(err)
                    });
                }
              else{
                  _.each(dropData.files,(file)=>{
                    description.insertAttachmentLink(file.name.replace(/ /g , "_"), InsertMode.ATTACHMENT,true);
                    // TODO: solve via service
                    file['isPending'] = true;
                    console.log(file)
                    this.wpAttachments.addPendingAttachments(file);
                    this.$rootScope.$broadcast("addPendingAttachments",file)
                  });
                  description.save();
                }
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
        require: ['?^wpEditForm'],
        controller: WpAttachmentsFormattableController,
        bindToController: true
    };
}

//TODO: Use 'openproject.wpEdit' module
angular
    .module('openproject')
    .directive('wpAttachmentsFormattable', wpAttachmentsFormattable);
