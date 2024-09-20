import {
  Component,
  effect,
  inject,
  signal,
  Signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PeriodicElement } from '../../data';
import { DataLoadingService } from '../../services/data-loading.service';
import { EditElementDialogComponent } from '../edit-element-dialog/edit-element-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {
  debounceTime,
  distinctUntilChanged,
  endWith,
  first,
  map,
  startWith,
  Subject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { rxState } from '@rx-angular/state';
import { rxEffects } from '@rx-angular/state/effects';
import { RxIf } from '@rx-angular/template/if';
import { ReactiveFormsModule } from '@angular/forms';
import { RxLet } from '@rx-angular/template/let';

@Component({
  selector: 'app-periodic-table',
  templateUrl: './periodic-table.component.html',
  styleUrl: './periodic-table.component.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatInputModule,
    EditElementDialogComponent,
    RxIf,
    RxLet,
    ReactiveFormsModule,
  ],
})
export class PeriodicTableComponent {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource();
  private state = rxState<{
    elements: PeriodicElement[];
    filter: string;
    isLoading: boolean;
  }>(({ set }) => {
    set({ elements: [], filter: '', isLoading: true });
  });
  effects = rxEffects();

  dialog = inject(MatDialog);
  filterSubject = new Subject<string>();
  filterSubscription: Subscription = new Subscription();

  selectedRow: PeriodicElement | null = null;
  isLoading = this.state.select('isLoading');
  elements$ = this.state.select('elements');

  constructor(private dataLoadingService: DataLoadingService) {
    this.effects.register(
      this.dataLoadingService
        .loadElements()
        .pipe(map((elements) => ({ elements, isLoading: false }))),
      (result) => {
        this.dataSource.data = result.elements;

        this.dataLoadingService.setElements(result.elements);
        this.state.set(result);
      },
    );

    this.effects.register(
      this.dataLoadingService.getElements().pipe(
        map((elements) => {
          console.log('dataLoadingService.getElements()', elements);
          this.dataSource.data = elements;
        }),
      ),
    );

    this.effects.register(
      this.state.select('filter').pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        map((filter) => {
          this.dataSource.filter = filter.trim().toLowerCase();
        }),
      ),
    );
    this.effects.register(
      this.state.select('elements').pipe(
        tap((elements) => {
          this.dataSource.data = elements;
        }),
      ),
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    console.log('filter', filterValue);
    this.state.set({ filter: filterValue, isLoading: false });
  }

  openDialog(row: PeriodicElement): void {
    this.selectedRow = row;
    const dialogRef = this.dialog.open(EditElementDialogComponent, {
      width: 'auto',
      height: 'auto',
      data: row,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.selectedRow = null;
      if (result !== undefined) {
        this.dataLoadingService.updateElements(result);
      }
    });
  }
}
