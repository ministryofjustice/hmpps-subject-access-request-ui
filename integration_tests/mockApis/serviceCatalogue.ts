const getServiceList = () => {
  const payload = [
    {
      id: 351,
      name: 'hmpps-prisoner-search',
      environments: [{ id: 47254, url: 'https://prisoner-search-dev.prison.service.justice.gov.uk' }],
    },
    { id: 211, name: 'hmpps-book-secure-move-api', environments: [] },
    {
      id: 175,
      name: 'hmpps-prisoner-search-indexer',
      environments: [{ id: 47270, url: 'https://prisoner-search-indexer-dev.prison.service.justice.gov.uk' }],
    },
  ]
  return payload
}
