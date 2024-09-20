import { Component, inject } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PeriodicElement } from '../../data';
import { DataLoadingService } from '../../services/data-loading.service';
import { EditElementDialogComponent } from '../edit-element-dialog/edit-element-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { rxState } from '@rx-angular/state';
import { rxEffects } from '@rx-angular/state/effects';
import { RxIf } from '@rx-angular/template/if';

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
  ],
})
export class PeriodicTableComponent {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  dialog = inject(MatDialog);
  dataLoadingService = inject(DataLoadingService);
  selectedRow: PeriodicElement | null = null;

  private state = rxState<{
    filter: string;
    isLoading: boolean;
  }>(({ set }) => {
    set({ filter: '', isLoading: true });
  });

  isLoading = this.state.select('isLoading');

  readonly effects = rxEffects(({ register }) => {
    register(
      this.dataLoadingService
        .loadElements()
        .pipe(tap(() => this.state.set({ isLoading: false }))),
    );
    register(
      this.dataLoadingService.getElements().pipe(
        map((elements) => {
          this.dataSource.data = elements;
        }),
      ),
    );
    register(
      this.state.select('filter').pipe(
        debounceTime(2000),
        tap(() => this.state.set({ isLoading: false })),
        distinctUntilChanged(),
        map((filter) => {
          this.dataSource.filter = filter.trim().toLowerCase();
        }),
      ),
    );
  });

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.state.set({ filter: filterValue, isLoading: true });
  }

  openDialog(row: PeriodicElement): void {
    this.selectedRow = row;
    const dialogRef = this.dialog.open(EditElementDialogComponent, {
      width: 'auto',
      height: 'auto',
      data: row,
    });

    this.effects.register(
      dialogRef.afterClosed().pipe(
        tap((result) => {
          this.selectedRow = null;
          if (result !== undefined) {
            this.dataLoadingService.updateElements(result);
          }
        }),
      ),
    );
  }
}
