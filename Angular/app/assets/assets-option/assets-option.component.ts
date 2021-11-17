import { Component, OnInit } from '@angular/core';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';
import { ConfirmDialogModel } from '../../shared/confirm-dialog/confirm-dialog.model';
import { EnvService } from '../../../env.service';

@Component({
  selector: 'app-assets-option',
  templateUrl: './assets-option.component.html',
  styleUrls: ['./assets-option.component.css']
})
export class AssetsOptionComponent implements OnInit {

  params: any;
  AllowEdit: boolean;
  AllowExpire: boolean;
  AllowResetExpire: boolean;
  button: string;

  constructor(public dialog: MatDialog, private environment: EnvService) { }

  ngOnInit() {
  }

  agInit(params: any): void {
    this.AllowEdit = (params.data.AllowEdit === 'true' ? true : false);
    this.AllowEdit ? this.button = 'Edit' : this.button = 'Detail';
    this.AllowExpire = (params.data.AllowExpire === 'true' ? true : false);
    this.AllowResetExpire = (params.data.AllowResetExpire === 'true' ? true : false);
    this.params = params;
  }

  uploadAsset() {
    this.params.context.componentParent.uploadAsset(this.params.data);
  }

  expireAsset() {
    this.params.context.componentParent.expireAsset(this.params.data);
  }

  resetExpire() {
    this.params.context.componentParent.resetExpire(this.params.data);
  }

  email() {
    let url = '/research/email.aspx?type=asset&id=' + this.params.data.LinkId;
    window.open(url.toString(), 'FORM', 'left=50,top=50,width=1000,height=750,menubar=no,toolbar=no,location=no,directories=no,status=yes,resizable=yes,scrollbars=yes', true);
    return false;
  }

  confirmDialog(): void {
    const message = this.environment.AssetsConfirmMessage;

    if (confirm(this.environment.AssetsConfirmMessage)) {
      this.expireAsset();
    } else {
      console.log('Dialog CLosed.');
    }

    // const dialogData = new ConfirmDialogModel("Expire Content", message);

    // const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    //   width: "200px",
    //   data: dialogData,
    //   //hasBackdrop: false
    // });

    // dialogRef.afterClosed().subscribe(dialogResult => {
    //   if (dialogResult) {
    //     this.expireAsset();
    //   };
    // });
  }
}
