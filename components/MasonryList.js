'use client'

import { useEffect, useMemo, useState } from 'react'

const DESKTOP_QUERY = '(min-width: 1024px)'

function estimateCardHeight(item) {
  const titleLength = String(item.title || '').length
  const titleLines = Math.max(1, Math.ceil(titleLength / 28))
  const textHeight = 150 + titleLines * 28

  if (!item.imageUrl) {
    return textHeight
  }

  return textHeight + 290
}

function distributeItems(items, columnCount) {
  const columns = Array.from({ length: columnCount }, () => ({
    height: 0,
    items: []
  }))

  items.forEach((item) => {
    const targetColumn = columns.reduce((shortest, column) =>
      column.height < shortest.height ? column : shortest
    )

    targetColumn.items.push(item)
    targetColumn.height += estimateCardHeight(item)
  })

  return columns.map((column) => column.items)
}

export default function MasonryList({
  items,
  className,
  columnClassName,
  columnCount = 3,
  renderItem
}) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY)
    const syncDesktopState = () => setIsDesktop(mediaQuery.matches)

    syncDesktopState()
    mediaQuery.addEventListener('change', syncDesktopState)

    return () => mediaQuery.removeEventListener('change', syncDesktopState)
  }, [])

  const columns = useMemo(
    () => (isDesktop ? distributeItems(items, columnCount) : [items]),
    [columnCount, isDesktop, items]
  )

  return (
    <ul className={className}>
      {columns.map((columnItems, columnIndex) => (
        <li className={columnClassName} key={columnIndex}>
          <ul>
            {columnItems.map((item) => renderItem(item))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
