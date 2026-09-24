const getPageLinks = ({
  visiblePageLinks = 1,
  numberOfPages = 1,
  currentPage = 1,
  searchTerm,
  isAdmin = false,
}: {
  visiblePageLinks: number
  numberOfPages: number
  currentPage: number
  searchTerm: string
  isAdmin: boolean
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
    pageLinks.push({
      text: pageIndex.toString(),
      // TODO: Genericise pagination helper - pass in URL
      href: `${basePath}?page=${pageIndex}&keyword=${searchTerm}`,
      selected: pageIndex === currentPage,
    })
  }

  return pageLinks
}

export default getPageLinks
