/**
 * Sanity Schema for Incident Document Type
 * 
 * To deploy this schema to your Sanity project:
 * 1. Create a Sanity project: npx sanity init
 * 2. Add this schema to your Sanity studio's schemas folder
 * 3. Deploy: npx sanity deploy
 * 
 * Or use Sanity Studio to manually create the schema with these fields.
 */

module.exports = {
  name: 'incident',
  type: 'document',
  title: 'Incident',
  fields: [
    {
      name: 'endpoint',
      type: 'string',
      title: 'Endpoint',
      validation: Rule => Rule.required()
    },
    {
      name: 'statusCode',
      type: 'number',
      title: 'Status Code',
      validation: Rule => Rule.required().integer()
    },
    {
      name: 'errorMessage',
      type: 'text',
      title: 'Error Message',
      validation: Rule => Rule.required()
    },
    {
      name: 'explanation',
      type: 'text',
      title: 'Explanation'
    },
    {
      name: 'suggestedFix',
      type: 'text',
      title: 'Suggested Fix'
    },
    {
      name: 'timestamp',
      type: 'datetime',
      title: 'Timestamp',
      validation: Rule => Rule.required()
    },
    {
      name: 'requestBody',
      type: 'text',
      title: 'Request Body (JSON)'
    }
  ]
};
