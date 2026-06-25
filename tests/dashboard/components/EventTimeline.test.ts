import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import EventTimeline from '../../../src/dashboard/components/events/EventTimeline.vue'
import { normalizeEventRecord } from '../../../src/shared'
import { fixtureRuns } from '../../fixtures/runs'

const events = (fixtureRuns[0]?.events ?? []).map(normalizeEventRecord)

describe('EventTimeline', () => {
  it('renders chronological event breadcrumbs', () => {
    const wrapper = mount(EventTimeline, {
      props: {
        events,
      },
    })

    expect(wrapper.text()).toContain('Timeline')
    expect(wrapper.text()).toContain('3 events')
    expect(wrapper.text()).toContain('Workflow started')
    expect(wrapper.text()).toContain('model.turn.completed')
  })

  it('emits the inspected event when an event is selected', async () => {
    const wrapper = mount(EventTimeline, {
      props: {
        events,
      },
    })

    await wrapper.findAll('button.event-button')[1]?.trigger('click')

    expect(wrapper.emitted('inspect')?.[0]?.[0]).toMatchObject({
      id: 'evt-2',
      type: 'model.turn.completed',
    })
  })
})
