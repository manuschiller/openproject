import {IApplyAttachmentMarkup} from './wp-attachments-formattable.interfaces'
import {InsertMode} from './wp-attachments-formattable.enums'
import {WorkPackageResource} from "../../api/api-v3/hal-resources/work-package-resource.service";
import IAugmentedJQuery = angular.IAugmentedJQuery;

export class EditorModel implements IApplyAttachmentMarkup{
    private currentCaretPosition: number;
    public contentToInsert:string = "";

    constructor(protected textarea: IAugmentedJQuery, protected markupModel: MarkupModel){
        this.setCaretPosition();
    }

    public insertWebLink(url: string, insertMode: InsertMode = InsertMode.LINK): void {
        this.contentToInsert = this.markupModel.createMarkup(url, insertMode);
    };

    public insertAttachmentLink(url: string, insertMode: InsertMode = InsertMode.ATTACHMENT, addLineBreak?: boolean): void {
        this.contentToInsert = (addLineBreak) ?
        this.contentToInsert + this.markupModel.createMarkup(url, insertMode, addLineBreak) :
            this.markupModel.createMarkup(url, insertMode, addLineBreak);
    };

    private setCaretPosition(): void {
        this.currentCaretPosition = (this.textarea[0] as HTMLTextAreaElement).selectionStart;
    };

    public save(): void {
        this.textarea.val(this.textarea.val().substring(0, this.currentCaretPosition) +
            this.contentToInsert +
            this.textarea.val().substring(this.currentCaretPosition, this.textarea.val().length)).change();
    }
}

export class MarkupModel{

    public createMarkup(insertUrl: string, insertMode: InsertMode, addLineBreak?: boolean = false): string {
        if (angular.isUndefined((insertUrl))) return "";

        var markup:string = "";

        switch (insertMode) {
            case InsertMode.ATTACHMENT:
                markup = "attachment:" + insertUrl.split("/").pop();
                break;
            case InsertMode.DELAYED_ATTACHMENT:
                markup = "attachment:" + insertUrl;
                break;
            case InsertMode.INLINE:
                markup = "!" + insertUrl + "!";
                break;
            case InsertMode.LINK:
                markup += insertUrl;
                break;
        }

        if(addLineBreak) markup += "\r\n";
        return markup;
    }

}

export class DropModel{
    public files: FileList;
    public filesCount: number;
    public isUpload: boolean;
    public isDelayedUpload: boolean;
    public isWebLink: boolean;
    public webLinkUrl: string;

    protected config: any = {
      imageFileTypes : ["jpg","jpeg","gif","png"],
      maximumAttachmentFileSize : 0, // initialized during init process from ConfigurationService
    };

    constructor(protected $location: ng.ILocationService, protected dt: DataTransfer, protected workPackage: WorkPackageResource){
        this.files = dt.files;
        this.filesCount = this.files.length;
        this.isUpload = this._isUpload(dt);
        this.isDelayedUpload = this.workPackage.isNew;
        this.isWebLink = ! this.isUpload;
        this.webLinkUrl = dt.getData("URL");
    }

    /**
     * @desc checks whether a given URL points to an image file.
     * Will make decision based on the fileExtensions Array at
     * _config.imageFileTypes[]
     * @returns {boolean}
     */
    public isWebImage(): boolean {
        if(angular.isDefined(this.webLinkUrl)){
            return (this.config.imageFileTypes.indexOf(this.webLinkUrl.split(".").pop().toLowerCase()) > -1);
        }
    };

    /**
     * @desc checks whether a drop content can be identified as attachment
     * belonging to the current wp.
     * Will try to handle URLs and file contents.
     * @returns {boolean}
     */
    public isAttachmentOfCurrentWp():boolean {
        if(this.isWebLink){

            // weblink does not point to our server, so it can't be an attachment
            if(!(this.webLinkUrl.indexOf(this.$location.host()) > -1) ) return false;

            var isAttachment:boolean = false;

            this.workPackage.$embedded.attachments.$embedded.elements.forEach((attachment)=>{
                if(this.webLinkUrl.indexOf(attachment.href) > -1) {
                    isAttachment = true;
                    return; // end foreach
                }
            });
            return isAttachment;
        }
    };

    /**
     * @desc returns a relative path from a full URL
     *
     *  usecase:
     *  user dropped a weblink to the textarea which can be resolved as a wp attachment
     *  http://127.0.0.1:5000/attachments/22/sample.jpg
     *
     *  dropModel.removeHostInformationFromUrl(ourUrl)
     *  returns: /attachments/22/sample.jpg</p>
     *
     *  <p>which can be included as clean textile attachment markup</p>
     *
     * @returns {string}
     */
    protected removeHostInformationFromUrl(): string {
        return this.webLinkUrl.replace(window.location.origin, "");
    };

    /**
     * @desc checks if there are any files on the current upload
     * queue that are invalid for uploading
     *
     * Reasons for Rejection:
     *  => filesize exceeds the global filesizelimit returned
     *  from ConfigurationService
     *  => fileextension not allowed for uploading (e.g. *.exe)
     * @returns {boolean}
     */

    protected filesAreValidForUploading(): boolean {
        // needs: clarifying if rejected filetypes are a wanted feature
        // no filetypes are getting rejected yet
        var allFilesAreValid = true;
        /*this.files.forEach((file)=>{
         if(file.size > this.config.maximumAttachmentFileSize) {
         allFilesAreValid = false;
         return;
         }
         });*/
        return allFilesAreValid;
    };

    /**
     * @desc checks if the given files object in
     * the dataTransfer property _dt contains files to upload
     * @returns {boolean}
     * @private
     */
    protected _isUpload(dt: DataTransfer): boolean {
        if (dt.types && this.filesCount > 0) {
            for (let i=0; i < dt.types.length; i++) {
                if (dt.types[i] == "Files") {
                    return true;
                }
            }
        }
        return false;
    }
}

export class SingleAttachmentModel {
    protected imageFileExtensions: Array<string> = ['jpeg','jpg','gif','bmp','png'];

    public fileExtension: string;
    public fileName: string;
    public isAnImage: boolean;
    public url: string;


    constructor(protected attachment: any){
        if(angular.isDefined(attachment)){
            this.fileName = attachment.fileName || attachment.name;
            this.fileExtension = this.fileName.split(".").pop().toLowerCase();
            this.isAnImage = this.imageFileExtensions.indexOf(this.fileExtension) > -1;
            this.url = angular.isDefined(attachment._links) ? attachment._links.downloadLocation.href : '';
        }
    }

}

export class FieldModel implements IApplyAttachmentMarkup {
    public contentToInsert: string;

    constructor(protected workPackage: WorkPackageResource, protected markupModel: MarkupModel){
        this.contentToInsert = workPackage.description.raw || "";
    }


    private addInitialLineBreak(): string {
        return (this.contentToInsert.length > 0) ? "\r\n" : "";
    };

    public insertAttachmentLink(url: string, insertMode: InsertMode, addLineBreak?: boolean): void {
        this.contentToInsert += this.addInitialLineBreak() + this.markupModel.createMarkup(url,insertMode,false);
    };

    public insertWebLink(url: string, insertMode: InsertMode): void {
        this.contentToInsert += this.addInitialLineBreak() + this.markupModel.createMarkup(url,insertMode,false);
    };

    public save(): void {
        this.workPackage.description.raw = this.contentToInsert;
        this.workPackage.save();
    };

}

