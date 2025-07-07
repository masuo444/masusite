import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'episode',
  title: 'エピソード',
  type: 'document',
  fields: [
    defineField({
      name: 'episodeNumber',
      title: 'エピソード番号',
      type: 'number',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'title',
      title: 'タイトル',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'スラッグ',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'series',
      title: 'シリーズ',
      type: 'reference',
      to: {type: 'series'},
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'date',
      title: '日付',
      type: 'date',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'location',
      title: '場所',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'country',
      title: '国',
      type: 'string',
      options: {
        list: [
          {title: '🇺🇸 アメリカ', value: 'usa'},
          {title: '🇪🇸 スペイン', value: 'spain'},
          {title: '🇵🇭 セブ島', value: 'cebu'},
          {title: '🇲🇾 マレーシア', value: 'malaysia'},
          {title: '🇮🇪 アイルランド', value: 'ireland'},
          {title: '🇩🇰 デンマーク', value: 'denmark'},
          {title: '🇸🇪 スウェーデン', value: 'sweden'},
          {title: '🇵🇱 ポーランド', value: 'poland'},
          {title: '🇳🇴 ノルウェー', value: 'norway'},
          {title: '🇦🇪 ドバイ', value: 'dubai'},
          {title: '🇫🇷 フランス', value: 'france'},
          {title: '🇬🇧 イギリス', value: 'uk'},
        ]
      }
    }),
    defineField({
      name: 'content',
      title: 'コンテンツ',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: '標準', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: '引用', value: 'blockquote'},
          ],
          lists: [
            {title: '箇条書き', value: 'bullet'},
            {title: '番号リスト', value: 'number'}
          ],
          marks: {
            decorators: [
              {title: '太字', value: 'strong'},
              {title: '斜体', value: 'em'},
              {title: 'コード', value: 'code'}
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url'
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'image',
          options: {hotspot: true}
        }
      ],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'notionPageId',
      title: 'Notion ページID',
      type: 'string',
      description: '元のNotionページのID（移行用）'
    }),
    defineField({
      name: 'tags',
      title: 'タグ',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'featured',
      title: '注目記事',
      type: 'boolean',
      initialValue: false
    })
  ],
  preview: {
    select: {
      title: 'title',
      episodeNumber: 'episodeNumber',
      location: 'location',
      date: 'date'
    },
    prepare(selection) {
      const {title, episodeNumber, location, date} = selection
      return {
        title: `第${episodeNumber}話: ${title}`,
        subtitle: `${location} | ${date}`
      }
    }
  }
})