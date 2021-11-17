import { NgModule } from '@angular/core';
import { BeehivePageHeaderComponent } from './beehive-page-header.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDividerModule } from '@angular/material';
import { DataService } from '../shared/data.service';

@NgModule({
    declarations: [BeehivePageHeaderComponent],
    imports: [CommonModule, MatButtonModule, MatDividerModule],
    providers: [DataService],
    entryComponents: [BeehivePageHeaderComponent],
    exports: [BeehivePageHeaderComponent],
    bootstrap: [BeehivePageHeaderComponent]
})
export class BeehivePageHeaderModule {

}
