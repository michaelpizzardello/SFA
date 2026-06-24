import SearchIcon from './icons/SearchIcon'

// Soft pill search field with a leading magnifier (Ocula/Artsy style). Spread input props in.
export default function SearchField({ className = '', ...inputProps }) {
  return (
    <span className={`search${className ? ` ${className}` : ''}`}>
      <span className="search__icon" aria-hidden="true">
        <SearchIcon />
      </span>
      <input className="search__input" type="search" {...inputProps} />
    </span>
  )
}
