| ordinal_position | column_name                  | data_type                | is_nullable |
| ---------------- | ---------------------------- | ------------------------ | ----------- |
| 1                | id                           | uuid                     | NO          |
| 2                | title                        | character varying        | NO          |
| 3                | subtitle                     | text                     | YES         |
| 4                | slug                         | character varying        | NO          |
| 6                | image_1_alt                  | character varying        | YES         |
| 11               | image_1_url                  | text                     | YES         |
| 12               | social_share_image           | text                     | YES         |
| 13               | introduction                 | text                     | NO          |
| 14               | current_data_research        | jsonb                    | YES         |
| 15               | reflective_question          | text                     | YES         |
| 16               | anonymous_case               | jsonb                    | YES         |
| 17               | psychological_analysis       | jsonb                    | NO          |
| 18               | practical_recommendations    | jsonb                    | NO          |
| 19               | call_to_action               | text                     | YES         |
| 20               | empathetic_closing           | jsonb                    | YES         |
| 21               | additional_resources         | text                     | YES         |
| 23               | faq_data                     | jsonb                    | YES         |
| 24               | summary_points               | jsonb                    | YES         |
| 25               | bibliography                 | jsonb                    | YES         |
| 26               | related_articles             | jsonb                    | YES         |
| 28               | meta_description             | character varying        | YES         |
| 29               | meta_keywords                | text                     | YES         |
| 31               | canonical_url                | text                     | YES         |
| 32               | schema_markup                | jsonb                    | YES         |
| 34               | category                     | character varying        | YES         |
| 35               | subcategory                  | character varying        | YES         |
| 36               | tags                         | ARRAY                    | YES         |
| 37               | target_audience              | character varying        | YES         |
| 38               | age_range                    | character varying        | YES         |
| 39               | topic_complexity             | character varying        | YES         |
| 42               | recommended_products         | jsonb                    | YES         |
| 43               | professional_recommendations | jsonb                    | YES         |
| 44               | author_name                  | character varying        | NO          |
| 45               | author_email                 | character varying        | YES         |
| 46               | author_bio                   | text                     | YES         |
| 47               | author_credentials           | text                     | YES         |
| 48               | author_photo_url             | text                     | YES         |
| 49               | author_social_links          | jsonb                    | YES         |
| 50               | status                       | character varying        | YES         |
| 52               | published_at                 | timestamp with time zone | YES         |
| 54               | is_featured                  | boolean                  | YES         |
| 55               | is_trending                  | boolean                  | YES         |
| 56               | is_professional_content      | boolean                  | YES         |
| 57               | sort_order                   | integer                  | YES         |
| 58               | created_at                   | timestamp with time zone | YES         |
| 59               | updated_at                   | timestamp with time zone | YES         |
| 63               | reading_time_minutes         | integer                  | YES         |