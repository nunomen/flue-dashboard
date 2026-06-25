import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import RunTable from '../../../src/dashboard/components/runs/RunTable.vue'
import { normalizeRunSummary } from '../../../src/shared'
import { fixtureRuns } from '../../fixtures/runs'

const runs = fixtureRuns.map(normalizeRunSummary)

describe('RunTable', () => {
  it('renders the loading state', () => {
    const wrapper = mount(RunTable, {
      props: {
        runs: [],
        selectedRunId: null,
        loading: true,
      },
    })

    expect(wrapper.text()).toContain('Loading runs')
  })

  it('renders the empty state', () => {
    const wrapper = mount(RunTable, {
      props: {
        runs: [],
        selectedRunId: null,
        loading: false,
      },
    })

    expect(wrapper.text()).toContain('No workflow runs')
    expect(wrapper.text()).toContain('Runs will appear here')
  })

  it('renders run rows and emits selection events', async () => {
    const wrapper = mount(RunTable, {
      props: {
        runs,
        selectedRunId: 'run-success-1',
        loading: false,
      },
    })

    expect(wrapper.text()).toContain('daily-report')
    expect(wrapper.text()).toContain('invoice-sync')
    expect(wrapper.get('tr.run-row-selected').text()).toContain('run-success-1')

    await wrapper.findAll('tbody tr')[1]?.trigger('click')

    expect(wrapper.emitted('select')).toEqual([['run-failed-1']])
  })
})
