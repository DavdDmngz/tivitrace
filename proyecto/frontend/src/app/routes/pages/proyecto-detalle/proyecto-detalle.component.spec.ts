import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleProyectoComponent } from './proyecto-detalle.component';

describe('DetalleProyectoComponent', () => {
  let component: DetalleProyectoComponent;
  let fixture: ComponentFixture<DetalleProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleProyectoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
