import { Observable } from 'rxjs/Rx';
import { map, startWith } from 'rxjs/operators';
import { Component, ViewChild, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { CommonFunctionsService } from '../../services/commonFunctions.service';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from "@angular/router";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component';
import { forkJoin } from 'rxjs';

declare var require: any;
const data: any = require('./company.json');
@Component({
  selector: 'app-foodparks',
  templateUrl: './foodparks.component.html',
  styleUrls: ['./foodparks.css']
})
export class FoodParkComponent implements OnInit{
  editing = {};
  rows = [];
  temp = [...data];
  drivertemp = [...data];
  managertemp = [...data];
  bgColor = 'rgba(0,0,0,0.5)'; // overlay background color
  confirmHeading = '';
  confirmContent = "Are you sure want to delete tsddshis?";
  confirmCanceltext = "Cancel";
  confirmOkaytext = "Okay";
  minDaysValue=10;
  singleTerritory: any[] = [];
  territory: any[] = [];
  states: any[] = [];
  countries: any[] = [];
  selectArry: any[] = [];
  drivers: any[] = [];
  foodparkmgrList: any[] = [];
  setManager: any[] = [];
  setdriverManager: any[] = [];
  companyId : any;
  user: any;
  selectedHub: any;
  loadingIndicator = true;
  reorderable = true;
  closeResult: string;
  columns = [{ name: 'Name' }, { prop: 'country' }, { name: 'State' }, { name: 'City' }];
  driverForm: FormGroup;
  managerForm: FormGroup;
  managerRole: string = 'FOODPARKMGR';
  lat = -34.397;
  lng = 150.644;
  latA = -34.754764;
  lngA = 149.736246;
  zoom = 8;
  huborlocation: boolean = false;
  showManagerTab: boolean = false;
  allManager: any[] = [];
  allUnitList: any[] = [];
  type: any[]= [];
  types = [
    "RESTAURANT",
    "Cafe",
    "BEER",
    "WINE",
    "FOOD TRUCK",
    "PIZZA",
    "FARMER",
    "CHEF",
    "GHOST KITCHEN"
    ];

    foodParkForm: FormGroup;

    hubFoodParkForm = new FormGroup({
    state_id: new FormControl('', Validators.required),
    territory_id: new FormControl(),
    name: new FormControl('', [Validators.required])
    });

  locationFoodParkForm = new FormGroup({
    country_id: new FormControl('', Validators.required),
    state_id: new FormControl('', Validators.required),
    territory_id: new FormControl(),
    name: new FormControl('', [Validators.required]),
    type: new FormControl(' ', Validators.required)
  });
  filteredStateOptions: Observable<string[]>;

  hubData = [
    {
      "name": "KLM",
      "manager": "Manger Name",
      "deliveryIcon": true,
      "codIcon": true,
      "takeoutIcon": true,
    },
    {
      "name": "PQR",
      "manager": "Manger Name",
      "deliveryIcon": true,
      "codIcon": true,
      "takeoutIcon": true,
    }
  ];
  registerVendor: any[] = [
    {
      name: "Vendor name",
      manager: "Manager name",
    }
  ];
  driverData: any
  // driverData = [
  //   {
  //     "name": "Kid Rock",
  //     "phone": "480-921-8847",
  //   }
  // ];
  registerDriver = [
    {
      "name": "Jimmy Hendricks",
      "phone": "541-439-0134",
    }
  ];

  

  @ViewChild(FoodParkComponent, { static: false }) table: FoodParkComponent;
  UnitList: any;
  locations: any;
  deliveryHub: any;
  deliveryHubUnits: any;

  constructor(private _ProfileService: ProfileService,
    private toastr: ToastrService,
    private router: Router,
    public dialog: MatDialog,
    private _CommonFunctionsService: CommonFunctionsService,
    private modalService: NgbModal,
    private route: ActivatedRoute) {
    this.user = this._CommonFunctionsService.checkUser().user;
    this.getAllState();
    this.getAllTerritory();
    this.getAllCountries();
    this.getAllFoodPark();
    this.formInit();
    this.driverformInit();
    this.managerFormInit();
    this.getallfoodparkmgr();
    this.getAllUnitList();
    this.getAllUnitWithFoodParkId();
    this.getAllDriversWithFoodParkId();
    this.getlocationOnTerritoryId()
    this.getlocationsAndHub()
    this.gethubswithterriId()
    if (this.user.role == 'FOODPARKMGR' || this.user.role == 'OWNER') {
      this.showManagerTab = true;
    }
    this.getAllManger();
    
    // this.rows = data;
    // this.temp = [...data];
    // setTimeout(() => {
    //   this.loadingIndicator = false;
    // }, 1500);
    this.getSingleTerritory();
  }

  ngOnInit() {
    // this.filteredStateOptions = this.myControl.valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => this._filter(value))
    //   );
  }

  // private _filter(value: string): string[] {
  //   const filterValue = value.toLowerCase();

  //   return this.states.filter(option => option.toLowerCase().includes(filterValue));
  // }

  formInit() {
    this.foodParkForm = new FormGroup({
      name: new FormControl(null),
      territory_id: new FormControl(null),
      latitude: new FormControl(null),
      longitude: new FormControl(null),
      
    });
  }
  driverformInit() {
    this.driverForm = new FormGroup({
      first_name: new FormControl(null),
      hub_id: new FormControl(null),
      territory_id: new FormControl(null),
      last_name: new FormControl(null),
      password: new FormControl(null),
      email: new FormControl(null),
      phone: new FormControl(null),
    });
  }
  managerFormInit() {
    this.managerForm = new FormGroup({
      first_name: new FormControl(null),
      last_name: new FormControl(null),
      username: new FormControl(null),
      password: new FormControl(null),
      unitId: new FormControl(null),
      territory_id: new FormControl(null)
    });
  }
  onCheckboxChangeFn(event, row) {
    this.router.navigateByUrl('/forms/foodparks/' + row.id)
  }
  placeMarker($event) {
    this.lat = $event.coords.lat;
    this.lng = $event.coords.lng;
    this.foodParkForm.value.latitude = this.lat;
    this.foodParkForm.value.longitude = this.lng;
  }

  /** select hub or location */
  selectHubOrLoc(event) {
    if (event.target.value == "Hub") {
      this.huborlocation = false;
      this.managerRole = "FOODPARKMGR";
    } else {
      this.huborlocation = true;
      this.managerRole = "UNITMGR";
    }
  }

  /** end */

  /** get all unit list */
  getAllUnitList() {
    this._ProfileService.getAllUnitListData().subscribe(
      (response: any) => {
        console.log('allunit list', response.data)
        this.allUnitList = response.data;
      },
      (error) => {
        console.log(error);
      }
    )
  }
  /** end */

  getAllUnitWithFoodParkId() {
    console.log('this.useris', this.user);

    if (this.user.food_park_id) {
      this._ProfileService.getAllUnitsListWithFoodParkId(this.user.food_park_id).subscribe(
        (response: any) => {
          console.log('uints per foodparid list', response.data)
          this.UnitList = response.data;
        },
        (error) => {
          console.log(error);
        }
      )
    }
  }

  getAllDriversWithFoodParkId() {

    if (this.user.food_park_id) {
      this._ProfileService.getAllDriversListWithFoodParkId(this.user.food_park_id).subscribe(
        (response: any) => {
          console.log('DrvierData per foodparid list', response.data)
          this.driverData = response.data;
        },
        (error) => {
          console.log(error);
        }
      )
    }
  }
  // formatLabel(value: number) {
  //   if (value >= 1000) {
  //     return Math.round(value / 1000) + 'k';
  //   }

  //   return value;
  // }

getlocationOnTerritoryId(){
  if(this.user.territory_id){
    this._ProfileService.getLocationswithTerriID(this.user.territory_id).subscribe(res=>{
      if(res.status==200){
    console.log('thisssss locations',res.data)
    this.locations=res.data
      }else{
        console.log("operation Failed ")
      }
    })
  }

}

gethubswithterriId(){
  if(this.user.territory_id){
    this._ProfileService.getHubwithTerriID(this.user.territory_id).subscribe(res=>{
      if(res.status==200){
        console.log('thisssss deliveryHub',res.data)
    this.deliveryHub=res.data
      }else{
        
      }
    })
  }
}
addVendor(foodParkId,unitId){
const data={
  unit_id:unitId
}

this._ProfileService.addUnitToHub(foodParkId,data).subscribe(res=>{
  console.log(res,'resssssssssssssssssssssss')
  if(res["status"]==200){
    this.toastr.success("Vendor added to hub")
    // this.getlocationOnTerritoryId()
    this.getlocationsAndHub()
    // this.gethubswithterriId()
  }else{
    this.toastr.success("Error Vendor adding to hub")

  }
})
  

}

getlocationsAndHub(){
  if(this.user.territory_id){
    this._ProfileService.getHubwithUnits(this.user.territory_id).subscribe(res=>{
      if(res.status==200){
        console.log('thisssss deliveryHubUnits',res.data)
        this.deliveryHubUnits=res.data
      }else{
        
      }
    })
  }

}





  removeUnit(unitId,foodparkId) {

    const message = `Are you sure you want to do this?`;

    const dialogData = new ConfirmDialogModel("Confirm Action", message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "500px",
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      // this.result = dialogResult;
      console.log('dialogResultdialogResult', dialogResult);
      if (dialogResult) {
          let unit_data = {
            foodparkId:foodparkId,
            unitId: unitId
          }
          this._ProfileService.deleteUnitsListWithFoodParkId(unit_data).subscribe(
            (response: any) => {
              console.log('Remove dataaa', response)
              // this.UnitList = response.data;
              // this.getAllUnitWithFoodParkId()
              this.toastr.success(response.message)
              // this.getlocationOnTerritoryId()
              this.getlocationsAndHub()
              // this.gethubswithterriId()
            },
            (error) => {
              console.log(error);
              this.toastr.error(error)

            }
          )
          }
    });


  }
  deleteLocation(unitId){
    const message = `Are you sure you want to do this?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "500px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      // this.result = dialogResult;
      console.log('dialogResultdialogResult', dialogResult);
      if (dialogResult) {
        if (this.user.food_park_id) {
          let unit_data = {
            foodparkId: this.user.food_park_id,
            unitId: unitId
          }
          return
          this._ProfileService.deleteUnitsListWithFoodParkId(unit_data).subscribe(
            (response: any) => {
              console.log('Remove dataaa', response)
              // this.UnitList = response.data;
              this.getAllUnitWithFoodParkId()
              this.toastr.error(response.message)

            },
            (error) => {
              console.log(error);
              this.toastr.error(error)

            }
          )
        }
      } else {
        // this.toastr.error('Please select the hub and manager')

      }
    });
  }

  removeDriver(userId) {

    const message = `Are you sure you want to do this?`;

    const dialogData = new ConfirmDialogModel("Confirm Action", message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "500px",
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      // this.result = dialogResult;
      console.log('dialogResultdialogResult', dialogResult);
      if (dialogResult) {
        if (this.user.food_park_id && userId) {
          let unit_data = {
            foodparkId: this.user.food_park_id,
            userId: userId
          }
          this._ProfileService.deleteDriversWithFoodParkId(unit_data).subscribe(
            (response: any) => {
              console.log('Remove dataaa', response)
              // this.UnitList = response.data;
              this.getAllDriversWithFoodParkId()
            },
            (error) => {
              console.log(error);
            }
          )
        }
      }
    })
  
  }
  getallfoodparkmgr() {
    this._ProfileService.getallfoodparkmgr().subscribe((res: any) => {
      this.foodparkmgrList = res.data;
    })
  }
  selectHub(event, row, value) {
    this.setManager.push({ manager_id: row.id, hub_id: event.target.value });
  }

  selectdriverHub(event, row, value) {
    this.setdriverManager.push({ driver_id: row.id, hub_id: event.target.value });
  }

  getAllTerritory() {
    // var obj = {
    //   country_id: event.target.value
    // }
    // this._ProfileService.getAllTerritory(obj).subscribe((res: any) => {
    //   console.log(res);
    //   this.territory = res;
    // })
  }

  getTerritory(event) {
    const state_id = event.target.value;
    this._ProfileService.getTerritory(state_id).subscribe((res: any) => {
      console.log(res);
      this.singleTerritory = res;
    })
  }

  getAllState() {
    var obj = {
      stateSearch: ""
    }
    this._ProfileService.getAllState(obj).subscribe((res: any) => {
      this.states = res;
    })
  }
  getAllCountries() {
    this._ProfileService.getAllCountries().subscribe((res: any) => {
      this.countries = res;
    })
  }
  
  getAllFoodPark() {
    // forkJoin([
    //   this._ProfileService.getAllFoodPark(),
    //   this._ProfileService.getAllUnitListData()
    // ]).subscribe(
    //   ([allFoodParkResponse, allUnitListResponse]) => {
    //     // const tempArray = [allFoodParkResponse.data, ...allUnitListResponse.data]
    //     allFoodParkResponse.filter((value)=>{
    //       this.selectArry.push({name:value.name})
    //     })
    //     allUnitListResponse.data.filter((value)=>{
    //       this.selectArry.push({name:value.name})
    //     })
    //     console.log(' this.selectArry', this.selectArry) 
    //   })
    
  
    // this._ProfileService.getHubwithTerriID(this.user.territory_id).subscribe((res: any) => {
    //   // this.selectArry = res;
    //   res.filter((value)=>{
    //           this.selectArry.push({name:value.name})
    //         })
    // })
    // this._ProfileService.getAllUnitListData().subscribe((res: any) => {
    //   this.selectArry = res;
    // })


    // this.user = this._CommonFunctionsService.checkUser().user;
    // this._ProfileService.getAllFoodPark().subscribe((res: any) => {
      // this.territory = res;
      // this.rows = res;

      // console.log('this.rows', res);

      // this.temp = [...this.rows];
      // this.selectedHub = parseInt(res[0].id);
      // console.log(' this.drivertemp', this.selectedHub);

      // this.getAllDrivers(res[0].id)


      // select in manager tab
      // this.temp.filter((value,index)=>{
      //   this.selectArry.push({name:value.name})
      // })
      
     
    // })
  }

  foodParkSFormSaveData(data) {
    console.log("Ash" + data);
  }

  getAllDrivers(foodParkId) {
    this._ProfileService.getAllDrivers(foodParkId).subscribe((res: any) => {
      this.drivers = res.data;
      // this.rows = this.drivers;
      this.drivertemp = [...this.drivers];
      console.log(' this.drivertemp', this.drivertemp);

    })
  }

  setManagers() {
    if (this.setManager.length > 0) {
      this._ProfileService.setManagers({ list: this.setManager }).subscribe((res: any) => {
        this.toastr.success('Managers assign successfully');
        // 
      },
        error => {
          this.toastr.error(error.error.message)
        })
    } else {
      this.toastr.error('Please select the hub and manager')
    }
  }
  changeselectHub(event) {
    this.selectedHub = parseInt(event.target.value);
    this.getAllDrivers(event.target.value);
  }
  setDriverManagers() {
    if (this.setdriverManager.length > 0) {
      this._ProfileService.setDriverManagers({ list: this.setdriverManager }).subscribe((res: any) => {
        this.toastr.success('Driver assign successfully');
        // 
      },
        error => {
          this.toastr.error(error.error.message)
        })
    } else {
      this.toastr.error('Please select the hub and driver')
    }
  }

  onSubmitLocationForm() {
    // this.locationFoodParkForm.value.latitude = 12.032;
    // this.locationFoodParkForm.value.longitude = 12.032;
    // this.locationFoodParkForm.value.territory_id = this.user.territory_id;
    this._ProfileService.addUnit(this.locationFoodParkForm.value, this.user.company_id).subscribe((res: any) => {
      this.toastr.success('Territory Created successfully');
      document.getElementById("closeModal").click();
      this.getAllFoodPark();
      
    },
      error => {
        this.toastr.error(error.error.message);
      })
  }
  
  onSubmit() {
    this.foodParkForm.value.latitude = 12.032;
    this.foodParkForm.value.longitude = 12.032;
    
    this._ProfileService.addFoodPark(this.foodParkForm.value).subscribe((res: any) => {
      this.toastr.success('Territory Created successfully');
      document.getElementById("closeModal").click();
      this.getAllFoodPark();
     
      
    },
      error => {
        this.toastr.error(error.error.message)
      })
  }

  onDriverSubmit() {
    this.driverForm.value.role = 'DRIVER';
    this._ProfileService.addDriver(this.driverForm.value).subscribe((res: any) => {
      if (res.status == 200) {
        this.toastr.success('Driver Created successfully');
        document.getElementById("closeModal").click();
        this.getAllFoodPark();
      } else {
        this.toastr.error(res.message)
      }
    },
      error => {
        this.toastr.error(error.error.message)
      })
  }

  /** manager tab*/
  territoryName: any;
  getSingleTerritory() {
    this._ProfileService.getSingleTerritory(this.user.territory_id).subscribe(
      (territoryResponse) => {
        this.territoryName = territoryResponse.territory;
      },
      (error) => {
        console.log(error);
      }
    )
  }
  getAllManger() {
    let data = {
      "managerId": this.user.manager_id,
      "user_id": this.user.id
    }

    this._ProfileService.getAllManager(data).subscribe((res: any) => {
      if (res.status == 200) {
        this.allManager = res.data;
        this.managertemp = [...this.allManager];
      } else {
        this.toastr.error(res.message)
      }
    },
      error => {
        //this.toastr.error(error.error.message)
      })
  }
  editDeliveryHub(){

  }
  formatLabel1(value: number) {
    console.log('value',value);
    
    // if (value <= 15) {
    //   return (value*4.25);
    // }

    return '$'+value*4.25;
  }
  formatLabel2(value: number) {
    console.log('value',value);
   
    return '$'+value*7;
  }
  formatLabel3(value: number) {
    console.log('value',value);
    
 

    return '$'+value;
  }



  onManagerSubmit() {
    this.managerForm.value.manager_id = this.user.manager_id;
    this.managerForm.value.food_park_id = this.user.food_park_id;

    if (this.managerForm.value.unitId == null) {
      console.log('if');
      this.managerForm.value.territory_id = this.user.territory_id;
      delete this.managerForm.value.unitId;
    } else {
      console.log('else');
      delete this.managerForm.value.territory_id;
      delete this.managerForm.value.food_park_id;
    }
    // return console.log('ggggggggggggggggggggggg',this.managerForm.value);
    this._ProfileService.addManagers(this.managerForm.value).subscribe((res: any) => {
      if (res.status == 200) {
        this.toastr.success('Manager created successfully');
        this.toastr.success('Email sent successfully');
        this.huborlocation = false;
        document.getElementById("closeModal").click();
        this.getAllManger();
      } else {
        this.toastr.error(res.message)
      }
    },
      error => {
        this.toastr.error(error.error.message)
      })

    this.managerForm.reset();
  }
  selectLocationOrHub(event,row,value){
console.log(event,row,value,'event,row,value')

    
  }
  deleteManager($event, row) {
    console.log(row);
    let data;
    if (row?.unit?.id) {
      console.log('if');
      data = {
        "user_id": row.id,
        "unit_id": row.unit.id
      }
    } else {
      console.log('else');
      data = {
        "user_id": row.id,
        "food_park_id": this.user.food_park_id
      }
    }
    this._ProfileService.deleteManager(data).subscribe(
      (response) => {
        if (response.status == 200) {
          this.toastr.success('Manager deleted successfull');
          this.getAllManger();
        }
      },
      (error) => {
        this.toastr.error(error.error.message);
      }
    )
  }
  /** end */
  open1(content1) {
    this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openDriver(content2) {
    this.modalService.open(content2, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openManager(content3) {
    this.modalService.open(content3, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openLocations(content4) {
    this.modalService.open(content4, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  openEditLocations(content4) {
    this.modalService.open(content4, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  openEditDeilveryHub(content4) {
    this.modalService.open(content4, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  onSelectRed(item) {
    debugger
  }

 

  updateDriverFilter(event) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const drivertemp = this.drivertemp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.drivers = drivertemp;
    // Whenever the filter changes, always go back to the first page
    this.table = data;
  }

  updateManagerFilter(event) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const managertemp = this.allManager.filter(function (d) {
      return d.first_name.toLowerCase().indexOf(val) !== -1 || d.last_name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.allManager = managertemp;
    // Whenever the filter changes, always go back to the first page
    this.table = data;
  }


  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table = data;
  }

  updateValue(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
    console.log('UPDATED!', this.rows[rowIndex][cell]);
  }

  viewManager(event,row,type){
    this.router.navigateByUrl('/forms/manager/'+row.id+"/"+type);
  }

  sendEmail(event,row,type){
    // this.router.navigateByUrl('/forms/manager/'+row.id+"/"+type);
  }

  onLocationEditSubmit(){
    
  }
}
