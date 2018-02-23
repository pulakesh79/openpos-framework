package org.jumpmind.pos.core.model;

import java.util.List;

public class ToggleField extends FormField {
    private static final long serialVersionUID = 1L;

    private List<String> values;
    
    private String valueChangedAction;
    
    public ToggleField() {
    		setInputType(FieldInputType.ToggleButton);
        setElementType(FieldElementType.Input);
    }
    
    public ToggleField(String fieldId, String label, List<String> values, String defaultValue) {
        super(fieldId, label, null);
        setInputType(FieldInputType.ToggleButton);
        setElementType(FieldElementType.Input);
        setValue(defaultValue);
        this.values = values;
    }
    
    
    public List<String> getValues() {
        return values;
    }

    public void setValues(List<String> values) {
        this.values = values;
    }

    public String getValueChangedAction() {
        return valueChangedAction;
    }

    /**
     * When this value is set, the client will call back upon the selected value changing with an action whose name is the same 
     * as the one given
     * @param valueChangedAction The name of an action to generate when the Combo box selected value changes.
     */
    public void setValueChangedAction(String valueChangedAction) {
        this.valueChangedAction = valueChangedAction;
    }
    
}
