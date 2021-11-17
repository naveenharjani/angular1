import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { DataGridComponent } from './data-grid.component';
import { MatDatepickerModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule } from '@angular/material';
import { AbGridModule } from '../ab-grid/ab-grid.module';
import { BeehiveCommonModule } from '../beehive-components.module';
import { AgGridModule } from 'ag-grid-angular';
import { BeehivePageHeaderModule } from '../beehive-page-header/beehive-page-header.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const materialsModule = [MatDatepickerModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule,
    MatButtonModule, MatProgressSpinnerModule];

@NgModule({
    declarations: [DataGridComponent],
    imports: [CommonModule, AbGridModule, CommonModule, BeehiveCommonModule, AgGridModule.withComponents([]), BeehivePageHeaderModule, ...materialsModule, FormsModule, ReactiveFormsModule],
    providers: [],
    entryComponents: [DataGridComponent],
    exports: [DataGridComponent],
    bootstrap: [DataGridComponent]
})
export class DataGridModule {

}
