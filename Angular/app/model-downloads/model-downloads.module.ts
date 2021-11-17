import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from "@angular/common";
import { AbGridModule } from '../ab-grid/ab-grid.module';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatProgressSpinnerModule, MatDatepickerModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatButtonModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter, MatDateFormats
} from '@angular/material';
import { BeehivePageHeaderModule } from '../beehive-page-header/beehive-page-header.module';
import { ModelDownloadsComponent } from './model-downloads.component';
import { BeehiveCommonModule } from '../beehive-components.module';
import { ViewModelDownloadsComponent } from './view-model-downloads/view-model-downloads.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

const materialsModule = [MatDatepickerModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule,
    MatButtonModule, MatProgressSpinnerModule];

export const MY_FORMATS: MatDateFormats = {
    parse: {
        dateInput: 'MM-DD-YYYY',
    },
    display: {
        dateInput: 'MM-DD-YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'DD-MM-YYYY',
        monthYearA11yLabel: 'MM YYYY',
    },
};

@NgModule({
    declarations: [ModelDownloadsComponent, ViewModelDownloadsComponent],
    imports: [AbGridModule, CommonModule, BeehiveCommonModule, AgGridModule.withComponents([]), BeehivePageHeaderModule, ...materialsModule, FormsModule, ReactiveFormsModule],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ],
    entryComponents: [ModelDownloadsComponent, ViewModelDownloadsComponent],
    exports: [ModelDownloadsComponent],
    bootstrap: [ModelDownloadsComponent]
})
export class ModelDownloadsModule {

}