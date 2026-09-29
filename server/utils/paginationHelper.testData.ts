const getSingleRow = (selected: boolean, page: number): { href: string; selected: boolean; text: string } => {
  return {
    href: `/reports?page=${page}&status=completed&status=pending&status=errored&status=overdue`,
    selected,
    text: page.toString(),
  }
}

const getSingleAdminRow = (selected: boolean, page: number): { href: string; selected: boolean; text: string } => {
  return {
    href: `/admin/reports?page=${page}&status=completed&status=pending&status=errored&status=overdue`,
    selected,
    text: page.toString(),
  }
}

const paginationTestCases = [
  {
    description: 'Show 1 page, 1 page available, current page is 1',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 1,
      currentPage: 1,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(true, 1)],
  },
  {
    description: 'Show 1 page, 2 pages available, current page is 1',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 2,
      currentPage: 1,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(true, 1)],
  },
  {
    description: 'Show 1 page, 2 pages available, current page is 2',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 2,
      currentPage: 2,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(true, 2)],
  },
  {
    description: 'Show 1 page, 3 pages available, current page is 1',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 1,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(true, 1)],
  },
  {
    description: 'Show 1 page, 3 pages available, current page is 2',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 2,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(true, 2)],
  },
  {
    description: 'Show 1 page, 3 pages available, current page is 3',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(true, 3)],
  },
  {
    description: 'Show 2 pages, 1 page available, current page is 1',
    params: {
      visiblePageLinks: 2,
      numberOfPages: 1,
      currentPage: 1,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(true, 1)],
  },
  {
    description: 'Show 2 pages, 2 pages available, current page is 1',
    params: {
      visiblePageLinks: 2,
      numberOfPages: 2,
      currentPage: 1,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(true, 1), getSingleRow(false, 2)],
  },
  {
    description: 'Show 2 pages, 2 pages available, current page is 2',
    params: {
      visiblePageLinks: 2,
      numberOfPages: 2,
      currentPage: 2,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(false, 1), getSingleRow(true, 2)],
  },
  {
    description: 'Show 2 pages, 3 pages available, current page is 1',
    params: {
      visiblePageLinks: 2,
      numberOfPages: 3,
      currentPage: 1,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(true, 1), getSingleRow(false, 2)],
  },
  {
    description: 'Show 2 pages, 3 pages available, current page is 2',
    params: {
      visiblePageLinks: 2,
      numberOfPages: 3,
      currentPage: 2,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(true, 2), getSingleRow(false, 3)],
  },
  {
    description: 'Show 2 pages, 3 pages available, current page is 3',
    params: {
      visiblePageLinks: 2,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleRow(false, 2), getSingleRow(true, 3)],
  },
  {
    description: 'Show 1 admin page, 1 page available, current page is 1',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 1,
      currentPage: 1,
      isAdmin: true,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleAdminRow(true, 1)],
  },
  {
    description: 'Show 1 admin page, 2 pages available, current page is 1',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 2,
      currentPage: 1,
      isAdmin: true,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleAdminRow(true, 1)],
  },
  {
    description: 'Show 1 admin page, 2 pages available, current page is 2',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 2,
      currentPage: 2,
      isAdmin: true,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleAdminRow(true, 2)],
  },
  {
    description: 'Show 1 admin page, 3 pages available, current page is 1',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 1,
      isAdmin: true,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleAdminRow(true, 1)],
  },
  {
    description: 'Show 1 admin page, 3 pages available, current page is 2',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 2,
      isAdmin: true,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleAdminRow(true, 2)],
  },
  {
    description: 'Show 1 admin page, 3 pages available, current page is 3',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: true,
      searchOptions: {
        searchTerm: '',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    result: [getSingleAdminRow(true, 3)],
  },
]

const searchOptionTestCases = [
  {
    description: 'admin false, search term empty, pending false, completed false, errored false, overdue false',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: false,
      searchOptions: {
        searchTerm: '',
        pending: false,
        completed: false,
        errored: false,
        overdue: false,
      },
    },
    expected: [
      {
        href: `/reports?page=3`,
        selected: true,
        text: '3',
      },
    ],
  },
  {
    description: 'admin true, search term empty, pending false, completed false, errored false, overdue false',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: true,
      searchOptions: {
        searchTerm: '',
        pending: false,
        completed: false,
        errored: false,
        overdue: false,
      },
    },
    expected: [
      {
        href: `/admin/reports?page=3`,
        selected: true,
        text: '3',
      },
    ],
  },
  {
    description: 'admin false, search term not empty, pending false, completed false, errored false, overdue false',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: false,
      searchOptions: {
        searchTerm: 'hello',
        pending: false,
        completed: false,
        errored: false,
        overdue: false,
      },
    },
    expected: [
      {
        href: `/reports?page=3&keyword=hello`,
        selected: true,
        text: '3',
      },
    ],
  },
  {
    description: 'admin true, search term not empty, pending false, completed false, errored false, overdue false',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: true,
      searchOptions: {
        searchTerm: 'hello',
        pending: false,
        completed: false,
        errored: false,
        overdue: false,
      },
    },
    expected: [
      {
        href: `/admin/reports?page=3&keyword=hello`,
        selected: true,
        text: '3',
      },
    ],
  },
  {
    description: 'admin false, search term not empty, pending true, completed false, errored false, overdue false',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: false,
      searchOptions: {
        searchTerm: 'hello',
        pending: true,
        completed: false,
        errored: false,
        overdue: false,
      },
    },
    expected: [
      {
        href: `/reports?page=3&keyword=hello&status=pending`,
        selected: true,
        text: '3',
      },
    ],
  },
  {
    description: 'admin true, search term not empty, pending true, completed false, errored false, overdue false',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: true,
      searchOptions: {
        searchTerm: 'hello',
        pending: true,
        completed: false,
        errored: false,
        overdue: false,
      },
    },
    expected: [
      {
        href: `/admin/reports?page=3&keyword=hello&status=pending`,
        selected: true,
        text: '3',
      },
    ],
  },
  {
    description: 'admin false, search term not empty, pending true, completed true, errored false, overdue false',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: false,
      searchOptions: {
        searchTerm: 'hello',
        pending: true,
        completed: true,
        errored: false,
        overdue: false,
      },
    },
    expected: [
      {
        href: `/reports?page=3&keyword=hello&status=completed&status=pending`,
        selected: true,
        text: '3',
      },
    ],
  },
  {
    description: 'admin false, search term not empty, pending true, completed true, errored true, overdue false',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: false,
      searchOptions: {
        searchTerm: 'hello',
        pending: true,
        completed: true,
        errored: true,
        overdue: false,
      },
    },
    expected: [
      {
        href: `/reports?page=3&keyword=hello&status=completed&status=pending&status=errored`,
        selected: true,
        text: '3',
      },
    ],
  },
  {
    description: 'admin true, search term not empty, pending true, completed true, errored true, overdue false',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: true,
      searchOptions: {
        searchTerm: 'hello',
        pending: true,
        completed: true,
        errored: true,
        overdue: false,
      },
    },
    expected: [
      {
        href: `/admin/reports?page=3&keyword=hello&status=completed&status=pending&status=errored`,
        selected: true,
        text: '3',
      },
    ],
  },
  {
    description: 'admin false, search term not empty, pending true, completed true, errored true, overdue true',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: false,
      searchOptions: {
        searchTerm: 'hello',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    expected: [
      {
        href: `/reports?page=3&keyword=hello&status=completed&status=pending&status=errored&status=overdue`,
        selected: true,
        text: '3',
      },
    ],
  },
  {
    description: 'admin true, search term not empty, pending true, completed true, errored true, overdue true',
    params: {
      visiblePageLinks: 1,
      numberOfPages: 3,
      currentPage: 3,
      isAdmin: true,
      searchOptions: {
        searchTerm: 'hello',
        pending: true,
        completed: true,
        errored: true,
        overdue: true,
      },
    },
    expected: [
      {
        href: `/admin/reports?page=3&keyword=hello&status=completed&status=pending&status=errored&status=overdue`,
        selected: true,
        text: '3',
      },
    ],
  },
]

export default { paginationTestCases, searchOptionTestCases }
