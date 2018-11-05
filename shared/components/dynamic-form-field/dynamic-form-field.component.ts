import { Logger } from './../../../core/services/logger.service';
import {
  Component, ViewChild, AfterViewInit, OnInit, OnDestroy,
  Output, Input, EventEmitter
} from '@angular/core';
import { MatInput, MatDialog } from '@angular/material';
import { FormGroup } from '@angular/forms';
import { OptionEntry, DataSource } from '@oasisdigital/angular-material-search-select';
import { Subscription, Observable, of  } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITextMask, TextMask } from '../../textmask';
import { DynamicDateFormFieldComponent } from '../dynamic-date-form-field/dynamic-date-form-field.component';
import { SessionService, ScreenService, PluginService, IFormElement, Scan, BarcodeScannerPlugin } from '../../../core';
import { PopTartComponent } from '../pop-tart/pop-tart.component';

@Component({
  selector: 'app-dynamic-form-field',
  templateUrl: './dynamic-form-field.component.html',
  styleUrls: ['./dynamic-form-field.component.scss']
})
export class DynamicFormFieldComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatInput) field: MatInput;
  @ViewChild(DynamicDateFormFieldComponent) dateField: DynamicDateFormFieldComponent;

  @Input() formField: IFormElement;

  @Input() formGroup: FormGroup;

  public controlName: string;

  public keyboardLayout = 'en-US';

  valuesSubscription: Subscription;
  private barcodeEventSubscription: Subscription;

  autoCompleteDataSource: DataSource = {
    displayValue(value: any): Observable<OptionEntry | null> {
      return of(null);
    },

    search(term: string): Observable<OptionEntry[]> {
      return of(null);
    }
  };

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onFieldChanged = new EventEmitter<IFormElement>();

  public values: Array<string> = [];

  public focus(): void {
    if ( this.field ) {
        this.field.focus();
    }
    if ( this.dateField ) {
        this.dateField.focus();
    }
  }

  public isReadOnly(): boolean {
      if (this.field) {
          return this.field.readonly;
      }
      return false;
  }

  constructor(private log: Logger, public session: SessionService, public screenService: ScreenService, protected dialog: MatDialog,
    private pluginService: PluginService) { }

  ngOnInit() {
    this.controlName = this.formField.id;

    if (this.formField.inputType === 'ComboBox' || this.formField.inputType === 'SubmitOptionList' ||
      this.formField.inputType === 'ToggleButton' || this.formField.inputType === 'PopTart') {
      this.valuesSubscription = this.screenService.getFieldValues(this.formField.id).subscribe((data) => {
        this.values = data;
        this.log.info('asynchronously received ' + this.values.length + ' items for ' + this.formField.id);
      });
    }

    if (this.formField.inputType === 'NumericText' ||
      this.formField.inputType === 'Phone' ||
      this.formField.inputType === 'PostalCode' ||
      this.formField.inputType === 'Counter') {
      this.keyboardLayout = 'Numeric';
    } else if (this.formField.label === 'Email') {
      this.keyboardLayout = 'Email';
    }

    if (this.formField.inputType === 'AutoComplete') {
      this.updateAutoCompleteDataSource();
    }

    if (this.formField.scanEnabled) {
        this.pluginService.getPluginWithOptions('barcodeScannerPlugin', true, {waitForCordovaInit: true}).then(plugin => {
            // the onBarcodeScanned will only emit an event when client code passes a scan
            // event to the plugin.  This won't be called for cordova barcodescanner plugin
            // camera-based scan events.  It should only be used for third party scan events
            // which come from other sources such as a scan device
            this.barcodeEventSubscription = (<BarcodeScannerPlugin> plugin).onBarcodeScanned.subscribe({
                next: (scan: Scan) => {
                    this.log.info(`dynamic-form-field '${this.formField.id}' got scan event: ${scan.value}`);
                    if (this.field.focused) {
                        this.setFieldValue(this.formField.id, scan.value);
                    }
                }
            });
            this.log.info(`dynamic-form-field '${this.formField.id}' is subscribed for barcode scan events`);

        }).catch( error => this.log.info(`Failed to get barcodeScannerPlugin.  Reason: ${error}`) );

    }
  }

  ngAfterViewInit(): void {
    if (this.formField.inputType === 'AutoComplete') {
      if (this.formField.value) {
        this.formGroup.get(this.formField.id).setValue(this.formField.value);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.valuesSubscription) {
      this.valuesSubscription.unsubscribe();
    }

    if (this.barcodeEventSubscription) {
        this.barcodeEventSubscription.unsubscribe();
    }
  }

  isNumericField(): boolean {
    return (['NumericText', 'Money', 'Phone', 'PostalCode', 'Percent', 'PercentInt', 'Income', 'Decimal', 'Counter'].indexOf(this.formField.inputType) >= 0
        || this.formField.keyboardPreference === 'Numeric');
  }

  onClick(event, formField: IFormElement) {
    if (formField.select) {
      // setSelectionRange is necessary in order to work correctly in UIWebView on iPad
      event.target.setSelectionRange(0, 9999);
    }
  }

  updateAutoCompleteDataSource() {
    const fld: IFormElement = this.formField;
    const scrnSvc: ScreenService = this.screenService;
    this.autoCompleteDataSource = {
      displayValue(value: any): Observable<OptionEntry | null> {
        this.log.info(`being asked to display value for: ${value}`);
        const display = <string>value;
        return of({
          value,
          display,
          details: {}
        });
      },

      search(term: string): Observable<OptionEntry[]> {
        const lowerTerm = term ? term.toLowerCase() : '';
        if (lowerTerm) {
          this.log.info(`autocomplete searching for '${lowerTerm}' on field '${fld.id}'`);
          return (<Observable<Array<string>>>scrnSvc.getFieldValues(fld.id, lowerTerm))
            .pipe(
              map(searchResults => searchResults.map(v => ({
                value: v,
                display: v,
                details: {}
              })))
            );
        } else {
          return of(<OptionEntry[]>[]);
        }
      }
    };

  }

  onFormElementChanged(formElement: IFormElement): void {
    this.onFieldChanged.emit(formElement);
  }

  getFormFieldMask(): ITextMask {
    if (this.formField.mask) {
      return TextMask.instance(this.formField.mask);
    } else {
      return TextMask.NO_MASK;
    }
  }

  openPopTart() {
    const dialogRef = this.dialog.open(PopTartComponent, {
      width: '70%',
      data: {
        optionItems: this.values,
        disableClose: false,
        autoFocus: false
     }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.log.info('pop tart closed with value of: ' + result);
      this.formGroup.get(this.formField.id).setValue(result);
      this.onFormElementChanged(this.formField);
    });
  }

  getPlaceholderText(formElement: IFormElement) {
    let text = '';
    if (formElement.label) {
      text += formElement.label;
    }
    if (text && formElement.placeholder) {
      text = `${text} - ${formElement.placeholder}`;
    }

    return text;
  }

  isDateInput(): boolean {
    return this.formField.inputType && this.formField.inputType !== 'DatePartChooser' &&
       this.formField.inputType.toLowerCase().indexOf('date') >= 0;
  }

  isSpecialCaseInput(): boolean {
    return ['ToggleButton', 'Checkbox', 'AutoComplete', 'Counter', 'DatePartChooser'].indexOf(this.formField.inputType) >= 0 ||
        this.isDateInput();
  }

  isScanAllowed(): boolean {
    return this.formField.scanEnabled && ! this.formField.disabled &&
        ['NumericText', 'AlphanumericText'].indexOf(this.formField.inputType) >= 0;
  }

  /**
   * This method is invoked when the user presses the Scan button on the field.
   * For device-based scan events, see the ngOnInit method.
   * @param formField The field associated with the scan request.
   */
  onScan(formField: IFormElement): void {
    this.pluginService.getDevicePlugin('barcodeScannerPlugin').then(plugin =>
        plugin.processRequest(
          {requestId: 'scan', deviceId: 'barcode-scanner', type: null, subType: null, payload: null},
          (scan) => {
            if (scan instanceof Scan && ! scan.cancelled) {
                this.log.info(`Scan value of '${scan.value}' received for field '${formField.id}'`);
                this.setFieldValue(formField.id, scan.value);
            }
          },
          (error) => {
            this.log.info('Scanning failed: ' + error);
          }
        )
    ).catch( error => this.log.info(`Scanning failed: ${error}`));
  }

  private setFieldValue(fieldId: string, value: any) {
    const patchGroup = {};
    patchGroup[fieldId] = value;
    this.formGroup.patchValue(patchGroup);
  }
}

