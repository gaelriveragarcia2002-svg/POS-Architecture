import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilAuthorization } from './util-authorization';

describe('UtilAuthorization', () => {
  let component: UtilAuthorization;
  let fixture: ComponentFixture<UtilAuthorization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilAuthorization],
    }).compileComponents();

    fixture = TestBed.createComponent(UtilAuthorization);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
