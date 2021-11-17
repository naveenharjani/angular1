import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { AbGridModule } from '../ab-grid/ab-grid.module';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule, MatDatepickerModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatButtonModule } from '@angular/material';
import { BeehivePageHeaderModule } from '../beehive-page-header/beehive-page-header.module';
import { BeehiveCommonModule } from '../beehive-components.module';
import { ContentUsageComponent } from './content-usage.component';

const materialsModule = [MatDatepickerModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule,
    MatButtonModule, MatProgressSpinnerModule];

@NgModule({
    declarations: [ContentUsageComponent],
    imports: [AbGridModule, CommonModule, BeehiveCommonModule, AgGridModule.withComponents([]), BeehivePageHeaderModule, ...materialsModule, FormsModule, ReactiveFormsModule],
    providers: [],
    entryComponents: [ContentUsageComponent],
    exports: [ContentUsageComponent],
    bootstrap: [ContentUsageComponent]
})
export class ContentUsageModule {

}