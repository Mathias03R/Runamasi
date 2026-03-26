export function detectService(text: string) {
  const t = text.toLowerCase()

  const rules = [
    {
      service: 'Gasfitero',
      keywords: ['caño', 'agua', 'tubería', 'fuga', 'grifo']
    },
    {
      service: 'Electricista',
      keywords: ['luz', 'electricidad', 'corto', 'enchufe']
    },
    {
      service: 'Cerrajero',
      keywords: ['puerta', 'llave', 'cerradura']
    },
    {
      service: 'Técnico de electrodomésticos',
      keywords: ['lavadora', 'refrigeradora', 'microondas']
    },
    {
      service: 'Pintor',
      keywords: ['pintar', 'pared']
    },
    {
      service: 'Carpintero',
      keywords: ['madera', 'mueble', 'puerta rota']
    },
    {
      service: 'Jardinero',
      keywords: ['jardín', 'plantas']
    },
    {
      service: 'Limpieza',
      keywords: ['limpiar', 'sucio']
    },
    {
      service: 'Soporte técnico',
      keywords: ['pc', 'computadora', 'internet']
    }
  ]

  for (const rule of rules) {
    if (rule.keywords.some(k => t.includes(k))) {
      return rule.service
    }
  }

  return null
}