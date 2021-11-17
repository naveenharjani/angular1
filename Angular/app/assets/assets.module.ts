import { NgModule } from '@angular/core';
import { AbGridModule } from '../ab-grid/ab-grid.module';
import { CommonModule } from "@angular/common";
import { AgGridModule } from 'ag-grid-angular';
import {
    MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatButtonModule,
    MatRadioModule, MatCheckboxModule, MatProgressSpinnerModule, MatDialogModule, MatTooltipModule, MatDatepickerModule, MatDateFormats, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BeehiveCommonModule } from '../beehive-components.module';
import { BeehivePageHeaderModule } from '../beehive-page-header/beehive-page-header.module';
import { AssetsComponent } from './assets.component';
import { AssetsOptionComponent } from './assets-option/assets-option.component';
import { MaterialModule } from '../material.module';
import { AssetsFormComponent } from './assets-form/assets-form.component';
import { MatSelectSearchModule } from '../shared/mat-select-search/mat-select-search.module';
import { MatSelectSearchComponent } from '../shared/mat-select-search/mat-select-search.component';
import { ConfirmDialogModule } from '../shared/confirm-dialog/confirm-dialog.module';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
let materialInputs = [MatDialogModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule,
    MatButtonModule, MatRadioModule, MatCheckboxModule, MatProgressSpinnerModule, MatTooltipModule, MatDatepickerModule];

export const MY_FORMATS: MatDateFormats = {
    parse: {
        dateInput: 'MM-DD-YYYY',
    },
    display: {
        dateInput: 'MM-DD-YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@NgModule({
    declarations: [AssetsComponent, AssetsOptionComponent, AssetsFormComponent],
    imports: [AbGridModule, CommonModule, BeehiveCommonModule, BeehivePageHeaderModule, AgGridModule.withComponents([]), ReactiveFormsModule,
        ...materialInputs, MaterialModule, MatSelectSearchModule, ConfirmDialogModule, FormsModule],
    providers: [MatSelectSearchComponent,
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }],
    entryComponents: [AssetsOptionComponent, AssetsFormComponent, MatSelectSearchComponent],
    exports: [AssetsComponent],
    bootstrap: [AssetsComponent]
})
export class AssetsModule {

}
