package org.jumpmind.pos.core.ui.message;

import org.jumpmind.pos.core.model.MessageType;
import org.jumpmind.pos.core.ui.ActionItem;
import org.jumpmind.pos.core.ui.IconType;
import org.jumpmind.pos.core.ui.UIMessage;
import org.jumpmind.pos.core.ui.messagepart.DialogHeaderPart;
import org.jumpmind.pos.core.ui.messagepart.ScanOrSearchPart;

public class ScanInputDialogUIMessage extends UIMessage {

    private static final long serialVersionUID = 1L;

    private ScanOrSearchPart scan;

    private DialogHeaderPart dialogHeader;

    public ScanInputDialogUIMessage() {
        setType(MessageType.Dialog);
        setScreenType(UIMessageType.SCAN_INPUT_DIALOG);

        this.dialogHeader = new DialogHeaderPart();
        this.dialogHeader.setBackButton(new ActionItem("CloseDialog", "", IconType.Close));
    }

    public ScanOrSearchPart getScan() {
        return scan;
    }

    public void setScan(ScanOrSearchPart scan) {
        this.scan = scan;
    }

    public DialogHeaderPart getDialogHeader() {
        return dialogHeader;
    }

    public void setDialogHeader(DialogHeaderPart dialogHeader) {
        this.dialogHeader = dialogHeader;
    }

}
