
import { environment } from './environments/environment';

export class EnvService {

  // The values that are defined here are the default values that can
  // be overridden by env.js

  app = environment.app;

  integratedBaseUrl = environment.integratedBaseUrl;
  baseUrl = environment.baseUrl;
  autoCompleteUrl = environment.autoCompleteUrl;
  gridUrl = environment.gridUrl;
  bernsteinLogo = environment.bernsteinLogo;
  tickerSearchUrl = environment.tickerSearchUrl;
  analystSearchUrl = environment.analystSearchUrl;
  freeTextSearchUrl = environment.freeTextSearchUrl;
  financialsSearchUrl = environment.financialsSearchUrl;
  chartSearchUrl = environment.chartSearchUrl;
  modelSearchUrl = environment.modelSearchUrl;
  textSearchEnabled = environment.textSearchEnabled;
  advancedSearchFields = environment.advancedSearchFields;
  researchscreen=environment.researchscreen;

  menuItems = environment.menuItems;
  showTypeaheadContent = environment.showTypeaheadContent;
  gridFilters = environment.gridFilters;
  cartAttachmentsUrl = environment.cartAttachmentsUrl;
  cartUrl = environment.cartUrl;
  AssetsConfirmMessage = environment.AssetsConfirmMessage;
  AssetsExpiryDays = environment.AssetsExpiryDays;
  AssetsValidationMessage = environment.AssetsValidationMessage;
  SiteUrl = environment.SiteUrl;
  DownloadsFromDays = environment.DownloadsFromDays;
  UsageFromDays = environment.UsageFromDays;
  applicationId=environment.applicationId;
  secretKey=environment.secretKey;  
  menuLocation = environment.menuLocation;
  constructor() {
  }


}