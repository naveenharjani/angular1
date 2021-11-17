import { NgModule } from '@angular/core';
import 'ag-grid-enterprise';
import { AbGridComponent } from './ab-grid.component';
import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { BeehivePageHeaderModule } from '../beehive-page-header/beehive-page-header.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModelOptionComponent } from '../models/model-option/model-option.component';
import { CartOptionsComponent } from '../cart/cart-options/cart-options.component';

@NgModule({
    declarations: [AbGridComponent],
    imports: [CommonModule, AgGridModule.withComponents([
         ModelOptionComponent, CartOptionsComponent]), BeehivePageHeaderModule, MatProgressSpinnerModule],
    providers: [],
    entryComponents: [],
    exports: [AbGridComponent],
    bootstrap: [AbGridComponent]
})
export class AbGridModule {

}
