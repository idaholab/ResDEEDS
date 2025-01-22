import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentItemsComponent } from './recent-items.component';

describe('RecentItemsComponent', () => {
  let component: RecentItemsComponent;
  let fixture: ComponentFixture<RecentItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
