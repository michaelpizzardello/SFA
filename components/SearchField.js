// Underline search input (§4.11 .field--line — reserved for toolbars + search overlay).
// Spread input props in; the caller supplies the accessible label.
export default function SearchField({ className = '', ...inputProps }) {
  return <input className={`field field--line${className ? ` ${className}` : ''}`} type="search" {...inputProps} />
}
