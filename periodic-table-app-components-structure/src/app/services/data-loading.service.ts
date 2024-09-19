import { Injectable, Signal } from '@angular/core';
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
  private elementsSignal = this.state.signal('elements');

  loadElements(): Observable<PeriodicElement[]> {
    return of(ELEMENT_DATA).pipe(delay(1000));
  }

  getElements(): Signal<PeriodicElement[]> {
    console.log('get');
    return this.elementsSignal;
  }

  setElements(elements: PeriodicElement[]): void {
    this.state.set({ elements });
  }

  updateElements(updateElement: PeriodicElement): void {
    this.state.set('elements', ({ elements }) =>
      elements.map((element) =>
        element.position === updateElement.position ? updateElement : element,
      ),
    );
    console.log('updateElement', updateElement);
  }
}
