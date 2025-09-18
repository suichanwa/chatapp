export class MobileTouch {
  setup(): void {
    console.log('📱 MobileTouch: Setup complete');
    
    // Add touch-friendly event handlers
    this.setupTouchGestures();
    this.setupSwipeHandlers();
    this.preventDefaultBehaviors();
  }

  private setupTouchGestures(): void {
    // Handle touch events for better mobile UX
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
  }

  private setupSwipeHandlers(): void {
    let startX = 0;
    let startY = 0;

    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      // Detect swipe gestures
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 50) { // Minimum swipe distance
          if (diffX > 0) {
            this.onSwipeLeft();
          } else {
            this.onSwipeRight();
          }
        }
      }
    }, { passive: true });
  }

  private preventDefaultBehaviors(): void {
    // Prevent pull-to-refresh on mobile
    document.addEventListener('touchmove', (e) => {
      if (document.body.scrollTop === 0) {
        e.preventDefault();
      }
    }, { passive: false });

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  private handleTouchStart(e: TouchEvent): void {
    // Add visual feedback for touch
    const target = e.target as HTMLElement;
    if (target.classList.contains('chat-item') || target.classList.contains('button')) {
      target.classList.add('touch-active');
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    // Remove visual feedback
    const target = e.target as HTMLElement;
    if (target.classList.contains('touch-active')) {
      setTimeout(() => {
        target.classList.remove('touch-active');
      }, 150);
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    // Handle scrolling and prevent unwanted behaviors
    const target = e.target as HTMLElement;
    if (target.classList.contains('touch-active')) {
      target.classList.remove('touch-active');
    }
  }

  private onSwipeLeft(): void {
    console.log('📱 Swipe left detected');
    // Could be used to open debug panel or navigate
  }

  private onSwipeRight(): void {
    console.log('📱 Swipe right detected');
    // Could be used to close panels or go back
  }
}