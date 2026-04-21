/**
 * Gaming Day shared defaults.
 */

const DEFAULT_REGISTRATION_URL = 'https://pcbsystempr-cyber.github.io/Registro-GD/';
const DEFAULT_REGISTRATION_API = {
  endpoint: '',
  readAction: 'listRegistrations',
  writeAction: 'createRegistration',
  apiKey: '',
  apiKeyHeader: 'X-Gaming-Day-Key'
};

if (typeof window !== 'undefined') {
  window.GAMING_DAY_REGISTRATION_API = Object.assign({}, DEFAULT_REGISTRATION_API, window.GAMING_DAY_REGISTRATION_API || {});
}

const DEFAULT_PROXIMO_TORNEO = {
  status: 'cancelado',
  date: '27 de febrero de 2026',
  time: '8:00 AM',
  title: 'TORNEO CANCELADO',
  message: 'Este evento ha sido cancelado. Mantente atento para futuras fechas.'
};

const DEFAULT_REGLAS = [
  'Comportamiento respetuoso: No se tolerará lenguaje ofensivo ni acoso. Los participantes deben tratar a todos con cortesía y respeto en todo momento.',
  'Fair play (Juego limpio): Cualquier intento de hacer trampa (cheats, hacks, exploit de bugs, etc.) resultará en descalificación inmediata.',
  'Llegar a tiempo: El jugador o equipo que no se presente en el horario establecido perderá la partida por incomparecencia.',
  'Uso de dispositivos y software: Solo se permitirá el uso de hardware y software aprobado previamente por los organizadores. No se permitirá la modificación de los dispositivos durante el evento.',
  'No fumar: El consumo de tabaco o productos relacionados está prohibido en las instalaciones del evento.',
  'Prohibición de armas: No se permitirá el ingreso con ningún tipo de arma, incluidas armas blancas o de fuego. La seguridad es prioridad.',
  'Comida y bebidas: Los participantes deberán cuidar el espacio y los equipos. Evitar derramar alimentos o bebidas sobre los dispositivos de juego.',
  'Comportamiento adecuado en las áreas comunes: Mantén siempre un comportamiento apropiado en áreas compartidas, como pasillos, baños y zonas de descanso. Los equipos deben respetar el espacio de los demás jugadores.',
  'Responsabilidad de los equipos: Cada equipo es responsable de su propio equipo y pertenencias. En caso de pérdida o daño de equipos, los organizadores no se hacen responsables.'
];

const DEFAULT_GALERIA = [
  {
    image: './Galeria de fotos/imagen1.jpeg',
    caption: 'Trabajo en equipo y competencia sana.'
  },
  {
    image: './Galeria de fotos/imagen2.jpeg',
    caption: 'Participantes disfrutando del evento.'
  },
  {
    image: './Galeria de fotos/imagen3.jpeg',
    caption: 'Carreras emocionantes en Mario Kart.'
  },
  {
    image: './Galeria de fotos/imagen4.jpeg',
    caption: 'Ambiente lleno de energía gamer.'
  },
  {
    image: './Galeria de fotos/imagen5.jpeg',
    caption: 'Carreras emocionantes en Mario Kart.'
  },
  {
    image: './Galeria de fotos/imagen6.jpeg',
    caption: 'Todos unidos como familia.'
  }
];

const DEFAULT_PAGE_CONTENT = {
  header: {
    title: 'Gaming Day',
    subtitle: 'Torneo de videojuegos',
    pcbLabel: 'Visita PCB System',
    pcbMobileLabel: 'PCB',
    pcbHref: 'https://pcbsystempr-cyber.github.io/pcbsystem/index.html#inicio'
  },
  notification: {
    visible: true,
    title: 'Avisos Importantes',
    message: '✅ Inscripciones abiertas hasta el 20 de abril • 📍 Salón de Computec • ⏰ 10:00 AM'
  },
  hero: {
    title: '¡Prepárate para el Gaming Day!',
    subtitle: 'Únete a la competencia de videojuegos de la escuela. Abierto a estudiantes de todos los grados y niveles.',
    primaryButtonLabel: '¡Registrarme Ahora!',
    primaryButtonHref: DEFAULT_REGISTRATION_URL,
    secondaryButtonLabel: 'Ver reglas',
    secondaryButtonHref: '#rules',
    countdownLabel: 'Tiempo para el próximo Gaming Day',
    countdownUnits: {
      days: 'Días',
      hours: 'Horas',
      minutes: 'Minutos',
      seconds: 'Segundos'
    },
    countdownPreviewValues: {
      days: '00',
      hours: '19',
      minutes: '59',
      seconds: '12'
    },
    countdownTarget: '2026-04-20T10:00:00',
    liveMessage: '🎮 ¡El evento está en curso!'
  },
  about: {
    title: '¿Qué es Gaming Day?',
    body: 'Gaming Day es un evento organizado por el curso de Computec que busca fomentar la competencia sana, el trabajo en equipo y el interés por las disciplinas digitales.',
    objectiveTitle: 'Objetivo',
    objectiveBody: 'Reunir a la comunidad estudiantil alrededor del gaming responsable y el aprendizaje colaborativo.'
  },
  games: {
    title: 'Juegos disponibles',
    description: 'Los siguientes juegos mostrados a continuación son los que están disponibles para el Gaming Day. Selecciona tu favorito, revisa la modalidad y el horario, y asegúrate de completar tu inscripción antes de la fecha límite.',
    items: [
      { title: 'Mario Kart', href: 'mario-kart.html', style: 'primary', badge: '' },
      { title: 'NBA', href: 'nba.html', style: 'secondary', badge: '' },
      { title: 'Mortal Kombat', href: 'mortal-kombat.html', style: 'primary', badge: '' },
      { title: 'Smash Bros', href: 'smash-bros.html', style: 'secondary', badge: '' },
      { title: 'Impostor', href: 'impostor.html', style: 'primary', badge: 'NUEVO' }
    ]
  },
  upcoming: {
    title: 'Próximo Torneo',
    description: 'Mantente al día con el próximo torneo de Gaming Day. ¡No te lo pierdas!'
  },
  schedule: {
    title: 'Horarios del gaming',
    columns: [
      {
        title: 'Por la mañana',
        items: [
          '08:00 - 11:50 | Gaming',
          '11:50 - 12:50 | Almuerzo',
          '12:50 - 2:15 | Gaming'
        ],
        secondaryTitle: 'Lugar',
        secondaryItems: ['Salón de Computec']
      },
      {
        title: 'Detalles del evento',
        items: [
          '📍 Salón de Computec',
          '🎮 Mario Kart, NBA, Mortal Kombat, Smash Bros, Impostor',
          '🏆 Formato de eliminación directa por juego',
          '📋 Registro previo obligatorio',
          '👥 Abierto a todos los estudiantes'
        ]
      }
    ]
  },
  bracket: {
    title: '🏆 Tabla de Clasificación',
    description: 'Los resultados se actualizarán durante el evento. Sigue el progreso de cada juego aquí.',
    rows: [
      { game: 'Mario Kart', first: 'Por definir', second: 'Por definir', third: 'Por definir' },
      { game: 'NBA 2K', first: 'Por definir', second: 'Por definir', third: 'Por definir' },
      { game: 'Mortal Kombat', first: 'Por definir', second: 'Por definir', third: 'Por definir' },
      { game: 'Smash Bros', first: 'Por definir', second: 'Por definir', third: 'Por definir' },
      { game: 'Impostor', first: 'Por definir', second: 'Por definir', third: 'Por definir' }
    ]
  },
  rules: {
    title: 'Reglas y conducta',
    description: 'Para asegurar una competencia justa y respetuosa, todas las participantes deben aceptar las siguientes reglas:'
  },
  galleryMeta: {
    title: '🎮 Galería de Fotos',
    subtitle: 'Revive los momentos más épicos de ediciones anteriores del Gaming Day'
  },
  trailers: {
    title: 'Trailers de los Juegos',
    description: 'Mira los trailers oficiales de los juegos disponibles en el Gaming Day.',
    videos: [
      {
        title: 'Mario Kart 8 Deluxe',
        description: 'Carreras repletas de acción y diversión',
        embedUrl: 'https://www.youtube.com/embed/tKlRN2YpxRE'
      },
      {
        title: 'NBA 2K26',
        description: 'La experiencia de basketball más realista',
        embedUrl: 'https://www.youtube.com/embed/Mh57YWNaQC4'
      },
      {
        title: 'Mortal Kombat 11',
        description: 'Lucha épica con fatalitys brutales',
        embedUrl: 'https://www.youtube.com/embed/uhKaNvwTC7w'
      },
      {
        title: 'Super Smash Bros',
        description: 'El fighting game definitivo de Nintendo',
        embedUrl: 'https://www.youtube.com/embed/WShCN-AYHqA'
      }
    ],
    impostor: {
      title: 'Impostor - Documentación',
      description: 'Haz clic en cada imagen para ver en tamaño completo',
      images: [
        { src: '../pdf 0.jpg', alt: 'PDF Impostor 1' },
        { src: '../pdf 1.jpg', alt: 'PDF Impostor 2' },
        { src: '../pdf 2.jpg', alt: 'PDF Impostor 3' },
        { src: '../pdf 3.jpg', alt: 'PDF Impostor 4' }
      ]
    }
  },
  register: {
    title: 'Registro',
    description: '¡Regístrate ahora para participar en el Gaming Day! Completa el formulario a continuación.',
    buttonLabel: 'Registrarme',
    buttonHref: DEFAULT_REGISTRATION_URL,
    disclaimer: 'Al registrarte, confirmas que has leído y aceptas el reglamento del Gaming Day. El incumplimiento de las normas podrá conllevar penalidades o descalificación, según determine la organización.'
  },
  verifier: {
    title: '🔍 Verificador de Registro',
    description: '¿Ya te registraste? Verifica tu estado ingresando tu email, nombre o código de jugador.',
    placeholder: 'Ingresa tu email, nombre o código',
    buttonLabel: 'Verificar',
    successPrefix: '✅ ¡Encontrado!',
    successSuffix: 'tu registro está confirmado. Te vemos en el evento. 🎮',
    notFoundMessage: '❌ No encontramos registros con esos datos. Asegúrate de completar tu registro.',
    registrations: [
      { email: 'jugador1@example.com', name: 'Carlos' },
      { email: 'jugador2@example.com', name: 'María' },
      { email: 'jugador3@example.com', name: 'Juan' }
    ]
  },
  contact: {
    title: 'Contacto',
    description: '¿Tienes preguntas? Contáctanos a través de los siguientes medios:',
    emailLabel: 'Email',
    email: 'computec.pcb@gmail.com',
    webLabel: 'Web',
    webText: 'PCB System',
    webHref: 'https://pcbsystempr-cyber.github.io/pcbsystem/index.html'
  },
  footer: {
    description: 'Torneo de videojuegos organizado por el curso de Computec en la Escuela Superior Vocacional Pablo Colón Berdecia.',
    copyright: '© 2026 Gaming Day - Escuela Superior Vocacional Pablo Colón Berdecia',
    organizer: 'Computec'
  }
};
