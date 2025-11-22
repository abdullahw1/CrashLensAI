import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'incident',
  title: 'Incident',
  type: 'document',
  fields: [
    defineField({
      name: 'incidentId',
      title: 'Incident ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endpoint',
      title: 'Endpoint',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'statusCode',
      title: 'Status Code',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: 'errorMessage',
      title: 'Error Message',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'stackTrace',
      title: 'Stack Trace',
      type: 'text',
    }),
    defineField({
      name: 'severity',
      title: 'Severity',
      type: 'string',
      options: {
        list: [
          {title: 'Critical', value: 'Critical'},
          {title: 'High', value: 'High'},
          {title: 'Medium', value: 'Medium'},
          {title: 'Low', value: 'Low'},
        ],
      },
    }),
    defineField({
      name: 'rootCause',
      title: 'Root Cause',
      type: 'text',
    }),
    defineField({
      name: 'suggestedFix',
      title: 'Suggested Fix',
      type: 'text',
    }),
    defineField({
      name: 'analyzedBy',
      title: 'Analyzed By',
      type: 'string',
    }),
    defineField({
      name: 'explanation',
      title: 'Explanation (Legacy)',
      type: 'text',
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'requestBody',
      title: 'Request Body (JSON)',
      type: 'text',
    }),
  ],
  preview: {
    select: {
      title: 'endpoint',
      subtitle: 'errorMessage',
      statusCode: 'statusCode',
      severity: 'severity',
    },
    prepare(selection) {
      const {title, subtitle, statusCode, severity} = selection
      const severityLabel = severity ? ` [${severity}]` : ''
      return {
        title: `${statusCode} - ${title}${severityLabel}`,
        subtitle: subtitle,
      }
    },
  },
})
