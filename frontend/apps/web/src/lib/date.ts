import dayjs from 'dayjs'

/** YYYY-MM-DD */
export function formatDate(value: string | Date): string {
  return dayjs(value).format('YYYY-MM-DD')
}

/** YYYY-MM-DD HH시 mm분 */
export function formatDateTime(value: string | Date): string {
  return dayjs(value).format('YYYY-MM-DD HH시 mm분')
}

/** dayjs 인스턴스를 API 파라미터용 YYYY-MM-DD 문자열로 변환 */
export function toDateString(d: dayjs.Dayjs): string {
  return d.format('YYYY-MM-DD')
}
