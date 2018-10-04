import { Logger } from './../../services/logger.service';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Renderer2, ElementRef } from '@angular/core';
import { Component, ViewChild, HostListener, ComponentRef, OnDestroy, OnInit, ComponentFactory } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar, MatSnackBarRef, SimpleSnackBar, MatExpansionPanel } from '@angular/material';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { AbstractTemplate } from '../abstract-template';
import { Configuration } from '../../../configuration/configuration';
import { IPlugin } from '../../plugins';
import {
    ScreenService,
    DialogService,
    SessionService,
    DeviceService,
    IconService,
    PluginService,
    FileUploadService
} from '../../services';
import { IScreen } from './screen.interface';
import { Element, OpenPOSDialogConfig, ActionMap, IMenuItem, IMessageHandler } from '../../interfaces';
import { FileViewerComponent, TemplateDirective } from '../../../shared';
import { PersonalizationService } from '../../services/personalization.service';
import { PersonalizationComponent } from '../personalization/personalization.component';

@Component({
    selector: 'app-dev-menu',
    templateUrl: './dev-menu.component.html',
    styleUrls: ['./dev-menu.component.scss'],
})
export class DevMenuComponent implements OnInit, IMessageHandler {

    static MSG_TYPE = 'DevTools';

    NodeElements: Element[];
    SessElements: Element[];
    ConvElements: Element[];
    ConfElements: Element[];
    FlowElements: Element[];

    savePoints: string[];

    firstClickTime = Date.now();

    clickCount = 0;

    devClicks = 0;

    currentSelectedLogfilename: string;

    logFilenames: string[];

    logPlugin: IPlugin;

    showDevMenu = false;

    logsAvailable = false;

    keyCount = 0;

    savePointFileName: string;

    private displaySavePoints = false;

    private showUpdating = false;

    private currentStateActions: ActionMap[];

    private currentStateClass: string;

    private currentState: string;

    private stackTrace: string;

    private selected: string;

    private displayStackTrace = false;

    private dialogRef: MatDialogRef<IScreen>;

    private previousScreenType: string;

    private dialogOpening: boolean;

    private previousScreenName: string;

    private snackBarRef: MatSnackBarRef<SimpleSnackBar>;

    private registered: boolean;

    private installedScreen: IScreen;

    private currentTemplateRef: ComponentRef<IScreen>;

    private installedTemplate: AbstractTemplate;

    private lastDialogType: string;

    public classes = '';

    private disableDevMenu = false;

    @ViewChild(TemplateDirective) host: TemplateDirective;

    constructor(private log: Logger, private personalization: PersonalizationService, public screenService: ScreenService, public dialogService: DialogService, public session: SessionService,
        public deviceService: DeviceService, public dialog: MatDialog,
        public iconService: IconService, public snackBar: MatSnackBar, public overlayContainer: OverlayContainer,
        protected router: Router, private pluginService: PluginService,
        private fileUploadService: FileUploadService,
        private httpClient: HttpClient, private cd: ChangeDetectorRef,
        private elRef: ElementRef, public renderer: Renderer2) {

        if (Configuration.useTouchListener) {
            this.renderer.listen(elRef.nativeElement, 'touchstart', (event) => {
                this.documentClick(event);
            });
        }
    }

    handle(message: any) {
        if (message.name === 'DevTools::Get') {
            this.populateDevTables(message);
        }
    }

    ngOnInit(): void {
        const self = this;
        this.session.registerMessageHandler(this, 'DevTools');
    }

    private populateDevTables(message: any) {
        if (message.currentState) {
            this.log.info('Pulling current state actions...');
            this.currentState = message.currentState.stateName;
            this.currentStateClass = message.currentState.stateClass;
            this.currentStateActions = [];
            for (let i = 0; i < message.actionsSize; i = i + 2) {
                this.currentStateActions.push({
                    Action: message.actions[i],
                    Destination: message.actions[i + 1]

                });
            }
        }
        if (message.scopes.ConversationScope) {
            this.log.info('Pulling Conversation Scope Elements...');
            this.ConvElements = [];
            message.scopes.ConversationScope.forEach(element => {
                if (!this.ConvElements.includes(element, 0)) {
                    this.ConvElements.push({
                        ID: element.name,
                        Time: element.date,
                        StackTrace: element.stackTrace,
                        Value: element.value
                    });
                }
            });
        }
        if (message.scopes.SessionScope) {
            this.log.info('Pulling Session Scope Elements...');
            this.SessElements = [];
            message.scopes.SessionScope.forEach(element => {
                if (!this.SessElements.includes(element, 0)) {
                    this.SessElements.push({
                        ID: element.name,
                        Time: element.date,
                        StackTrace: element.stackTrace,
                        Value: element.value
                    });
                }
            });
        }
        if (message.scopes.NodeScope) {
            this.log.info('Pulling Node Scope Elements...');
            this.NodeElements = [];
            message.scopes.NodeScope.forEach(element => {
                if (!this.NodeElements.includes(element, 0)) {
                    this.NodeElements.push({
                        ID: element.name,
                        Time: element.date,
                        StackTrace: element.stackTrace,
                        Value: element.value
                    });
                }
            });
        }
        if (message.scopes.FlowScope) {
            this.log.info('Pulling Flow Scope Elements...');
            this.FlowElements = [];
            message.scopes.FlowScope.forEach(element => {
                if (!this.FlowElements.includes(element, 0)) {
                    this.FlowElements.push({
                        ID: element.name,
                        Time: element.date,
                        StackTrace: element.stackTrace,
                        Value: element.value
                    });
                }
            });
            this.log.info(this.FlowElements);
        }

        if (message.scopes.ConfigScope) {
            this.log.info('Pulling Config Scope Elements...');
            this.ConfElements = [];
            message.scopes.ConfigScope.forEach(element => {
                if (!this.ConfElements.includes(element, 0)) {
                    this.ConfElements.push({
                        ID: element.name,
                        Time: element.date,
                        StackTrace: element.stackTrace,
                        Value: element.value
                    });
                }
            });
            this.log.info(this.ConfElements);
        }

        if (message.saveFiles) {
            this.log.info('Pulling save files...');
            this.savePoints = [];
            message.saveFiles.forEach(saveName => {
                this.savePoints.push(saveName);
                this.log.info(this.savePoints);
            });
        }
    }

    @HostListener('document:keydown', ['$event'])
    handleKeydownEvent(event: any) {
        const key = event.key;
        // this.log.info(key);
        if (key === 'ArrowUp' && this.keyCount !== 1) {
            this.keyCount = 1;
        } else if (key === 'ArrowUp' && this.keyCount === 1) {
            this.keyCount = 2;
        } else if (key === 'ArrowDown' && this.keyCount === 2) {
            this.keyCount = 3;
        } else if (key === 'ArrowDown' && this.keyCount === 3) {
            this.keyCount = 4;
        } else if (key === 'ArrowLeft' && this.keyCount === 4) {
            this.keyCount = 5;
        } else if (key === 'ArrowRight' && this.keyCount === 5) {
            this.keyCount = 6;
        } else if (key === 'ArrowLeft' && this.keyCount === 6) {
            this.keyCount = 7;
        } else if (key === 'ArrowRight' && this.keyCount === 7) {
            this.keyCount = 8;
        } else if ((key === 'b' || key === 'B') && this.keyCount === 8) {
            this.keyCount = 9;
        } else if ((key === 'a' || key === 'A') && this.keyCount === 9) {
            this.onDevMenuClick();
            this.keyCount = 0;
        } else {
            this.keyCount = 0;
        }
    }

    @HostListener('document:click', ['$event'])
    documentClick(event: any) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        let x = event.clientX;
        let y = event.clientY;
        if (event.type === 'touchstart') {
            // this.log.info(event);
            x = event.changedTouches[0].pageX;
            y = event.changedTouches[0].pageY;
        }
        // this.log.info(`${screenWidth} ${x} ${y}`);
        if (this.clickCount === 0 || Date.now() - this.firstClickTime > 1000 ||
            (y > 100) || this.disableDevMenu) {
            this.firstClickTime = Date.now();
            this.clickCount = 0;
        }

        if (y < 100) {
            this.clickCount = ++this.clickCount;
        }

        if (y < 200 && x < 200) {
            this.devClicks = 1;
        } else if ((y < 200 && x > screenWidth - 200) && (this.devClicks === 1 || this.devClicks === 2)) {
            this.devClicks = 2;
        } else if ((y > screenHeight - 200 && x > screenWidth - 200) && (this.devClicks === 2 || this.devClicks === 3)) {
            this.devClicks = 3;
        } else if ((y > screenHeight - 200 && x < 200) && this.devClicks === 3) {
            this.onDevMenuClick();
            this.devClicks = 0;
        } else {
            this.devClicks = 0;
        }

        // this.log.info(this.devClicks + " y="+y + ",x="+x+",h="+screenHeight+",w="+screenWidth);

    }

    protected onStackTraceClose() {
        this.displayStackTrace = false;
    }

    protected onDevMenuClick(): void {
        if (!this.showDevMenu) {
            this.pluginService.getPlugin('openPOSCordovaLogPlugin').then(
                (plugin: IPlugin) => {
                    this.logPlugin = plugin;
                    if (this.logPlugin && this.logPlugin.impl) {
                        this.logsAvailable = true;
                        this.logPlugin.impl.listLogFiles('DESC',
                            (fileNames) => {
                                this.logFilenames = fileNames;
                            },
                            (error) => {
                                this.logFilenames = [];
                            }
                        );
                    } else {
                        this.logsAvailable = false;
                    }
                }
            ).catch(error => {
                this.logsAvailable = false;
            });
        }
        if (this.personalization.isPersonalized()) {
            this.session.publish('DevTools::Get', DevMenuComponent.MSG_TYPE);
        } else {
            this.log.info(`DevTools can't fetch server status since device is not yet personalized.`);
        }
        this.showDevMenu = !this.showDevMenu;
        if (! this.personalization.isPersonalized()) {
            // Due to a bug in the WKWebview, the below is needed on cordova to get the
            // DevMenu to show on the iPad when personalization has failed.  Without this code,
            // the DevMenu is invisible until the iPad is rotated. With this code, though, there
            // is a side affect that two expansion panels are shown (one with content, one without).
            // Sigh.  But I am leaving this in for now at least so that *a* DevMenu shows.
            this.cd.detectChanges();
        }
    }

    protected useSavePoints(): boolean {
        return Configuration.useSavePoints;
    }

    protected onDevMenuRefresh() {
        this.log.info('refreshing tools... ');
        this.displayStackTrace = false;
        this.currentState = 'Updating State... ';
        this.currentStateClass = 'Updating State...';
        this.showUpdating = true;
        this.currentStateActions = [];
        this.NodeElements = [];
        this.ConvElements = [];
        this.SessElements = [];
        this.ConfElements = [];
        this.FlowElements = [];
        setTimeout(() => {
            this.session.publish('DevTools::Get', DevMenuComponent.MSG_TYPE);
            this.showUpdating = false;
        }, 500
        );
        this.onCreateSavePoint(null);

    }

    protected onNodeRemove(element: Element) {
        this.removeNodeElement(element);
    }

    protected onSessRemove(element: Element) {
        this.removeSessionElement(element);
    }

    protected onConvRemove(element: Element) {
        this.removeConversationElement(element);
    }

    protected onConfRemove(element: Element) {
        this.removeConfigElement(element);
    }

    protected onFlowRemove(element: Element) {
        this.removeFlowElement(element);
    }

    protected onStackTrace(element: Element) {
        this.displayStackTrace = true;
        this.selected = '\'' + element.ID + '\'';
        this.stackTrace = element.StackTrace;
    }

    protected onLoadSavePoint(savePoint: string) {
        if (this.savePoints.includes(savePoint)) {
            this.session.publish('DevTools::Load::' + savePoint, DevMenuComponent.MSG_TYPE);
            this.log.info('Loaded Save Point: \'' + savePoint + '\'');
        } else {
            this.log.info('Unable to load Save Point: \'' + savePoint + '\'');
        }
    }

    protected onSimulateScan(value: string) {
        if (value) {
            this.session.publish('DevTools::Scan', value);
        }
    }

    protected onCreateSavePoint(newSavePoint: string) {
        if (newSavePoint) {
            this.addSaveFile(newSavePoint);
        }
        if (!this.displaySavePoints && this.savePoints.length > 0) {
            this.displaySavePoints = true;
        }
    }

    protected onSavePointRemove(savePoint: string) {
        this.removeSaveFile(savePoint);
        if (this.savePoints.length === 0) {
            this.displaySavePoints = false;
        }
    }

    public onDevRefreshView() {
        this.personalization.refreshApp();
    }

    public onPersonalize() {
        this.personalization.dePersonalize();
        this.session.unsubscribe();
        this.session.cancelLoading();

        this.dialog.open( PersonalizationComponent ).afterClosed().subscribe( () => this.personalization.refreshApp() );
    }

    public onDevClearLocalStorage() {
        localStorage.clear();
        this.personalization.refreshApp();
    }

    public onDevRestartNode(): Promise<{ success: boolean, message: string }> {
        const prom = new Promise<{ success: boolean, message: string }>((resolve, reject) => {
            const port = this.personalization.getServerPort();
            const nodeId = this.personalization.getNodeId().toString();
            const url = `${this.personalization.getServerBaseURL()}/register/restart/node/${nodeId}`;
            const httpClient = this.httpClient;
            httpClient.get(url).subscribe(response => {
                const msg = `Node '${nodeId}' restarted successfully.`;
                this.log.info(msg);
                resolve({ success: true, message: msg });
            },
                err => {
                    const msg = `Node restart Error occurred: ${JSON.stringify(err)}`;
                    const statusCode = err.status || (err.error ? err.error.status : null);
                    let errMsg = '';
                    if (err.error) {
                        if (err.error.error) {
                            errMsg += err.error.error;
                        }
                        if (err.error.message) {
                            errMsg += (errMsg ? '; ' : '') + err.error.message;
                        }
                    }
                    const returnMsg = `${statusCode ? statusCode + ': ' : ''}` +
                        (errMsg ? errMsg : 'Restart failed. Check client and server logs.');
                    reject({ success: false, message: returnMsg });
                });

        });
        return prom;
    }

    public onLogfileSelected(logFilename: string): void {
        this.currentSelectedLogfilename = logFilename;
    }

    public onLogfileShare(logFilename?: string): void {
        if (this.logPlugin && this.logPlugin.impl) {
            const targetFilename = logFilename || this.currentSelectedLogfilename;
            this.logPlugin.impl.shareLogFile(
                targetFilename,
                () => {
                },
                (error) => {
                    this.log.info(error);
                }
            );
        }
    }

    public onLogfileUpload(logFilename?: string): void {
        if (this.logPlugin && this.logPlugin.impl) {
            const targetFilename = logFilename || this.currentSelectedLogfilename;
            this.logPlugin.impl.getLogFilePath(
                targetFilename,
                (logfilePath) => {
                    this.fileUploadService.uploadLocalDeviceFileToServer('log', targetFilename, 'text/plain', logfilePath)
                        .then((result: { success: boolean, message: string }) => {
                            this.snackBar.open(result.message, 'Dismiss', {
                                duration: 8000, verticalPosition: 'top'
                            });
                        })
                        .catch((result: { success: boolean, message: string }) => {
                            this.snackBar.open(result.message, 'Dismiss', {
                                duration: 8000, verticalPosition: 'top'
                            });
                        });
                },
                (error) => {
                    this.log.info(error);
                }
            );
        }
    }

    public onLogfileView(logFilename?: string): void {
        if (this.logPlugin && this.logPlugin.impl) {
            const targetFilename = logFilename || this.currentSelectedLogfilename;
            this.logPlugin.impl.readLogFileContents(
                targetFilename,
                (logFileContents) => {
                    const dialogRef = this.dialog.open(FileViewerComponent, {
                        panelClass: 'full-screen-dialog',
                        maxWidth: '100vw', maxHeight: '100vh', width: '100vw'
                    });
                    dialogRef.componentInstance.fileName = targetFilename;
                    dialogRef.componentInstance.text = logFileContents;
                },
                (error) => {
                    this.log.info(error);
                }
            );
        }
    }

    protected addSaveFile(newSavePoint: string) {
        if (newSavePoint) {
            if (!this.savePoints.includes(newSavePoint)) {
                this.savePoints.push(newSavePoint);
            }
          this.session.publish('DevTools::Save::' + newSavePoint, DevMenuComponent.MSG_TYPE);
          this.log.info('Save Point Created: \'' + newSavePoint + '\'');
        }
    }

    protected removeSaveFile(saveName: string) {
        this.log.info('Attempting to remove Save Point \'' + saveName + '\'...');
        const index = this.savePoints.findIndex(item => {
            return saveName === item;
        });
        if (index !== -1) {
            this.session.publish('DevTools::RemoveSave::' + saveName, DevMenuComponent.MSG_TYPE);
            this.savePoints.splice(index, 1);
            this.log.info('Save Points updated: ');
            this.log.info(this.savePoints);
        }
    }

    protected removeNodeElement(element: Element) {
        this.log.info('Attempting to remove \'' + element.Value + '\'...');
        const index = this.NodeElements.findIndex(item => {
            return element.Value === item.Value;
        });
        if (index !== -1) {
            this.session.publish('DevTools::Remove::Node', DevMenuComponent.MSG_TYPE, element);
            this.NodeElements.splice(index, 1);
            this.log.info('Node Scope updated: ');
            this.log.info(this.NodeElements);
        }
    }

    public removeSessionElement(element: Element) {
        this.log.info('Attempting to remove \'' + element.Value + '\'...');
        const index = this.SessElements.findIndex(item => {
            return element.Value === item.Value;
        });
        if (index !== -1) {
            this.session.publish('DevTools::Remove::Session', DevMenuComponent.MSG_TYPE, element);
            this.SessElements.splice(index, 1);
            this.log.info('Session Scope updated: ');
            this.log.info(this.NodeElements);
        }
    }

    protected removeConversationElement(element: Element) {
        this.log.info('Attempting to remove \'' + element.Value + '\'...');
        const index = this.ConvElements.findIndex(item => {
            return element.Value === item.Value;
        });
        if (index !== -1) {
            this.session.publish('DevTools::Remove::Conversation', DevMenuComponent.MSG_TYPE, element);
            this.ConvElements.splice(index, 1);
            this.log.info('Conversation Scope updated: ');
            this.log.info(this.ConvElements);
        }
    }

    protected removeConfigElement(element: Element) {
        this.log.info('Attempting to remove \'' + element.Value + '\'...');
        const index = this.ConfElements.findIndex(item => {
            return element.Value === item.Value;
        });
        if (index !== -1) {
            this.session.publish('DevTools::Remove::Config', DevMenuComponent.MSG_TYPE, element);
            this.ConfElements.splice(index, 1);
            this.log.info('Config Scope updated: ');
            this.log.info(this.ConfElements);
        }
    }

    protected removeFlowElement(element: Element) {
        this.log.info('Attempting to remove \'' + element.Value + '\'...');
        const index = this.FlowElements.findIndex(item => {
            return element.Value === item.Value;
        });
        if (index !== -1) {
            this.session.publish('DevTools::Remove::Flow', DevMenuComponent.MSG_TYPE, element);
            this.FlowElements.splice(index, 1);
            this.log.info('Flow Scope updated: ');
            this.log.info(this.FlowElements);
        }
    }
}
