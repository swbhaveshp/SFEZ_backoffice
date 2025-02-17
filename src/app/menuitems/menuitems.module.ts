import { MenuitemsComponent} from './menuitems.component'
import { EditComponent} from './edit/edit.component'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
// import { SpinnerComponent } from '../shared/spinner.component';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { EcomRoutes } from './menuitems.routing';
import { TruncateStringPipe } from './truncate-string.pipe';
import { MaterialModule } from './material/material.module';

@NgModule({
  declarations: [
    MenuitemsComponent,
    EditComponent,
    TruncateStringPipe,
    // SpinnerComponent
  ],
  imports: [CommonModule,
    ToastrModule.forRoot(),
    SlimLoadingBarModule.forRoot(),
    MaterialModule,
     RouterModule.forChild(EcomRoutes), FormsModule, NgbModule],

})
export class MenuitemsModule { }
