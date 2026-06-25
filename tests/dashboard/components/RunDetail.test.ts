import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import RunDetail from '../../../src/dashboard/components/runs/RunDetail.vue'
import { mergeUsage, normalizeEventRecord, normalizeRunRecord } from '../../../src/shared'
import { fixtureRuns } from '../../fixtures/runs'

const run = normalizeRunRecord(fixtureRuns[0])
const events = (fixtureRuns[0]?.events ?? []).map(normalizeEventRecord)
const usage = mergeUsage(events.map((event) => event.usage))
const spans = events.map((event, index) => ({
  id: event.id,
  label: event.message ?? event.type,
  category: event.category,
  leftPercent: index * 10,
  widthPercent: 10,
  durationMs: event.durationMs,
}))

function mountRunDetail(props: Partial<InstanceType<typeof RunDetail>['$props']> = {}) {
  return mount(RunDetail, {
    props: {
      run,
      events,
      timeline: events,
      spans,
      usage,
      loading: false,
      eventsLoading: false,
      error: null,
      eventsError: null,
      ...props,
    },
  })
}

describe('RunDetail', () => {
  it('renders loading, error, and empty states', () => {
    expect(mountRunDetail({ loading: true }).text()).toContain('Loading run detail')
    expect(mountRunDetail({ error: 'No access to this run.' }).text()).toContain('No access to this run.')
    expect(mountRunDetail({ run: null }).text()).toContain('Select a workflow run')
  })

  it('renders the selected run detail sections', () => {
    const wrapper = mountRunDetail()

    expect(wrapper.text()).toContain('daily-report')
    expect(wrapper.text()).toContain('run-success-1')
    expect(wrapper.text()).toContain('Input')
    expect(wrapper.text()).toContain('Result')
    expect(wrapper.text()).toContain('Timeline')
    expect(wrapper.text()).toContain('Waterfall')
    expect(wrapper.text()).toContain('Logs')
    expect(wrapper.text()).toContain('gpt-test')
  })

  it('renders event loading and error states inside selected run detail', () => {
    expect(mountRunDetail({ eventsLoading: true }).text()).toContain('Loading events')
    expect(mountRunDetail({ eventsError: 'Events are unavailable.' }).text()).toContain('Events are unavailable.')
  })

  it('opens and closes the raw event drawer when inspecting an event', async () => {
    const wrapper = mountRunDetail()

    expect(wrapper.find('[aria-label="Raw event payload"]').exists()).toBe(false)

    await wrapper.find('button.event-button').trigger('click')

    expect(wrapper.find('[aria-label="Raw event payload"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Raw event')
    expect(wrapper.text()).toContain('workflow.started')

    await wrapper.get('button[aria-label="Close raw event drawer"]').trigger('click')

    expect(wrapper.find('[aria-label="Raw event payload"]').exists()).toBe(false)
  })
})
