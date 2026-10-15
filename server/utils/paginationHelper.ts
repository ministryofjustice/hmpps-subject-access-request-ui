const getPageLinks = ({
  visiblePageLinks = 1,
  numberOfPages = 1,
  currentPage = 1,
  isAdmin = false,
  searchOptions,
}: {
  visiblePageLinks: number
  numberOfPages: number
  currentPage: number
  isAdmin: boolean
  searchOptions: SearchOptions
}): Array<{ text: string; href: string; selected: boolean }> => {
  let pageStartNumber = 1
  let pageEndNumber = visiblePageLinks
  const pageLinks = []

  if (numberOfPages <= visiblePageLinks) {
    pageEndNumber = numberOfPages
  } else {
    const endPageOffset = currentPage + (visiblePageLinks - 1)

    if (endPageOffset === numberOfPages) {
      pageStartNumber = endPageOffset - (visiblePageLinks - 1)
      pageEndNumber = endPageOffset
    } else if (endPageOffset > numberOfPages) {
      pageStartNumber = numberOfPages - visiblePageLinks + 1
      pageEndNumber = numberOfPages
    } else {
      pageStartNumber = currentPage
      pageEndNumber = endPageOffset
    }
  }

  const basePath = isAdmin ? '/admin/reports' : '/reports'

  for (let pageIndex = pageStartNumber; pageIndex <= pageEndNumber; pageIndex += 1) {
    const params = new URLSearchParams()
    params.append('page', String(pageIndex))

    if (searchOptions.searchTerm) {
      params.append('keyword', searchOptions.searchTerm)
    }
    if (searchOptions.completed) {
      params.append('status', 'completed')
    }
    if (searchOptions.pending) {
      params.append('status', 'pending')
    }
    if (searchOptions.errored) {
      params.append('status', 'errored')
    }
    if (searchOptions.overdue) {
      params.append('status', 'overdue')
    }

    pageLinks.push({
      text: pageIndex.toString(),
      // TODO: Genericise pagination helper - pass in URL
      href: `${basePath}?${params.toString()}`,
      selected: pageIndex === currentPage,
    })
  }

  return pageLinks
}

export default getPageLinks
