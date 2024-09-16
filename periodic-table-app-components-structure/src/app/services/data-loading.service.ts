import { Injectable, signal, WritableSignal } from '@angular/core';
import { ELEMENT_DATA, PeriodicElement } from '../data';
import { Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataLoadingService {
  private elementsSignal = signal<PeriodicElement[]>([]);

  loadElements(): Observable<PeriodicElement[]> {
    return of(ELEMENT_DATA).pipe(delay(1000));
  }

  getElements(): WritableSignal<PeriodicElement[]> {
    return this.elementsSignal;
  }

  setElements(elements: PeriodicElement[]): void {
    this.elementsSignal.set(elements);
  }

  updateElements(updateElement: PeriodicElement): void {
    return this.elementsSignal.update((elements) => {
      return elements.map((element) =>
        element.position === updateElement.position ? updateElement : element,
      );
    });
  }
}
