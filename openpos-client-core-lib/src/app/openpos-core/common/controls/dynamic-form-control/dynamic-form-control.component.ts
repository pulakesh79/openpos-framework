import { ITextMask, TextMask } from './../../textmask';
import { IMenuItem } from '../../imenuitem';
import { IScreen } from '../../iscreen';
import { Component, ViewChild, AfterViewInit, DoCheck, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { SessionService } from '../../../services/session.service';
import { MatSelectChange } from '@angular/material';
import { AbstractApp } from '../../abstract-app';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, FormControl, NgForm, ValidatorFn, NG_VALIDATORS } from '@angular/forms';
import { IFormElement } from '../../iformfield';
import { Observable } from 'rxjs/Observable';
import { ScreenService } from '../../../services/screen.service';
import { OpenPosValidators } from '../../validators/openpos-validators';
import { ValidatorsService } from '../../../services/validators.service';

@Component({
  selector: 'app-dynamic-form-control',
  templateUrl: './dynamic-form-control.component.html',
  styleUrls: ['./dynamic-form-control.component.scss']
})
export class DynamicFormControlComponent implements OnInit {

  @Input() screenForm: IForm;

  @Input() submitAction: string;

  @Input() submitButtonText: string = 'Next';

  form: FormGroup;

  constructor( public session: SessionService, public screenService: ScreenService, private validatorService: ValidatorsService) { }

  ngOnInit() {

    this.session.screen.alternateSubmitActions.forEach(action => {

      this.session.registerActionPayload( action, () => {
        this.buildFormPayload();
        return this.session.response = this.screenForm;
       });
    });

    let group: any = {};

    this.screenForm.formElements.forEach( element => {

      let validators: ValidatorFn[] = [];
      if(element.required){
        validators.push(Validators.required);
      }
      
      if(element.pattern){
        validators.push(Validators.pattern(element.pattern));
      }

      if(element.minLength){
        validators.push(Validators.minLength(element.minLength));
      }

      if(element.maxLength){
        validators.push(Validators.maxLength(element.maxLength));
      }

      validators.push(this.validatorService.getValidator(element.inputType));

      group[element.id] = new FormControl(element.value, validators);
    });


    this.form = new FormGroup(group, (this.screenForm.requiresAtLeastOneValue) ? OpenPosValidators.RequireAtleastOne : null );

  }

  submitForm() {
    if (this.form.valid) {

      this.buildFormPayload();
      this.session.onAction(this.submitAction, this.screenForm);
    }
  }

  onFieldChanged(formElement:IFormElement) {
    if(formElement.valueChangedAction) {
      this.buildFormPayload();
      this.session.onAction(formElement.valueChangedAction, this.screenForm);
    }    
  }

  private buildFormPayload()  {
    this.screenForm.formElements.forEach( element => {
      if (element.hasOwnProperty('value')) {
        element.value = this.form.value[element.id];
      }
    });
  }
}

export interface IForm {
  formElements: IFormElement[];
  requiresAtLeastOneValue: Boolean;
}

