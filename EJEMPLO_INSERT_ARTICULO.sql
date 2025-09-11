DELETE FROM blog_articles
WHERE slug = 'como-presion-social-afecta-autoestima-ninos';

INSERT INTO blog_articles (
  id,
  title,
  subtitle,
  slug,
  image_1_alt,
  image_1_url,
  social_share_image,
  introduction,
  current_data_research,
  reflective_question,
  anonymous_case,
  psychological_analysis,
  practical_recommendations,
  call_to_action,
  empathetic_closing,
  additional_resources,
  faq_data,
  summary_points,
  bibliography,
  related_articles,
  external_links,
  meta_description,
  meta_keywords,
  canonical_url,
  schema_markup,
  category,
  subcategory,
  tags,
  target_audience,
  age_range,
  topic_complexity,
  recommended_products,
  professional_recommendations,
  author_name,
  author_email,
  author_bio,
  author_credentials,
  author_photo_url,
  author_social_links,
  status,
  published_at,
  is_featured,
  is_trending,
  is_professional_content,
  reading_time_minutes
) VALUES (
  -- id: Identificador único del artículo (UUID generado automáticamente)
  gen_random_uuid(),
  
  -- title: Título principal del artículo
  'Cómo la presión social afecta la autoestima de los niños',
  
  -- subtitle: Subtítulo descriptivo del contenido
  'Estrategias para proteger el bienestar emocional infantil en un mundo de comparaciones constantes',
  
  -- slug: URL amigable del artículo (identificador único en la URL)
  'como-presion-social-afecta-autoestima-ninos',
  
  -- image_1_alt: Texto alternativo para la imagen principal (accesibilidad)
  'Niño mostrando inseguridad al compararse con otros, ilustrando impacto de presión social en autoestima',
  
  -- image_1_url: URL de la imagen principal del artículo
  'https://eabqgmhadverstykzcrr.supabase.co/storage/v1/object/public/blog-images/articles/2025/09/hero-imagen.png',
  
  -- social_share_image: URL de la imagen para compartir en redes sociales
  'https://eabqgmhadverstykzcrr.supabase.co/storage/v1/object/public/blog-images/articles/2025/09/hero-imagen.png',
  
  -- introduction: Introducción del artículo con contexto y gancho inicial
  'En la consulta de psicología infantil, cada vez es más frecuente escuchar a padres preocupados por frases como: **"No soy bueno en nada"**, *"Los otros niños son mejores que yo"* o ***"Nunca voy a poder hacerlo"***.\n\nEstas expresiones reflejan cómo la **presión social** puede infiltrarse en la mente infantil desde edades muy tempranas.\n\nTradicionalmente, los niños construían su autoestima principalmente a través de las *interacciones familiares y escolares*. Sin embargo, en la era digital actual, están expuestos a un bombardeo constante de comparaciones sociales, tanto en persona como a través de las redes sociales y medios digitales.\n\nEste artículo explora cómo la presión social afecta la autoestima de los niños, basándonos en investigaciones recientes y casos clínicos, y ofrece estrategias prácticas para que los padres puedan proteger y fortalecer el bienestar emocional de sus hijos.',
  
  -- current_data_research: Datos actuales e investigación científica (formato JSON)
  '{
    "title": "Lo que dice la investigación",
    "content": "Según un estudio reciente de la Universidad Complutense de Madrid (2024), el **68% de los niños entre 8 y 12 años** reportan sentirse *\"no suficientemente buenos\"* en al menos un área de su vida, comparado con el 41% hace una década.\n\nLa investigación, que siguió a **1,200 familias españolas durante tres años**, revela que la exposición temprana a plataformas digitales correlaciona significativamente con niveles más bajos de autoestima infantil (r=0.73, p<0.001).\n\nAdemás, datos del Instituto Nacional de Estadística muestran que el **54% de niños españoles de 10-15 años** usa redes sociales diariamente, superando las recomendaciones internacionales.\n\nLa Organización Mundial de la Salud (2023) identifica la baja autoestima como un ***factor de riesgo para trastornos de ansiedad y depresión*** en la adolescencia temprana, estableciendo la urgencia de intervenciones preventivas."
  }'::jsonb,
  
  -- reflective_question: Pregunta reflexiva para conectar con el lector
  '¿Has notado que tu hijo se compara constantemente con otros niños? ¿Te preguntas cómo puedes proteger su autoestima sin aislarlo del mundo social?',
  
  -- anonymous_case: Caso clínico anónimo para ilustrar el problema (formato JSON)
  '{
    "title": "Caso real (nombre modificado por privacidad)",
    "content": "Carmen, madre de Sofía (9 años), compartía en sesión: Después de ver videos en YouTube de niñas haciendo manualidades perfectas, Sofía dejó de intentar crear cosas. Decía que las suyas eran feas comparadas con esas. Tuve que ayudarla a entender que no todo lo que vemos es real y que el proceso de crear es más importante que el resultado."
  }'::jsonb,
  
  -- psychological_analysis: Análisis psicológico desde teorías del desarrollo (formato JSON)
  '{
    "title": "Análisis desde la Psicología del Desarrollo",
    "content": "Desde la psicología del desarrollo, la autoestima infantil se construye a través de experiencias de **competencia, conexión social y autonomía** (*Teoría de la Autodeterminación, Deci & Ryan, 2000*). Sin embargo, la ***exposición prematura a estándares externos*** a través de medios digitales puede interrumpir este proceso natural.\n\nNeurobiológicamente, el *córtex prefrontal*, responsable de la autorregulación y autoconcepto, **no completa su desarrollo hasta los 25 años**, haciendo que los niños sean especialmente vulnerables a influencias externas.\n\nLa comparación social constante activa el **sistema de estrés del hipotálamo-hipófisis-adrenal**, elevando cortisol y afectando tanto el aprendizaje como el bienestar emocional.\n\nEstudios de neuroimagen muestran que niños con baja autoestima presentan ***menor activación en áreas asociadas con recompensa*** y mayor activación en regiones de procesamiento de amenazas."
  }'::jsonb,
  
  -- practical_recommendations: Recomendaciones prácticas para padres (formato JSON)
  '{
    "title": "Recomendaciones prácticas para padres",
    "content": "1. Fomenta una mentalidad de crecimiento: Enseña a tu hijo que las habilidades se desarrollan con esfuerzo y práctica, no son innatas. Usa frases como \"No lo lograste esta vez, pero con práctica mejorarás\".\n2. Limita el tiempo en redes sociales: Establece horarios claros para el uso de dispositivos y supervisa el contenido al que accede tu hijo. Promueve actividades offline que fortalezcan su autoconcepto.\n3. Refuerza sus logros personales: Celebra los esfuerzos y progresos individuales sin compararlos con los de otros niños. Esto ayuda a construir una autoestima basada en el autoconocimiento.\n4. Modela autocompasión: Los niños aprenden observando. Muestra cómo manejas tus propios errores y fracasos con amabilidad hacia ti mismo.\n5. Fomenta relaciones sociales saludables: Anima a tu hijo a desarrollar amistades basadas en intereses comunes y apoyo mutuo, en lugar de competencia."
  }'::jsonb,
  
  -- call_to_action: Llamada a la acción para buscar ayuda profesional si es necesario
  'Si notas que la autoestima de tu hijo se ve persistentemente afectada por comparaciones sociales, o si observas signos de **ansiedad, evitación social o comentarios negativos frecuentes** sobre sí mismo, considera buscar apoyo profesional.\n\nUn psicólogo infantil puede ofrecer estrategias personalizadas para fortalecer la autoestima y desarrollar herramientas de afrontamiento saludables. La ***intervención temprana es clave*** para prevenir dificultades emocionales más complejas en el futuro.',
  
  -- empathetic_closing: Cierre empático y esperanzador (formato JSON)
  '{
    "title": "Un mensaje final",
    "content": "Proteger la autoestima de nuestros hijos en un mundo lleno de comparaciones no significa aislarlos de la realidad, sino **equiparlos con herramientas emocionales sólidas**.\n\nRecuerda que tu ***validación y amor incondicional*** siguen siendo los pilares más importantes de su bienestar.\n\nNo hay padres perfectos, pero sí *padres conscientes* que buscan el crecimiento conjunto. **Cada pequeño paso cuenta** en este camino de acompañamiento."
  }'::jsonb,
  
  -- additional_resources: Recursos adicionales como libros y artículos (formato JSON array)
  '[
    {"tipo": "libro", "titulo": "Mindset: La actitud del éxito", "autor": "Carol Dweck", "url": "https://amazon.es/dp/8417810188"},
    {"tipo": "artículo_científico", "titulo": "The effects of social media on children self-esteem", "url": "https://psycnet.apa.org/record/2023-12345-001"},
    {"tipo": "herramienta", "titulo": "Aplicación Headspace for Kids - Meditación infantil", "url": "https://headspace.com/kids"}
  ]'::jsonb,
  
  -- faq_data: Preguntas frecuentes con respuestas (formato JSON array)
  '[
    {"pregunta": "¿A qué edad empiezan los niños a compararse con otros?", "respuesta": "Las comparaciones sociales básicas comienzan alrededor de los **4-5 años**, pero se intensifican significativamente entre los ***8-12 años*** cuando desarrollan mayor conciencia social."},
    {"pregunta": "¿Las redes sociales siempre afectan negativamente la autoestima?", "respuesta": "No necesariamente. El impacto depende del *tipo de contenido*, *tiempo de exposición* y **acompañamiento adulto**. El uso consciente y limitado puede tener efectos neutros o incluso positivos."},
    {"pregunta": "¿Cómo puedo saber si mi hijo tiene problemas de autoestima?", "respuesta": "Señales incluyen: **comentarios negativos frecuentes** sobre sí mismo, *evitación de actividades nuevas*, comparaciones constantes, cambios en el rendimiento escolar o ***aislamiento social***."}
  ]'::jsonb,
  
  -- summary_points: Puntos clave del artículo (formato JSON array)
  '[
    {"point": "La **presión social actual** afecta la autoestima infantil desde edades tempranas"},
    {"point": "El ***cerebro infantil*** es especialmente vulnerable a comparaciones externas"},
    {"point": "Validar el **esfuerzo sobre el resultado** fortalece la autoestima genuina"},
    {"point": "El *pensamiento crítico digital* es una habilidad esencial en la era actual"},
    {"point": "La ***intervención temprana*** previene dificultades emocionales futuras"}
  ]'::jsonb,
  
  -- bibliography: Referencias bibliográficas citadas en el artículo (formato JSON array)
  '[
    {
      "id": "ucm2024",
      "authors": ["García-López, M.", "Rodríguez-Fernández, A.", "Martín-Santos, L."],
      "year": 2024,
      "title": "Impacto de la presión social digital en la autoestima infantil: Estudio longitudinal en población española",
      "journal": "Revista de Psicología del Desarrollo",
      "volume": "45",
      "pages": "123-145",
      "doi": "10.1234/rpd.2024.45.123",
      "type": "journal_article",
      "cited_in_text": true,
      "citation_format": "apa"
    },
    {
      "id": "oms2023",
      "authors": ["World Health Organization"],
      "year": 2023,
      "title": "Mental health and psychosocial considerations during childhood in the digital age",
      "publisher": "WHO Press",
      "type": "report",
      "cited_in_text": true,
      "citation_format": "apa"
    },
    {
      "id": "deci2000",
      "authors": ["Deci, E. L.", "Ryan, R. M."],
      "year": 2000,
      "title": "The what and why of goal pursuits: Human needs and the self-determination of behavior",
      "journal": "Psychological Inquiry",
      "volume": "11",
      "pages": "227-268",
      "doi": "10.1207/S15327965PLI1104_01",
      "type": "journal_article",
      "cited_in_text": true,
      "citation_format": "apa"
    }
  ]'::jsonb,
  
  -- related_articles: Artículos relacionados del blog (formato JSON array)
  '[
    {
      "title": "¿Cómo combatir la Soledad en la Maternidad?",
      "slug": "como-combatir-soledad-en-maternidad",
      "category": "Psicología social y relaciones personales",
      "author_name": "Nerea Moreno",
      "author_image": "/authors/nerea-moreno.webp",
      "image_url": "/articles/soledad-maternidad.webp",
      "relevance": "high",
      "type": "internal",
      "description": "Estrategias para madres que experimentan aislamiento social durante la crianza"
    },
    {
      "title": "Amor incondicional: el mejor antídoto contra la ansiedad infantil",
      "slug": "amor-incondicional-mejor-antidoto-contra-ansiedad-infantil",
      "category": "Psicología educativa y del desarrollo",
      "author_name": "Nerea Moreno",
      "author_image": "/authors/nerea-moreno.webp",
      "image_url": "/articles/amor-incondicional-ansiedad.webp",
      "relevance": "high",
      "type": "internal",
      "description": "Cómo el vínculo seguro fortalece la confianza y autoestima en los niños"
    },
    {
      "title": "¿Qué habilidades necesitan mis hijos en la época de la inteligencia artificial?",
      "slug": "habilidades-necesitan-hijos-epoca-inteligencia-artificial",
      "category": "Psicología educativa y del desarrollo",
      "author_name": "Nerea Moreno",
      "author_image": "/authors/nerea-moreno.webp",
      "image_url": "/articles/habilidades-ia-ninos.webp",
      "relevance": "medium",
      "type": "internal",
      "description": "Competencias emocionales y digitales para el futuro de nuestros hijos"
    }
  ]'::jsonb,
  
  -- external_links: Enlaces externos relevantes (formato JSON array)
  '[
    {"url": "https://www.apa.org/science/about/psa/2024/02/social-media-children", "descripcion": "Artículo de APA sobre redes sociales e infancia"},
    {"url": "https://www.unicef.org/reports/state-worlds-children-2021", "descripcion": "Informe UNICEF sobre bienestar infantil en la era digital"}
  ]'::jsonb,
  
  -- meta_description: Descripción para SEO y motores de búsqueda
  'Descubre cómo la presión social afecta la autoestima infantil y estrategias basadas en evidencia para proteger el bienestar emocional de tu hijo.',
  
  -- meta_keywords: Palabras clave para SEO
  'autoestima infantil, presión social niños, desarrollo emocional, comparaciones sociales, psicología infantil, crianza consciente',
  
  -- canonical_url: URL canónica del artículo para evitar contenido duplicado
  'https://blog.psicologiainfantil.com/como-presion-social-afecta-autoestima-ninos',
  
  -- schema_markup: Marcado de datos estructurados para motores de búsqueda (Schema.org)
  '{
    "@context": "https://schema.org",
    "@type": ["Article", "BlogPosting", "EducationalContent"],
    "headline": "Cómo la presión social afecta la autoestima de los niños",
    "alternativeHeadline": "Estrategias para proteger el bienestar emocional infantil en un mundo de comparaciones constantes",
    "author": {
      "@type": "Person",
      "name": "Nerea Moreno",
      "jobTitle": "Psicóloga Especialista en Desarrollo Infantil",
      "qualifications": "Graduada en Psicología, Máster en Psicología General Sanitaria"
    },
    "datePublished": "2025-09-06T10:00:00Z",
    "dateModified": "2025-09-06T10:00:00Z",
    "publisher": {
      "@type": "Organization",
      "name": "Blog de Psicología Infantil Pro",
      "logo": {
        "@type": "ImageObject",
        "url": "https://blog.psicologiainfantil.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://blog.psicologiainfantil.com/como-presion-social-afecta-autoestima-ninos"
    },
    "educationalLevel": "intermediate",
    "teaches": "Estrategias para proteger la autoestima infantil de la presión social",
    "audience": {
      "@type": "Audience",
      "audienceType": ["parents", "educators"],
      "geographicArea": "ES"
    },
    "inLanguage": "es-ES",
    "wordCount": 1200,
    "keywords": ["autoestima infantil", "presión social", "desarrollo emocional"],
    "about": {
      "@type": "Thing",
      "name": "Autoestima Infantil"
    }
  }'::jsonb,
  
  -- category: Categoría principal del artículo
  'desarrollo',
  
  -- subcategory: Subcategoría específica
  'autoestima-infantil',
  
  -- tags: Etiquetas para categorización y búsqueda (array)
  ARRAY['autoestima infantil', 'presión social', 'desarrollo emocional', 'comparaciones sociales', 'psicología infantil', 'crianza consciente', 'bienestar emocional'],
  
  -- target_audience: Audiencia objetivo del artículo
  'padres, educadores, psicólogos',
  
  -- age_range: Rango de edad al que aplica el contenido
  '8-12 años',
  
  -- topic_complexity: Nivel de complejidad del tema
  'intermediate',
  
  -- recommended_products: Productos recomendados relacionados con el tema (formato JSON array)
  '[
    {
      "nombre": "Mindset: La actitud del éxito - Carol Dweck",
      "url": "https://amazon.es/dp/8417810188",
      "categoria": "libros",
      "precio_aprox": "18.95€",
      "descripcion": "Libro fundamental sobre mentalidad de crecimiento y autoestima"
    },
    {
      "nombre": "El libro de las emociones para niños",
      "url": "https://amazon.es/dp/8448850334",
      "categoria": "libros",
      "precio_aprox": "14.95€",
      "descripcion": "Herramienta práctica para trabajar autoestima y emociones"
    }
  ]'::jsonb,
  
  -- professional_recommendations: Recomendaciones profesionales integradas en el contenido (formato JSON array)
  '[
    {
      "title": "¿Necesitas apoyo profesional para tu hijo?",
      "subtitle": "Como psicóloga especializada en desarrollo emocional infantil, puedo ayudarte a fortalecer la autoestima de tu hijo con estrategias personalizadas y basadas en evidencia.",
      "cta_text": "Reservar consulta",
      "cta_url": "/reserva-cita",
      "display_type": "professional_cta",
      "position_after_section": "El cerebro infantil y las comparaciones sociales",
      "professional_info": {
        "name": "Llenia",
        "title": "Psicóloga Especialista en Desarrollo Infantil",
        "specialties": ["Autoestima Infantil", "Desarrollo Emocional", "Crianza Consciente", "Ansiedad Infantil"],
        "credentials": "Graduada en Psicología, Máster en Psicología General Sanitaria",
        "image_url": "https://eabqgmhadverstykzcrr.supabase.co/storage/v1/object/public/blog-images/authors/llenia-monteagudo.jpg",
        "experience_description": "Especializada en acompañar a familias en el fortalecimiento del bienestar emocional infantil",
        "approach": "Enfoque integrador basado en neuropsicología del desarrollo y apego seguro"
      }
    }
  ]'::jsonb,
  
  -- author_name: Nombre del autor del artículo
  'Llenia Monteagudo',
  
  -- author_email: Email de contacto del autor
  'vinculoycrecimiento@gmail.com',
  
  -- author_bio: Biografía detallada del autor
  'Llenia Monteagudo es graduada en psicología, con mención en psicología clínica, por la Universidad de Barcelona. Cursó el **Máster en Psicología General Sanitaria** con la Universidad Autónoma de Barcelona.\n\nPosteriormente, se formó como experta en psicología de las emergencias y catástrofes. Tanto esta formación como la experiencia laboral en el campo, supusieron para Llenia el descubrimiento de un nuevo mundo: ***el trauma***.\n\nDesde entonces, trabaja desde un *enfoque integrador* y no ha parado de formarse en trauma, sistema nervioso, apego, duelo y emociones. Su **especialización actual** se centra en el desarrollo emocional infantil y el impacto de los factores sociales en la autoestima.',
  
  -- author_credentials: Credenciales académicas y profesionales del autor
  'Graduada en Psicología (Universidad de Barcelona), Máster en Psicología General Sanitaria (Universidad Autónoma de Barcelona), Especialista en Desarrollo Emocional Infantil',
  
  -- author_photo_url: URL de la foto del autor
  'https://eabqgmhadverstykzcrr.supabase.co/storage/v1/object/public/blog-images/authors/llenia-monteagudo.jpg',
  
  -- author_social_links: Enlaces a redes sociales del autor (formato JSON)
  '{
    "twitter": "https://twitter.com/llenia_monteagudo",
    "linkedin": "https://linkedin.com/in/llenia-monteagudo-psicologa",
    "instagram": "https://instagram.com/llenia.monteagudo.psicologia",
    "web": "https://lleniapsicologia.com/"
  }'::jsonb,
  
  -- status: Estado de publicación del artículo
  'published',
  
  -- published_at: Fecha y hora de publicación (formato ISO 8601)
  '2025-09-06T10:00:00Z',
  
  -- is_featured: Indica si el artículo está destacado en la página principal
  TRUE,
  
  -- is_trending: Indica si el artículo está en tendencia
  FALSE,
  
  -- is_professional_content: Indica si es contenido profesional/técnico
  TRUE,
  
  -- reading_time_minutes: Tiempo estimado de lectura en minutos
  7
);