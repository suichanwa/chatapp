export interface TimestampOptions {
  locale?: string;
  time?: Intl.DateTimeFormatOptions;
  date?: Intl.DateTimeFormatOptions;
  className?: string;
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function formatTimestamp(
  ts: number,
  opts: TimestampOptions = {}
): { time: string; date: string } {
  const locale = opts.locale;
  const timeFmt = new Intl.DateTimeFormat(locale, opts.time ?? { hour: '2-digit', minute: '2-digit' });
  const dateFmt = new Intl.DateTimeFormat(locale, opts.date ?? { year: 'numeric', month: 'short', day: '2-digit' });
  const d = new Date(ts);
  return {
    time: timeFmt.format(d),
    date: dateFmt.format(d),
  };
}

export function renderTimestamp(ts: number, opts: TimestampOptions = {}): string {
  const { time, date } = formatTimestamp(ts, opts);
  const cls = opts.className ? ` ${opts.className}` : '';
  return `
    <div class="message-time${cls}">
      <span class="time">${escapeHtml(time)}</span>
      <span class="date">${escapeHtml(date)}</span>
    </div>
  `;
}