import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'pattern',
  title: 'Pattern',
  type: 'document',
  fields: [
    defineField({
      name: 'patternId',
      title: 'Pattern ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'patternType',
      title: 'Pattern Type',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'affectedEndpoints',
      title: 'Affected Endpoints',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'frequency',
      title: 'Frequency',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: 'firstSeen',
      title: 'First Seen',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lastSeen',
      title: 'Last Seen',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'detectedBy',
      title: 'Detected By',
      type: 'string',
    }),
    defineField({
      name: 'likelyRootCause',
      title: 'Likely Root Cause',
      type: 'text',
    }),
  ],
  preview: {
    select: {
      title: 'patternType',
      frequency: 'frequency',
      endpoints: 'affectedEndpoints',
    },
    prepare(selection) {
      const {title, frequency, endpoints} = selection
      const endpointCount = endpoints ? endpoints.length : 0
      return {
        title: title,
        subtitle: `${frequency} occurrences across ${endpointCount} endpoint(s)`,
      }
    },
  },
})
