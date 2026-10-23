const HOUR = 60 * 60 * 1000

// MaiMemo starts a new study day at 04:00 in Beijing, including before midnight UTC.
export function memoStudyDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(now.getTime() - 4 * HOUR))
}
