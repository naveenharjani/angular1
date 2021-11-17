import { MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import { Component, Inject } from "@angular/core";


@Component({
    selector: 'save-query-dialog',
    templateUrl: 'save-query.component.html',
  })
  export class SaveQueryComponent {
    
    constructor(
      public dialogRef: MatDialogRef<SaveQueryComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
      }

      queryName : string = '';

    closeDialog(){
      console.log("save hit");
        this.dialogRef.close(this.queryName);
    }
    Validate(event:string){
       if(this.queryName.length<1)
        return false;
           
    }
  }