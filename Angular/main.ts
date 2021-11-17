import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { LicenseManager } from "ag-grid-enterprise";
LicenseManager.setLicenseKey("Alliance_Bernstein__Instiutional_Research_5Devs5_June_2020__MTU5MTMxMTYwMDAwMA==d4e4d35bfff3b1207d624f0a6d695711");
if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
