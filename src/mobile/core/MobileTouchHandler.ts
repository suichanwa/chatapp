import type { Component } from '../../renderer/types/components';
import { MobileTouch } from '../features/MobileTouch';

export class MobileTouchHandler implements Component {
  private touch = new MobileTouch();

  async initialize(): Promise<void> {
    this.touch.setup();
  }

  cleanup(): void {
    // No-op for now
  }
}