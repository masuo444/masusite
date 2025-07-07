import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'series',
  title: 'シリーズ',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'シリーズ名',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'スラッグ',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: '説明',
      type: 'text',
      rows: 4
    }),
    defineField({
      name: 'startDate',
      title: '開始日',
      type: 'date'
    }),
    defineField({
      name: 'endDate',
      title: '終了日',
      type: 'date'
    }),
    defineField({
      name: 'coverImage',
      title: 'カバー画像',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'featured',
      title: '注目シリーズ',
      type: 'boolean',
      initialValue: false
    })
  ],
  preview: {
    select: {
      title: 'name',
      media: 'coverImage'
    }
  }
})