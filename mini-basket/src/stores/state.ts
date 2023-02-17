import { IRootState } from '@/stores/interfaces'

export default (): IRootState => ({
  root: true,
  basketLink: '/basket',
  orderOverviewLink: '',

  open: false,
  needUpdate: true,
  groupsView: false,

  summaryData: {
    material: {
      count: 0,
      positionCount: 0,
      total: 0,
    },
    apetito: {
      count: 0,
      positionCount: 0,
      total: 0,
    },
    hawaFF: {
      count: 0,
      positionCount: 0,
      total: 0,
    },
    summary: {
      count: 0,
      positionCount: 0,
      total: 0,
    },
  },

  detailedData: {},
})
