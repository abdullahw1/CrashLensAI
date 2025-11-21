import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'incident',
  title: 'Incident',
  type: 'document',
  fields: [
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
      name: 'explanation',
      title: 'Explanation',
      type: 'text',
    }),
    defineField({
      name: 'suggestedFix',
      title: 'Suggested Fix',
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
    },
    prepare(selection) {
      const {title, subtitle, statusCode} = selection
      return {
        title: `${statusCode} - ${title}`,
        subtitle: subtitle,
      }
    },
  },
})
