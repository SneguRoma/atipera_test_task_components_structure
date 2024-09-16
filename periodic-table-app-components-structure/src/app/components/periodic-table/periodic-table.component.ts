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
  first,
  Subject,
  Subscription,
  tap,
} from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';

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
  ],
})
export class PeriodicTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource();
  elements: Signal<PeriodicElement[]> = signal<PeriodicElement[]>([]);
  dialog = inject(MatDialog);
  filterSubject = new Subject<string>();
  filterSubscription: Subscription = new Subscription();
  isLoading = true;
  selectedRow: PeriodicElement | null = null;

  constructor(private dataLoadingService: DataLoadingService) {
    effect(() => {
      this.dataSource.data = this.elements();
    });
  }
  ngOnInit() {
    this.dataLoadingService
      .loadElements()
      .pipe(first())
      .subscribe((elements) => {
        this.dataLoadingService.setElements(elements);
        this.isLoading = false;
      });
    this.elements = this.dataLoadingService.getElements();

    this.filterSubscription = this.filterSubject
      .pipe(
        debounceTime(2000),
        tap(() => {
          this.isLoading = false;
        }),
        distinctUntilChanged(),
      )
      .subscribe((filterValue) => {
        this.dataSource.filter = filterValue.trim().toLowerCase();
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.isLoading = true;
    this.filterSubject.next(filterValue);
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

  ngOnDestroy(): void {
    this.filterSubscription.unsubscribe();
  }
}
