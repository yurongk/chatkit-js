import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import type { ChatKitControl } from './control';
import { ChatKitElement } from './element';

@Component({
  selector: 'xpert-chatkit',
  standalone: true,
  imports: [ChatKitElement],
  inputs: ['control'],
  template: '<xpertai-chatkit [control]="control"></xpertai-chatkit>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      xpertai-chatkit {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class ChatKit {
  control!: ChatKitControl;
}
