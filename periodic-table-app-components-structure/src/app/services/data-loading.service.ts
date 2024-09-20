import { Injectable } from '@angular/core';
import { ELEMENT_DATA, PeriodicElement } from '../data';
import { Observable, of, delay } from 'rxjs';
import { rxState } from '@rx-angular/state';

@Injectable({
  providedIn: 'root',
})
export class DataLoadingService {
  private state = rxState<{ elements: PeriodicElement[] }>(({ set }) => {
    set({ elements: [] });
  });

  loadElements(): Observable<PeriodicElement[]> {
    return of(ELEMENT_DATA).pipe(delay(1000));
  }

  getElements(): Observable<PeriodicElement[]> {
    return this.state.select('elements');
  }

  setElements(elements: PeriodicElement[]): void {
    this.state.set({ elements });
  }

  updateElements(updateElement: PeriodicElement): void {
    this.state.set('elements', ({ elements }) => {
      return elements.map((element) =>
        element.position === updateElement.position ? updateElement : element,
      );
    });
  }
}
