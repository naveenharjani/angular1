import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { EmailFormComponent } from '../email-form/email-form.component';
import { BeehivePageHeaderModule } from '../beehive-page-header/beehive-page-header.module';
import { MaterialModule } from '../material.module';
import { MatSelectModule, MatDialogModule } from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
    declarations: [EmailFormComponent],
    imports: [BrowserModule, EditorModule, CommonModule, BeehivePageHeaderModule,
        MatSelectModule, MaterialModule, ReactiveFormsModule, FormsModule, MatDialogModule],
    providers: [],
    entryComponents: [EmailFormComponent],
    exports: [EmailFormComponent],
    bootstrap: [EmailFormComponent]
})
export class EmailFormModule {
}
