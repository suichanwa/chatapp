export class SecureClipboard {
  private value: string | null = null;
  private expiresAt = 0;
  private timer: NodeJS.Timeout | null = null;

  write(text: string, ttlMs = 120_000): void {
    this.value = text;
    this.expiresAt = Date.now() + ttlMs;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.clear(), ttlMs);
    this.timer.unref?.();
  }

  read(): string {
    if (!this.value) return '';
    if (Date.now() > this.expiresAt) {
      this.clear();
      return '';
    }
    return this.value;
  }

  clear(): void {
    this.value = null;
    this.expiresAt = 0;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

export const secureClipboard = new SecureClipboard();