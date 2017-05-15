import { Component, Input, Optional, Inject,Output,EventEmitter } from '@angular/core';
import { Router }            from '@angular/router';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

import { Observable }        from 'rxjs/Observable';
import { Subject }           from 'rxjs/Subject';

// Observable class extensions
import 'rxjs/add/observable/of';

import { Release } from './release';
import { ReleaseService } from './release.service';

import { AceEditorComponent } from 'ng2-ace-editor';
import 'brace'
import 'brace/mode/yaml'

@Component({
  selector: 'release-controls',
  templateUrl: './release-controls.component.html',
  styleUrls: [ './release-controls.component.css' ]
})
export class ReleaseControlsComponent {
  @Input() release: Release;
  @Input() ParentReleases: Release[];
  @Output() outputEvent:EventEmitter<string>=new EventEmitter();

  dialogResp: string;
  loading: boolean;

  constructor(
    private releaseService: ReleaseService,
    private _dialog: MdDialog
  ) { }


  delete(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.releaseService.delete(name)
      .then(response => {
        this.outputEvent.emit(name);
      });
  }

  openEditDialog(rel: Release) {
    console.log(rel);
    let configData = rel.config.raw ? rel.config.raw.trim():"";
    const dialogRef = this._dialog.open(DialogContentComponent, {
      data: {'config':configData, 'values':rel.chart.values.raw},
    });
    dialogRef.afterClosed().subscribe(result => {
      this.dialogResp = result;
      if (result) {
        this.toggleLoad();

        this.releaseService.updateValues(rel.name, result)
          .then(release => {
            for (var i = 0; i < this.ParentReleases.length; i++) {
              if (this.ParentReleases[i].name == release.name) {
                this.ParentReleases[i] = release;
              }
            }
          });
      }
    })
  }

  toggleLoad(): void {
    this.loading = this.loading ? false: true; 
  }
}



@Component({
  template: `
    <ace-editor
      #editorInput
      [(text)]="data.config"
      [mode]="'yaml'"></ace-editor>
    <pre>{{ data.values }}</pre>
    <br />
    <button color="accent" md-button (click)="dialogRef.close(editorInput.value)">
      <md-icon>save</md-icon> save
    </button>
    <button color="accent" md-button (click)="dialogRef.close()">
      <md-icon>cancel</md-icon> cancel
    </button>
  `,
  styles: [`
    ace-editor {
      height: 10em;
      width: auto;
      font-family: "Courier New", Courier, monospace !important;
    }
    pre {
      width: auto;
      height: 10em;
      overflow: auto;
      background-color: #eeeeee;
      word-break: normal !important;
      word-wrap: normal !important;
      white-space: pre !important;
    }
  `],
})
export class DialogContentComponent {
  //text: string = 
  constructor( 
    @Optional() public dialogRef: MdDialogRef<DialogContentComponent>,
    @Inject(MD_DIALOG_DATA) public data: any
  ) {}
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'unepoch'})
export class UnEpochPipe implements PipeTransform {
  transform(value: number, args: string[]): any {
    if (!value) return value;
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(value);

    return t.toLocaleDateString("en-US");
  }
}

@Pipe({name: 'status'})
export class StatusStringPipe implements PipeTransform {
  transform(value: number, args: string[]): any {
    let statuses = [
      "UNKNOWN",
      "DEPLOYED",
      "DELETED",
      "SUPERSEDED",
      "FAILED",
      "DELETING"
    ];
    
    if (!value) return value;
    if (value > statuses.length) return "UNKNOWN";
    
    return statuses[value];
  }
}

import {DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';

@Pipe({
	name: 'safe'
})
export class SafePipe {

	constructor(protected _sanitizer: DomSanitizer) {

	}

	public transform(value: string, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
		switch (type) {
			case 'html':
				return this._sanitizer.bypassSecurityTrustHtml(value);
			case 'style':
				return this._sanitizer.bypassSecurityTrustStyle(value);
			case 'script':
				return this._sanitizer.bypassSecurityTrustScript(value);
			case 'url':
				return this._sanitizer.bypassSecurityTrustUrl(value);
			case 'resourceUrl':
				return this._sanitizer.bypassSecurityTrustResourceUrl(value);
			default:
				throw new Error(`Unable to bypass security for invalid type: ${type}`);
		}
	}

}