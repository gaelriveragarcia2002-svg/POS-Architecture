import { Component } from '@angular/core';
import { TestFormComponent } from './test-form.component';

@Component({
	selector: 'app-test-form-demo',
	standalone: true,
	template: `
        <app-test-form/>
    `,
 imports: [TestFormComponent],
})
export class TestFormDemoComponent {}
  