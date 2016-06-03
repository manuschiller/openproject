/**
 * Created by manu on 19.05.16.
 */

import {IApplyAttachmentMarkup} from './wp-attachments-formattable.interfaces'
import {InsertMode} from './wp-attachments-formattable.enums'

export class EditorModel implements IApplyAttachmentMarkup{
    private currentCaretPosition: number;
    private contentToInsert:string = "";
    private markupModel;
    private textarea;

    constructor(protected textarea,protected markupModel){
        this.setCaretPosition();
    }

    public insertWebLink = (url,insertMode) => {
        if(angular.isUndefined(insertMode)) insertMode = InsertMode.LINK;
        this.contentToInsert = this.markupModel.createMarkup(url,insertMode);
    };

    public insertAttachmentLink = (url,insertMode,addLineBreak?) =>{
        if(angular.isUndefined(insertMode)) insertMode = InsertMode.ATTACHMENT;
        this.contentToInsert = (addLineBreak) ?
        this.contentToInsert + this.markupModel.createMarkup(url, insertMode, addLineBreak) :
            this.markupModel.createMarkup(url, insertMode, addLineBreak);
    };

    private setCaretPosition = () =>{
        this.currentCaretPosition = this.textarea[0].selectionStart;
    };

    public save = () => {
        $(this.textarea).val(this.textarea[0].value.substring(0, this.currentCaretPosition) +
            this.contentToInsert +
            this.textarea[0].value.substring(this.currentCaretPosition, this.textarea[0].value.length));
    }
}

export class MarkupModel{
    constructor(){}

    public createMarkup = (insertUrl,insertMode,addLineBreak) => {
        if (angular.isUndefined((insertUrl))) return "";
        if(angular.isUndefined((addLineBreak))) addLineBreak = false;
        let markup:string = "";

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
    protected dt:any;
    protected config:any = {
        enabledFor: ["description"],
        imageFileTypes : ["jpg","jpeg","gif","png"],
        maximumAttachmentFileSize : 0, // initialized during init process from ConfigurationService
        rejectedFileTypes : ["exe"]
    };
    protected workPackage:any;
    protected $location:any;

    public files;
    public filesCount: number;
    public isUpload: boolean;
    public isDelayedUpload: boolean;
    public isWebLink: boolean;
    public webLinkUrl: string;

    constructor(protected dt,protected workPackage,protected $location){
        this.workPackage = workPackage;
        this.$location = $location;

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
    public isWebImage = () => {
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
    public isAttachmentOfCurrentWp = () => {
        if(this.isWebLink){

            // weblink does not point to our server, so it can't be an attachment
            if(!(this.webLinkUrl.indexOf(this.$location.host()) > -1) ) return false;

            let isAttachment:boolean = false;

            this.workPackage.$embedded.attachments.$embedded.elements.forEach((attachment)=>{
                if(this.webLinkUrl.indexOf(attachment.href > -1)) {
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
    protected removeHostInformationFromUrl = () =>{
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

    protected filesAreValidForUploading = () => {
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
    protected _isUpload = (dt) => {
        if (dt.types && this.filesCount > 0) {
            for (var i=0; i < dt.types.length; i++) {
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

/**
 * @desc contains all properties and methods needed for
 * appending attachments to the content of wp fields without
 * opening the INLINE editor
 * @param {string} content - the markup for the attachments,
 * that should get inserted
 * @returns {FieldModel}
 * @constructor
 */
export class FieldModel implements IApplyAttachmentMarkup {

    private markupModel: any;
    private workPackage: any;
    private contentToInsert: string;

    constructor(workPackage: any, markupModel: any){
        this.markupModel = markupModel;
        this.workPackage = workPackage;
        this.contentToInsert = workPackage.description.raw || "";
    }


    private addInitialLineBreak = () => {
        return (this.contentToInsert.length > 0) ? "\r\n" : "";
    };

    public insertAttachmentLink = (url,insertMode, addLineBreak?) =>{
        this.contentToInsert += this.addInitialLineBreak() + this.markupModel.createMarkup(url,insertMode,false);
    };

    public insertWebLink = (url,insertMode) =>{
        this.contentToInsert += this.addInitialLineBreak() + this.markupModel.createMarkup(url,insertMode,false);
    };

    public save = () => {
        this.workPackage.description.raw = this.contentToInsert;
        this.workPackage.save();
    };

}

