import { Component, OnInit, ViewChild } from '@angular/core';
import { ProfileService } from '../services/profile.service'
import { CommonFunctionsService } from '../services/commonFunctions.service'
import { Router, ActivatedRoute } from '@angular/router'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../form/confirm-dialog/confirm-dialog.component';

import { MatDialog } from '@angular/material/dialog';

@Component({
  templateUrl: 'menuitems.component.html',
  styleUrls: ['./menuitems.component.css']
})
export class MenuitemsComponent implements OnInit {
  user: any;
  productList: any[] = [];
  processing: boolean = false;
  profile: any;
  categories: any;
  addedItems = []
  addedCategories = []
  googleEmail: any;
  @ViewChild('ref') ref;
  authentication_url: any;
  drivefolders: any;
  constructor(private toastr: ToastrService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private _ProfileService: ProfileService, private slimLoader: SlimLoadingBarService, private _CommonFunctionsService: CommonFunctionsService, private _Router: Router) {

  }
  onChange(event, item) {
    // can't event.preventDefault();
    console.log('onChange event.checked ' + event.checked, item)
    if (event.checked) {
      this.addedCategories.push(item)
    } else {
      this.removeItemFromArray(item)
    }

  }

  addItems() {
    console.log('addedItems', this.addedCategories)
    this.addedItems = this.addedCategories
  }
  onChange1(event, item) {
    // can't event.preventDefault();
    console.log('onChange event.checked ' + event.checked, item)
    if (event.checked) {
      this.removeItemFromArray(item)
    }
  }
  removeCategories() {
    this.addedItems = this.addedCategories
  }
  removeItemFromArray(item) {
    const index = this.addedCategories.indexOf(item);
    if (index > -1) {
      this.addedCategories.splice(index, 1);
    }
  }

  ngOnInit() {
    this.getAllProductList();
    this.getCompanyProfile();
    this.getgoogleauthntication()
    this.getAllCategories();
    this.route.params.subscribe(data => {
      console.log('emailllll', data)
      this.googleEmail = data.email
    })
    this.getFolderbyEmail()

  }

  onSelect(event) {
    console.log(event);
    // this.feathuredfiles.push(...event.addedFiles);
    const formData = new FormData();
    formData.append('file',event.addedFiles[0]);
    // this.uploadFeaturePhoto(formData);
  }
  getFolderbyEmail() {
    if (this.googleEmail) {
      const data = {
        email: this.googleEmail
      }
      this._ProfileService.getFoldersCreatedInDrive(data).subscribe(res => {
        console.log('resssssss getFoldersCreatedInDrive', res)
        this.drivefolders=res.data
      })

    }
  }

  onFileSelect(event,folderId,category) {
    if (event.target.files.length > 0) {
      console.log(event.target.files[0])
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file',file);
      formData.append('folderId',folderId);
      formData.append('email',this.googleEmail);
      formData.append('category',category);

      this.uploadImageToDrive(formData,folderId,category);
    }
  }

  uploadImageToDrive(formData,folderId,category) {
    
    this.user = this._CommonFunctionsService.checkUser().user;
    this._ProfileService.uploadImageTodrive(this.user.company_id,formData).subscribe(res => {
      console.log('googgleData', res.data)
      this.authentication_url = res.data
    });

  }
 

  getAllProductList() {
    this.processing = true;
    this.user = this._CommonFunctionsService.checkUser().user;
    this._ProfileService.getAllProductList(this.user.unit_id).subscribe((res: any) => {
      this.productList = res.data;
      this.processing = false;
    }, error => {
      //debugger
    })
  }
  getgoogleauthntication() {
    this._ProfileService.getGoogleAuthenication().subscribe(res => {
      console.log('googgleData', res.data)
      this.authentication_url = res.data
    });

  }
  createFolderinDrive() {
    const data = {
      folder: this.addedItems,
      email:this.googleEmail,
      user_id:'11744'
    }
    console.log('folderss data', data)

    this._ProfileService.createfolderInGoogleDrive(data).subscribe(res => {
      console.log('folderss', res)
      this.getFolderbyEmail()
    })
  }

  onClick(event) {
    event.preventDefault();
    //  console.log('onClick event.checked ' + event.checked);
    // console.log('onClick event.target.checked '+event.target.checked);
    console.log('onClick this.ref._checked ' + this.ref._checked);

    this.ref._checked = !this.ref._checked;
  }
  getCompanyProfile() {
    this.user = this._CommonFunctionsService.checkUser().user;
    this._ProfileService.getCompanyprofile(this.user.unit_id).subscribe((res: any) => {
      this.profile = res.data;
      console.log(this.profile)
    }, error => {
      //  
    })
  }

  uploadGoogleMenuSheet() {
    this._ProfileService.uploadGoogleMenuSheet().subscribe((res: any) => {
      this.toastr.success(res.success);
      this.getAllProductList();
    }, error => {
      this.toastr.error('Failed to upload, please try again later')
    })
  }
  getAllCategories() {
    this._ProfileService.getAllCategories().subscribe(res => {
      this.categories = res.data
    })
  }
  openProduct(item) {
    this._Router.navigateByUrl('menuitems/view/' + item.category + '/' + item.id)
  }

  getDescription(description) {
    return description.length > 25 ? description.substr(0, 25) + "..." : description
  }
  getTitle(description) {
    return description.length > 10 ? description.substr(0, 10) + "..." : description
  }
  getgmailuser() {
    const message = `Please get authenticated with gmail account`;

    const dialogData = new ConfirmDialogModel("Confirm Action", message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "500px",
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      // this.result = dialogResult;
      console.log('dialogResultdialogResult', dialogResult);
      if (dialogResult) {
        this._ProfileService.getGoogleAuthenication().subscribe(res => {
          this.authentication_url = res.data
        })
      }
    })
  }

}
