import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from '../../shared/data.service';
import { BeehiveCookiesService } from '../../shared/cookies.service';
import { ReplaySubject } from 'rxjs';
import { CalendarUtility } from '../../shared/calendar-utility';
import { DatePipe } from '@angular/common';
import { Role } from '../../beehive-page-header/permissions.enums';
import { EnvService } from '../../../env.service';

@Component({
  selector: 'app-assets-form',
  templateUrl: './assets-form.component.html',
  styleUrls: ['./assets-form.component.css']
})
export class AssetsFormComponent implements OnInit {

  buttonList: { text: string; }[];
  pageName: string = 'MANAGE CONTENT / LINK EDITOR';
  assetsForm: FormGroup;
  ownerList: any = [];
  types: any = [];
  filename: string = null;
  Industries: any = [];
  Tickers: any = [];
  Analysts: any = [];
  filteredIndustries: ReplaySubject<[]> = new ReplaySubject<[]>();
  filteredTickers: ReplaySubject<[]> = new ReplaySubject<[]>();
  filteredAnalysts: ReplaySubject<[]> = new ReplaySubject<[]>();
  formData = new FormData();
  showBrightCove: boolean = false;
  fileTypeOnly = '';
  fileSize: any = 0;
  dataLoading: boolean = false;
  selectedAnalysts: any[];
  selectedIndustries: any[];
  selectedTickers: any[];
  ableToEdit: boolean;
  calendarUtility: CalendarUtility = new CalendarUtility();
  isManager: Boolean;
  minDate: Date = new Date(new Date().getFullYear() - 0, new Date().getMonth(), new Date().getDate() + 1);

  constructor(public dialogRef: MatDialogRef<AssetsFormComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private cookiesService: BeehiveCookiesService,
    private formBuilder: FormBuilder, private dataService: DataService, private snackBar: MatSnackBar, private datePipe: DatePipe, private environment: EnvService) { }

  ngOnInit() {
    this.createForm();
    this.dataLoading = true;
    let createNewLink = this.data && this.data.createNewLink;
    if (createNewLink) {
      this.buttonList = [{ text: 'Close' }, { text: 'Save' }];
      this.ableToEdit = true;
    }
    else {
      this.ableToEdit = this.data && this.data.asset && (this.data.asset.AllowEdit === 'true' ? true : false);
      this.ableToEdit ? (this.buttonList = [{ text: 'Close' }, { text: 'Save' }]) : (this.buttonList = [{ text: 'Close' }]);
    }
    setTimeout(() => {
      this.fetchFormData();
    }, 0)

    this.assetsForm.controls['Analysts'].valueChanges.subscribe((data: any) => {
      this.selectedAnalysts = data;
    });

    this.assetsForm.controls['Industries'].valueChanges.subscribe((data: any) => {
      this.selectedIndustries = data;
    });

    this.assetsForm.controls['Tickers'].valueChanges.subscribe((data: any) => {
      this.selectedTickers = data;
    });

    this.assetsForm.controls['searchTickers'].valueChanges.subscribe((data: any) => {
      let search = data;
      if (!search) {
        this.filteredTickers.next(this.Tickers.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the Tickers
      this.filteredTickers.next(
        this.Tickers.filter((item: any) => item['Display'].toLowerCase().indexOf(search) > -1)
      );
    });

    this.assetsForm.controls['searchIndustries'].valueChanges.subscribe((data: any) => {
      let search = data;
      if (!search) {
        this.filteredIndustries.next(this.Industries.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the Industries
      this.filteredIndustries.next(
        this.Industries.filter((item: any) => item['Display'].toLowerCase().indexOf(search) > -1)
      );
    });

    this.assetsForm.controls['searchAnalysts'].valueChanges.subscribe((data: any) => {
      let search = data;
      if (!search) {
        this.filteredAnalysts.next(this.Analysts.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the Tickers
      this.filteredAnalysts.next(
        this.Analysts.filter((item: any) => item['Display'].toLowerCase().indexOf(search) > -1)
      );
    });

  }

  close(event: any) {
    this.dialogRef.close(event);
    this.dataLoading = false;
  }

  onButtonClick(text: any) {
    if (text === 'close') {
      this.close({ event: 'Close' });
    }
    if (text === 'save') {
      this.uploadAsset();
    }
  }

  createForm() {
    this.assetsForm = this.formBuilder.group({
      owner: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required),
      FileUpload: new FormControl(''),
      Analysts: new FormControl(''),
      Industries: new FormControl(''),
      Tickers: new FormControl(''),
      searchIndustries: new FormControl(''),
      searchTickers: new FormControl(''),
      searchAnalysts: new FormControl(''),
      brightcove: new FormControl(''),
      ExpiryDate: new FormControl('', Validators.required)
    });
    if (this.data && this.data.asset && this.data.asset.AnalystId) {
      this.assetsForm.controls['owner'].disable();
    }
    this.dataService.IsInRole(Role.deManager).subscribe((val) => {
      if (val) {
        this.isManager = true;
        this.assetsForm.controls['ExpiryDate'].enable();
      }
      else {
        this.isManager = false;
        this.assetsForm.controls['ExpiryDate'].disable();
      }
    });
    this.setExpiryDate();
  }

  patchData() {
    let AssetId = this.data && this.data.asset && this.data.asset.AssetId;
    let LinkId = this.data && this.data.asset && this.data.asset.LinkId;
    if (AssetId && LinkId) {
      this.dataService.getAsset(AssetId).subscribe((data: any) => {
        if (this.ownerList.filter((owner: any) => owner.Value === data.AnalystId).length === 0) {
          this.ownerList.push({
            Display: data.Owner,
            Value: data.AnalystId
          });
        }
        this.assetsForm && this.assetsForm.patchValue({
          type: data.AssetTypeId,
          title: data.Title,
          brightcove: data.FileName,
          owner: data.AnalystId,
          ExpiryDate: new Date(this.data.asset.ExpiryDate)
        });
        this.assetsForm.controls['type'].disable();
        this.showBrightCove = (this.types.find((data: any) => data.Value === this.assetsForm.controls['type'].value).AssetLocation === 'BRIGHTCOVE');
        this.setFileType();
        if (this.ableToEdit) {
          if (data.Industries && data.Industries.length > 0) {
            this.assetsForm && this.assetsForm.controls['Industries'].setValue(this.Industries.filter(function (Industries: any) {
              return data.Industries.filter(function (industries: any) {
                return industries.Value == Industries.Value;
              }).length > 0
            }));
          }
          if (data.Analysts && data.Analysts.length > 0) {
            this.assetsForm && this.assetsForm.controls['Analysts'].setValue(this.Analysts.filter(function (Analysts: any) {
              return data.Analysts.filter(function (analysts: any) {
                return analysts.Value == Analysts.Value;
              }).length > 0
            }));
          }

          if (data.Tickers && data.Tickers.length > 0) {
            this.assetsForm && this.assetsForm.controls['Tickers'].setValue(this.Tickers.filter(function (Tickers: any) {
              return data.Tickers.filter(function (tickers: any) {
                return tickers.Value == Tickers.Value;
              }).length > 0
            }));
          }
        }
        else {
          this.assetsForm && this.assetsForm.controls['Industries'].setValue(data.Industries);
          this.assetsForm && this.assetsForm.controls['Tickers'].setValue(data.Tickers);
          this.assetsForm && this.assetsForm.controls['Analysts'].setValue(data.Analysts);
        }
      });
    }
    this.dataLoading = false;
  }

  fetchFormData() {
    this.dataService.getAssetsFormData(this.cookiesService.GetUserID() ? this.cookiesService.GetUserID().toString() : '0').subscribe((data: any) => {
      if (data) {
        this.ownerList = data[1].Analysts;
        this.Industries = data[1].Industries;
        this.filteredIndustries.next(this.Industries.slice());
        this.Tickers = data[1].Tickers;
        this.filteredTickers.next(this.Tickers.slice());
        this.Analysts = data[1].Analysts;
        this.filteredAnalysts.next(this.Analysts.slice());
        this.types = data[0];
        this.patchData();
      }
    });
  }

  clearFile() {
    this.assetsForm.patchValue({
      FileUpload: null,
      brightcove: ''
    });
    this.filename = null;
    document.getElementById('my-file') && (document.getElementById('my-file')['value'] = "")
  }

  removeChip(value: any, control: string) {
    let deletedValue = this.assetsForm.controls[control].value;
    if (control === 'Industries')
      deletedValue = deletedValue.filter((data: any) => data.Value !== value.Value);
    else if (control === 'Analysts')
      deletedValue = deletedValue.filter((data: any) => data.Value !== value.Value);
    else if (control === 'Tickers')
      deletedValue = deletedValue.filter((data: any) => data.Value !== value.Value);
    else if (control === 'bankMultiCtrl')
      deletedValue = deletedValue.filter((data: any) => data.id !== value.id);
    this.assetsForm.controls[control].setValue(deletedValue);
  }

  uploadAsset() {
    if (this.assetsForm.valid) {
      let AssetId = this.filename === null && (this.data && this.data.asset && this.data.asset.AssetId) ? this.data.asset.AssetId : 0;
      // Trying to Save an Asset without uploading the Deck or Model.
      if (AssetId === 0 && this.filename === null && !this.showBrightCove) {
        window.alert(this.environment.AssetsValidationMessage);
      }
      // Trying to Save an Asset without providing the brightcove id.
      else if (this.showBrightCove && (this.assetsForm.controls['brightcove'].value === '')) {
        window.alert(this.environment.AssetsValidationMessage);
      }
      // Trying to Revive an Expired Asset without uploading the Deck or Model.
      else if (this.data && this.data.asset && this.data.asset.State === 'Expired' && this.filename === null && !this.showBrightCove) {
        window.alert(this.environment.AssetsValidationMessage);
      }
      else {
        if (this.showBrightCove) {
          this.filename = this.assetsForm.controls['brightcove'].value;
          this.formData.append('FileSize', '0');
          this.formData.append('FileName', this.assetsForm.controls['brightcove'].value);
          this.formData.append('FileNameOrig', this.assetsForm.controls['brightcove'].value);
          this.formData.append('AssetId', (this.data && this.data.asset && this.data.asset.AssetId) ? this.data.asset.AssetId : 0);
        }
        else {
          let fileType = this.filename !== null && this.filename.split('.').pop().toUpperCase() ? this.filename.split('.').pop().toUpperCase() : (this.data.asset && this.data.asset.FileName.split('.').pop().toUpperCase());
          this.formData.append('FileSize', this.fileSize === 0 ? (this.data.asset && this.data.asset.FileSize) : this.fileSize);
          this.formData.append('FileName', (this.data && this.data.asset && this.data.asset.AssetId) ? this.data.asset.AssetId + '.' + fileType : '0.' + fileType);
          this.formData.append('FileNameOrig', this.assetsForm.controls['FileUpload'].value);
          this.formData.append('AssetId', this.filename === null && (this.data && this.data.asset && this.data.asset.AssetId) ? this.data.asset.AssetId : 0);
        }
        this.formData.append('LinkId', (this.data && this.data.asset && this.data.asset.LinkId) ? this.data.asset.LinkId : 0);
        this.formData.append('AnalystId', this.assetsForm.controls['owner'].value);
        this.formData.append('AssetTypeId', this.assetsForm.controls['type'].value);
        this.formData.append('Title', this.assetsForm.controls['title'].value);
        this.formData.append('CreatedById', this.cookiesService.GetUserID());
        this.formData.append('Industries', (this.assetsForm.controls['Industries'].value && this.assetsForm.controls['Industries'].value.length > 0) ?
          JSON.stringify(this.assetsForm.get('Industries').value.map(({ Value, Display }) => ({ Value, Display }))) : null);
        this.formData.append('Analysts', (this.assetsForm.controls['Analysts'].value && this.assetsForm.controls['Analysts'].value.length > 0) ?
          JSON.stringify(this.assetsForm.get('Analysts').value.map(({ Value, Display }) => ({ Value, Display }))) : null);
        this.formData.append('Tickers', (this.assetsForm.controls['Tickers'].value && this.assetsForm.controls['Tickers'].value.length > 0) ?
          JSON.stringify(this.assetsForm.get('Tickers').value.map(({ Value, Display }) => ({ Value, Display }))) : null);
        this.formData.append('ExpiryDate', this.datePipe.transform(this.calendarUtility.formatDate(this.assetsForm.controls['ExpiryDate'].value), 'MM-dd-yyyy').toString());

        var self = this;
        this.dataLoading = true;
        this.dataService.uploadAsset(this.formData).subscribe((message: any) => {
          if (message) {
            this.snackBar.open(message, 'Close', {
              duration: 2000
            });
          }
          if (this.data && this.data.asset && this.data.asset.State === 'Expired') {
            let addToCart = (self.filename === null ? false : true) && self.data.assetWasinCartBeforeExpire;
            console.log(addToCart);
            self.close({ event: addToCart });
          }
          else if (self.data.asset && self.data.asset.State === 'Active') {
            self.close({ event: false });
          }
          else if (AssetId === 0) {
            let event = 'Update Existing';
            self.close({ event: event });
          }
        });
      }
    }
    else {
      this.displayErrorMessage();
    }

  }

  onSelectFile(fileUpload: any) {
    try {
      if (this.types.filter((data: any) => data.Value === this.assetsForm.controls['type'].value).map((data) => data.MimeType)[0].split(',').indexOf(fileUpload[0].type) > -1) {
        this.uploadFile(fileUpload);
      }
      else {
        window.alert('The uploaded file is not in proper format');
      }
    } catch (error) {
      this.filename = null;
      this.fileSize = 0;
      console.log('no file was selected...');
    }
  }

  uploadFile(fileUpload: any) {
    this.dataLoading = true;
    for (let file of fileUpload) {
      this.formData.append(file.name, file);
      this.filename = file.name;
      this.fileSize = file.size;
    }
    this.assetsForm.patchValue({
      FileUpload: this.filename
    });
    let sinceDate = new Date();
    let ExpiryDays = this.environment.AssetsExpiryDays;
    sinceDate.setDate(sinceDate.getDate() + parseInt(ExpiryDays));
    this.assetsForm.patchValue({
      ExpiryDate: sinceDate
    });
    this.dataLoading = false;
  }

  checkAssetType() {
    this.clearFile();
    this.setFileType();
    this.showBrightCove = (this.types.find((data: any) => data.Value === this.assetsForm.controls['type'].value).AssetLocation === 'BRIGHTCOVE');
  }

  setFileType() {
    this.fileTypeOnly = this.types.find((data: any) => data.Value === this.assetsForm.controls['type'].value).MimeType;
  }

  rangeDatePickerValueChange() {
    if (this.assetsForm.controls['ExpiryDate'].value === null) {
      this.assetsForm.patchValue({
        ExpiryDate: new Date()
      });
    }
  }

  displayErrorMessage() {
    if (this.assetsForm.controls['owner'].errors && this.assetsForm.controls['owner'].errors.required === true) {
      window.alert(this.environment.AssetsValidationMessage);
    }
    else if (this.assetsForm.controls['type'].errors && this.assetsForm.controls['type'].errors.required === true) {
      window.alert(this.environment.AssetsValidationMessage);
    }
    else if (this.assetsForm.controls['title'].errors && this.assetsForm.controls['title'].errors.required === true) {
      window.alert(this.environment.AssetsValidationMessage);
    }
    else if (new Date(this.assetsForm.controls['ExpiryDate'].value) <= new Date()) {
      window.alert('Invalid expiry date.  Must be greater than effective date');
    }
  }

  setExpiryDate() {
    let sinceDate = new Date();
    let ExpiryDays = this.environment.AssetsExpiryDays;
    sinceDate.setDate(sinceDate.getDate() + parseInt(ExpiryDays));
    this.assetsForm.patchValue({
      ExpiryDate: sinceDate
    });
  }
}
