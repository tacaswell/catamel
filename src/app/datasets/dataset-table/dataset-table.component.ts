import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  OnDestroy,
} from '@angular/core';

import { Router, ActivatedRoute, Data } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import { Subject } from 'rxjs/Subject';

import { Job, Dataset } from 'shared/sdk/models';
import { ConfigService } from 'shared/services/config.service';
import { DialogComponent } from 'shared/modules/dialog/dialog.component';
import * as utils from 'shared/utils';
import { config } from '../../../config/config';

import * as dsa from 'state-management/actions/datasets.actions';
import * as selectors from 'state-management/selectors';
import * as ua from 'state-management/actions/user.actions';
import * as ja from 'state-management/actions/jobs.actions';
import { getDatasets2, getSelectedDatasets, getPage, getViewMode } from 'state-management/selectors/datasets.selectors';
import { Message, MessageType } from 'state-management/models';

import { Angular5Csv } from 'angular5-csv/Angular5-csv';

import { last } from 'rxjs/operator/last';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { startWith } from 'rxjs/operator/startWith';
import { take } from 'rxjs/operator/take';

import { PageChangeEvent, SortChangeEvent } from '../dataset-table-pure/dataset-table-pure.component';

import * as rison from 'rison';
import { Subscription } from 'rxjs';
import { ViewMode } from 'state-management/state/datasets.store';

@Component({
  selector: 'dataset-table',
  templateUrl: './dataset-table.component.html',
  styleUrls: ['./dataset-table.component.scss']
})
export class DatasetTableComponent implements OnInit, OnDestroy {
  @Input() public datasets = [];
  @Output() private openDataset = new EventEmitter();
  @Output() private selectedSet = new EventEmitter<Array<any>>();

  private datasets$: Observable<Dataset[]>;
  private selectedSets$: Observable<Dataset[]>;
  private currentPage$: Observable<number>;
  private mode$: Observable<string>;
  private datasetCount$: Observable<number>;

  // compatibility analogs of observables
  private mode: ViewMode = 'view';
  private selectedSets: Dataset[] = [];

  private modes: string[] = ['archive', 'view', 'retrieve'];

  private loading$: Observable<boolean>;
  private limit$: Observable<number>;

  // These should be made part of the NgRX state management
  // and eventually be removed.
  private modeSubscription: Subscription;
  private selectedSetsSubscription: Subscription;
  private submitJobSubscription: Subscription;
  private jobErrorSubscription: Subscription;

  constructor(
    private router: Router,
    private configSrv: ConfigService,
    private route: ActivatedRoute,
    private store: Store<any>,
    public dialog: MatDialog,
  ) {
    this.datasetCount$ = this.store.select(selectors.datasets.getTotalSets);
    this.loading$ = this.store.select(selectors.datasets.getLoading);
  }

  ngOnInit() {
    this.datasets$ = this.store.pipe(select(getDatasets2));
    this.selectedSets$ = this.store.pipe(select(getSelectedDatasets));
    this.currentPage$ = this.store.pipe(select(getPage));
    this.limit$ = this.store.select(state => state.root.user.settings.datasetCount);
    this.mode$ = this.store.pipe(select(getViewMode));

    // Store concrete values of observables for compatibility
    this.modeSubscription = this.mode$.subscribe((mode: ViewMode) => {
      this.mode = mode;
    });

    this.selectedSetsSubscription = this.selectedSets$.subscribe(selectedSets =>
      this.selectedSets = selectedSets
    );

    // Use activated route here somehow
    /*this.store.select(state => state.root.dashboardUI.mode).subscribe(mode => {
      this.mode = mode;
      this.updateRowView(mode);
    })*/

    this.submitJobSubscription =
      this.store.select(selectors.jobs.submitJob).subscribe(
        ret => {
          if (ret && Array.isArray(ret)) {
            console.log(ret);
            this.store.dispatch(new dsa.ClearSelectionAction());
          }
        },
        error => {
          this.store.dispatch(new ua.ShowMessageAction({
            type: MessageType.Error,
            content: 'Job not Submitted'
          }));
        }
      );

    this.jobErrorSubscription =
      this.store.select(selectors.jobs.getError).subscribe(err => {
        if (err) {
          this.store.dispatch(new ua.ShowMessageAction({
            type: MessageType.Error,
            content: err.message,
          }));
        }
      });
  }

  ngOnDestroy() {
    this.modeSubscription.unsubscribe();
    this.selectedSetsSubscription.unsubscribe();
    this.submitJobSubscription.unsubscribe();
    this.jobErrorSubscription.unsubscribe();
  }

  onExportClick(): void {
    this.store.dispatch(new dsa.ExportToCsvAction());
  }

  /**
   * Handle changing of view mode and disabling selected rows
   * @param event
   * @param mode
   */
  onModeChange(event, mode: string): void {
    this.store.dispatch(new dsa.SetViewModeAction(mode));
  }

  /**
   * Return the classes for the view buttons based on what is selected
   * @param mode
   */
  getModeButtonClasses(mode): {[cls: string]: boolean} {
    return {
      [mode]: true,
      positive: this.mode === mode
    };
  }

  /**
   * Sends archive command for selected datasets (default includes all
   * datablocks for now) to Dacat API
   * @param {any} event - click handler (not currently used)
   * @memberof DashboardComponent
   */
  archiveClickHandle(event): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: 'auto',
      data: { title: 'Really archive?', question: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.archiveOrRetrieve(true);
      }
      // this.onClose.emit(result);
    });
  }

  /**
   * Sends retrieve command for selected datasets
   * @param {any} event - click handler (not currently used)
   * @memberof DashboardComponent
   */
  retrieveClickHandle(event): void {
    const destPath = '/archive/retrieve';
    const dialogRef = this.dialog.open(DialogComponent, {
      width: 'auto',
      data: { title: 'Really retrieve?', question: '', input: 'Destination: ' + destPath }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.archiveOrRetrieve(false, destPath);
      }
    });
  }

  /**
   * Handles the archive/retrieve for all datasets in the `selected` array.
   * Needs to feed back to the user if the selected datasets cannot have the
   * action performed
   * @memberof DashboardComponent
   */
  archiveOrRetrieve(archive: boolean, destPath = '/archive/retrieve/'): void {
    const msg = new Message();
    if (this.selectedSets.length > 0) {
      const job = new Job();
      job.jobParams = {};
      job.creationTime = new Date();
      const backupFiles = [];
      this.store
        .select(state => state.root.user)
        .take(1)
        .subscribe(user => {
          job.emailJobInitiator = user['email'];
          user = user['currentUser'];
          job.jobParams['username'] = user['username'] || undefined;
          if (!job.emailJobInitiator) {
            job.emailJobInitiator = user['profile'] ? user['profile']['email'] : user['email'];
          }
          this.selectedSets.forEach(set => {
            // if ('datablocks' in set && set['datablocks'].length > 0) {
            const fileObj = {};
            const fileList = [];
            fileObj['pid'] = set['pid'];
            if (set['datablocks'] && !archive) {
              set['datablocks'].forEach(d => {
                fileList.push(d['archiveId']);
              });
            }
            fileObj['files'] = fileList;
            backupFiles.push(fileObj);
            delete set['$$index'];
          });

          this.store.dispatch(new dsa.ClearSelectionAction());

          if (backupFiles.length === 0) {
            msg.type = MessageType.Error;
            msg.content = 'Selected datasets have no datablocks associated with them';
            this.store.dispatch(new ua.ShowMessageAction(msg));
          } else if (!job.emailJobInitiator) {
            msg.type = MessageType.Error;
            msg.content = 'No email for this user could be found, the job will not be submitted';
            this.store.dispatch(new ua.ShowMessageAction(msg));
          } else {
            job.datasetList = backupFiles;
            job.type = archive ? 'archive' : 'retrieve';
            this.store
              .select(state => state.root.user.settings.tapeCopies)
              .take(1)
              .subscribe(copies => {
                job.jobParams['tapeCopies'] = copies;
              });
            // TODO check username in job object
            // job.jobParams['username'] = user['username'];
            if (!archive) {
              // TODO fix the path here
              job.jobParams['destinationPath'] = destPath;
            }
            console.log(job);
            this.store.dispatch(new ja.SubmitAction(job));
          }
        });
    } else {
      msg.type = MessageType.Error;
      msg.content = 'No datasets selected';
      this.store.dispatch(new ua.ShowMessageAction(msg));
      this.store.dispatch(new dsa.ClearSelectionAction());
    }
  }

  onClick(dataset: Dataset): void {
    const pid = encodeURIComponent(dataset.pid);
    this.router.navigateByUrl('/dataset/' + pid);
  }

  onSelect(dataset: Dataset): void {
    this.store.dispatch(new dsa.SelectDatasetAction(dataset));
  }

  onDeselect(dataset: Dataset): void {
    this.store.dispatch(new dsa.DeselectDatasetAction(dataset));
  }

  onPageChange(event: PageChangeEvent): void {
    this.store.dispatch(new dsa.GoToPageAction(event.pageIndex));
  }

  onSortChange(event: SortChangeEvent): void {
    const {active: column, direction} = event;
    this.store.dispatch(new dsa.SortByColumnAction(column, direction));
  }

  rowClassifier(row: Dataset): string {
    if (row.datasetlifecycle && this.mode === 'archive'
      && (config.archiveable.indexOf(row.datasetlifecycle.archiveStatusMessage) !== -1) && row.size !== 0) {
      return 'row-archiveable';
    } else if (row.datasetlifecycle && this.mode === 'retrieve'
      && config.retrieveable.indexOf(row.datasetlifecycle.archiveStatusMessage) !== -1 && row.size !== 0) {
      return 'row-retrievable';
    } else if (row.size === 0) {
      return 'row-empty';
    } else {
      return 'row-generic';
    }
  }
}






/* Obsolete and/or "pensioned" methods
/*
/**
 * Options set based on selected datasets
 * This is used to determine which template to display for
 * archive or retrieval or both
 * @param set
 * @returns {string}
 * /
setOptions(set) {
  let options = '';
  const dl = set['datasetlifecycle'];
  if (dl && dl['isOnDisk']) {
    options += 'archive';
  }
  if (dl && (dl['isOnTape'] || dl['isOnDisk'])) {
    options += 'retrieve';
  }
  return options;
}
*/

  /*
  As far as I can see, this approach is limited and not useful with larger numbers of datasets. This
  should be done on query level instead, releiving the GUI significantly of having to deal with that
  logic.

  updateRowView(mode: string): void {
    this.store.dispatch(new dsa.ClearSelectionAction());

    const activeSets = [];

    if (this.datasets && this.datasets.length > 0 && (this.mode === 'archive' || this.mode === 'retrieve')) {
      for (let d = 0; d < this.datasets.length; d++) {
        const set = this.datasets[d];
        const msg = (set.datasetlifecycle && set.datasetlifecycle.archiveStatusMessage) || '';
        if (this.mode === 'archive') {
          if (set.datasetlifecycle && (config.archiveable.indexOf(set.datasetlifecycle.archiveStatusMessage) !== -1) && set.size > 0) {
            activeSets.push(set);
          }
        } else if (this.mode === 'retrieve') {
          if (set.datasetlifecycle && config.retrieveable.indexOf(set.datasetlifecycle.archiveStatusMessage) !== -1 && set.size > 0) {
            activeSets.push(set);
          }
        }
      }
      this.dataSource = new MatTableDataSource(activeSets);
    } else {
      this.dataSource = new MatTableDataSource(this.datasets);
    }
  }
  */
