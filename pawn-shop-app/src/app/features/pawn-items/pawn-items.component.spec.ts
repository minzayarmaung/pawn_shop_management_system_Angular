import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PawnItemsComponent } from './pawn-items.component';

describe('PawnItemsComponent', () => {
  let component: PawnItemsComponent;
  let fixture: ComponentFixture<PawnItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PawnItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PawnItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
