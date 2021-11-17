import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DataService } from '../shared/data.service';
import { ICellRendererAngularComp } from "ag-grid-angular";
import { Observable } from 'rxjs';
import { MdePopoverTrigger } from '@material-extended/mde'

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css']
})
export class TooltipComponent implements ICellRendererAngularComp {

  @Input() Model: any;
  tooltip: any;
  @ViewChild(MdePopoverTrigger) trigger: MdePopoverTrigger;
  ReportFileName: any;
  constructor(private dataService: DataService) { }


  agInit(params: any) {
    this.Model = params.data;
  }

  refresh(params: any) {
    return false;
  }

  getModelToolTip() {
    this.ReportFileName = this.Model.ReportFileName;
    this.dataService.getToolTip(this.Model.ModelId).subscribe(
      data => {
        this.tooltip = data[0];
        this.trigger.togglePopover();
      }
    );
  }

  show(now, prior) {
    if (now == null || prior == null)
      return false;
    else {
      return parseFloat(now.replace(/,/g, '').replace('(', '-').replace(')', '')) > parseFloat(prior.replace(/,/g, '').replace('(', '-').replace(')', ''));
    }
  }

  openToolTip() {
    this.getModelToolTip();
    // popover.open();
  }

  closeToolTip() {
    this.trigger.togglePopover();
  }

  openPub() {
    let url = '\\research\\view.aspx?doc=' + this.ReportFileName;
    window.open(url, 'FORM', 'width=800,height=600,left=50,top=25,menubar=no,toolbar=no,location=no,directories=no,status=yes,resizable=yes,scrollbars=yes');
    this.tooltip = undefined;
    return false;
  }




}
