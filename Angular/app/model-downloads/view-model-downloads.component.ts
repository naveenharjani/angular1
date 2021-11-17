import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-model-downloads',
  templateUrl: './view-model-downloads.component.html',
  styleUrls: ['./view-model-downloads.component.css']
})
export class ViewModelDownloadsComponent implements OnInit {

  params: any;
  url: string = '';
  enableDetail: boolean;

  constructor() { }

  ngOnInit() {
  }

  agInit(params: any): void {
    this.params = params;
    this.enableDetail = this.params.colDef.cellRendererParams.enableDetail;
  }

  onClick() {
    this.params.context.componentParent.openLink(this.params.data);
  }

}
