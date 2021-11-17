import { NgModule } from '@angular/core';
import { AdminIndustriesGridComponent } from './admin-industries-grid.component';
import { AbGridModule } from '../ab-grid/ab-grid.module';
import { CommonModule } from "@angular/common";
import { AgGridModule } from 'ag-grid-angular';
import {
    MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatButtonModule,
    MatRadioModule, MatCheckboxModule, MatProgressSpinnerModule
} from '@angular/material';
import { IndustryFormComponent } from './industry-form/industry-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BeehiveCommonModule } from '../beehive-components.module';
import { BeehivePageHeaderModule } from '../beehive-page-header/beehive-page-header.module';
import { IndustryFormNewComponent } from './industry-form-new/industry-form-new.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { FormsModule } from '@angular/forms';
let materialInputs = [MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule,
    MatButtonModule, MatRadioModule, MatCheckboxModule, BeehiveCommonModule, BeehivePageHeaderModule, MatProgressSpinnerModule];

@NgModule({
    declarations: [AdminIndustriesGridComponent, IndustryFormComponent, IndustryFormNewComponent],
    imports: [AbGridModule, CommonModule, AgGridModule.withComponents([]), ReactiveFormsModule,FormsModule, CommonModule, ...materialInputs,NgSelectModule,NgOptionHighlightModule],
    providers: [],
    entryComponents: [IndustryFormComponent,IndustryFormNewComponent],
    exports: [AdminIndustriesGridComponent],
    bootstrap: [AdminIndustriesGridComponent]
})
export class AdminModule {

}
