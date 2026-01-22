import { Language, Rubric } from './types';

export const TRANSLATIONS = {
  en: {
    nav: {
      dashboard: "Dashboard",
      assessor: "AI Assessor",
      about: "About Us"
    },
    dashboard: {
      heroTitle: "TSUL Finalizer",
      heroSubtitle: "The Best AI Final Exam Assessor in the Law Sphere",
      cta: "Start Assessment",
      feature1Title: "Lex.uz Integration",
      feature1Text: "Deep linking to Uzbekistan's national legislation database for accurate statutory citation.",
      feature2Title: "Academic Precision",
      feature2Text: "Calibrated to TSUL grading standards with customizable rubrics.",
      feature3Title: "Multi-Lingual",
      feature3Text: "Native support for Uzbek, Russian, and English legal terminology.",
      statsTitle: "TSUL Standards Compliance",
      stats1: "Strict adherence to Uzbekistan's Procedural Codes.",
      stats2: "Customizable weighting for legal reasoning vs. conclusion.",
      stats3: "Secure, localized environment for sensitive exam data.",
      accuracy: "Accuracy",
      model: "Gemini 3 Pro"
    },
    about: {
      heroTitle: "TSUL Finalizer - Legal Excellence",
      heroSubtitle: "Artificial intelligence platform adapted to Tashkent State University of Law (TSUL) standards.",
      missionTitle: "Our Mission",
      missionText: "Digitizing legal education and providing deep knowledge to students using the latest pedagogical technologies.",
      techTitle: "AI Technology",
      techText: "A system working on Google Gemini 3 Pro models creates unique lessons adapted to each student's needs.",
      developerTitle: "Developer",
      developerText: "This platform was created by Oxforder LLC based on principles of academic excellence.",
      legalTitle: "Legal Warning",
      legalText: "TSUL Finalizer is an AI-based academic assistant. The generated content is for informational purposes only and does not constitute professional legal advice."
    },
    footer: {
      platform: "Platform",
      rights: "© 2026 Oxforder LLC. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      support: "Support"
    },
    step1: "Configuration",
    step2: "Execution",
    step3: "Final Adjudication",
    masterCase: "Master Case Fact Pattern",
    questions: "Exam Questions",
    addQuestion: "Add Question",
    maxWeight: "Max Weight",
    rubric: "Rubric Selector",
    quickRubric: "Quick Rubric",
    advancedRubric: "Custom Rubric",
    next: "Next Phase",
    back: "Back",
    assess: "Assess Question",
    studentAnswer: "Student Answer",
    score: "Score",
    rationale: "Substantive Rationale",
    roadmap: "Growth Roadmap",
    citations: "Statutory Citations (Lex.uz)",
    totalScore: "Total Score",
    assessing: "Adjudicating...",
    rubricUI: {
      weight: "Weight",
      addCriterion: "Add Criterion",
      name: "Criterion Name",
      description: "Description",
      maxBall: "Pts",
      total: "Total",
      delete: "Delete"
    },
    placeholders: {
      case: "Enter the complex legal fact pattern here...",
      question: "Enter exam question...",
      answer: "Paste student response here...",
      rubricName: "Criterion Name...",
      rubricDesc: "Describe grading expectations..."
    }
  },
  ru: {
    nav: {
      dashboard: "Дашборд",
      assessor: "AI Асессор",
      about: "О нас"
    },
    dashboard: {
      heroTitle: "TSUL Finalizer",
      heroSubtitle: "Лучший AI-оценщик финальных экзаменов в сфере права",
      cta: "Начать оценку",
      feature1Title: "Интеграция с Lex.uz",
      feature1Text: "Глубокие ссылки на национальную базу законодательства Узбекистана.",
      feature2Title: "Академическая точность",
      feature2Text: "Калибровка под стандарты ТГЮУ с настраиваемыми рубриками.",
      feature3Title: "Мультиязычность",
      feature3Text: "Поддержка узбекской, русской и английской юридической терминологии.",
      statsTitle: "Соответствие стандартам ТГЮУ",
      stats1: "Строгое соблюдение процессуальных кодексов Узбекистана.",
      stats2: "Настраиваемый вес для юридического обоснования и заключения.",
      stats3: "Безопасная локальная среда для экзаменационных данных.",
      accuracy: "Точность",
      model: "Gemini 3 Pro"
    },
    about: {
      heroTitle: "TSUL Finalizer - Совершенство права",
      heroSubtitle: "Платформа искусственного интеллекта, адаптированная к стандартам Ташкентского государственного юридического университета (ТГЮУ).",
      missionTitle: "Наша миссия",
      missionText: "Цифровизация юридического образования и предоставление студентам глубоких знаний с использованием новейших педагогических технологий.",
      techTitle: "AI Технологии",
      techText: "Система, работающая на моделях Google Gemini 3 Pro, создает уникальные уроки, адаптированные под нужды каждого студента.",
      developerTitle: "Разработчик",
      developerText: "Эта платформа создана ООО Oxforder на основе принципов академического совершенства.",
      legalTitle: "Юридическое предупреждение",
      legalText: "TSUL Finalizer - это академический помощник на базе ИИ. Созданный контент предназначен только для информационных целей и не является профессиональной юридической консультацией."
    },
    footer: {
      platform: "Платформа",
      rights: "© 2026 Oxforder LLC. Все права защищены.",
      privacy: "Политика конфиденциальности",
      terms: "Условия использования",
      support: "Поддержка"
    },
    step1: "Конфигурация",
    step2: "Исполнение",
    step3: "Вердикт",
    masterCase: "Фабула дела",
    questions: "Экзаменационные вопросы",
    addQuestion: "Добавить вопрос",
    maxWeight: "Макс. балл",
    rubric: "Рубрика оценивания",
    quickRubric: "Быстрая рубрика",
    advancedRubric: "Своя рубрика",
    next: "Следующий этап",
    back: "Назад",
    assess: "Оценить",
    studentAnswer: "Ответ студента",
    score: "Балл",
    rationale: "Обоснование",
    roadmap: "План роста",
    citations: "Законодательные ссылки (Lex.uz)",
    totalScore: "Итоговый балл",
    assessing: "Оценивание...",
    rubricUI: {
      weight: "Вес",
      addCriterion: "Добавить критерий",
      name: "Название",
      description: "Описание",
      maxBall: "Балл",
      total: "Итого",
      delete: "Удалить"
    },
    placeholders: {
      case: "Введите фабулу дела...",
      question: "Введите вопрос...",
      answer: "Вставьте ответ студента...",
      rubricName: "Название критерия...",
      rubricDesc: "Опишите критерии оценки..."
    }
  },
  'uz-lat': {
    nav: {
      dashboard: "Boshqaruv paneli",
      assessor: "AI baholovchi",
      about: "Biz haqimizda"
    },
    dashboard: {
      heroTitle: "TSUL Finalizer",
      heroSubtitle: "Huquq sohasidagi eng yaxshi AI yakuniy imtihon baholovchisi",
      cta: "Baholashni boshlash",
      feature1Title: "Lex.uz integratsiyasi",
      feature1Text: "O'zbekiston milliy qonunchilik bazasiga chuqur havolalar.",
      feature2Title: "Akademik aniqlik",
      feature2Text: "TDYU baholash standartlariga moslashtirilgan maxsus rubrikalar.",
      feature3Title: "Ko'p tillilik",
      feature3Text: "O'zbek, rus va ingliz tillaridagi yuridik terminologiyani qo'llab-quvvatlash.",
      statsTitle: "TDYU standartlariga muvofiqlik",
      stats1: "O'zbekiston protsessual kodekslariga qat'iy rioya qilish.",
      stats2: "Huquqiy asoslash va xulosa uchun moslashuvchan vazn.",
      stats3: "Imtihon ma'lumotlari uchun xavfsiz, mahalliylashtirilgan muhit.",
      accuracy: "Aniqlik",
      model: "Gemini 3 Pro"
    },
    about: {
      heroTitle: "TSUL Finalizer - Huquqiy mukammallik",
      heroSubtitle: "Toshkent davlat yuridik universiteti (TDYU) standartlariga moslashtirilgan sun'iy intellekt platformasi.",
      missionTitle: "Bizning missiyamiz",
      missionText: "Yuridik ta'limni raqamlashtirish va talabalarga eng so'nggi pedagogik texnologiyalar yordamida chuqur bilim berish.",
      techTitle: "AI texnologiyasi",
      techText: "Google Gemini 3 Pro modellari asosida ishlovchi tizim har bir talabaning ehtiyojiga moslashtirilgan noyob darslarni yaratadi.",
      developerTitle: "Ishlab chiqaruvchi",
      developerText: "Ushbu platforma Oxforder MCHJ tomonidan akademik mukammallik tamoyillari asosida yaratilgan.",
      legalTitle: "YURIDIK OGOHLANTIRISH",
      legalText: "TSUL Finalizer - bu sun'iy intellektga asoslangan akademik yordamchi. Yaratilgan tarkib faqat ma'lumot olish uchun mo'ljallangan va professional yuridik maslahat hisoblanmaydi."
    },
    footer: {
      platform: "PLATFORMA",
      rights: "© 2026 Oxforder MCHJ. Barcha huquqlar himoyalangan.",
      privacy: "Maxfiylik siyosati",
      terms: "Foydalanish shartlari",
      support: "Qo'llab-quvvatlash"
    },
    step1: "Konfiguratsiya",
    step2: "Ijro",
    step3: "Yakuniy hukm",
    masterCase: "Asosiy ish fabulasi",
    questions: "Imtihon savollari",
    addQuestion: "Savol qo'shish",
    maxWeight: "Maks. ball",
    rubric: "Rubrika",
    quickRubric: "Tezkor rubrika",
    advancedRubric: "Maxsus rubrika",
    next: "Keyingi bosqich",
    back: "Orqaga",
    assess: "Baholash",
    studentAnswer: "Talaba javobi",
    score: "Ball",
    rationale: "Asosli tushuntirish",
    roadmap: "O'sish rejasi",
    citations: "Qonunchilikka havolalar (Lex.uz)",
    totalScore: "Jami ball",
    assessing: "Baholanmoqda...",
    rubricUI: {
      weight: "Vazn",
      addCriterion: "Mezon qo'shish",
      name: "Nomi",
      description: "Tavsifi",
      maxBall: "Ball",
      total: "Jami",
      delete: "O'chirish"
    },
    placeholders: {
      case: "Huquqiy kazusni kiriting...",
      question: "Imtihon savolini kiriting...",
      answer: "Talaba javobini shu yerga yozing...",
      rubricName: "Mezon nomi...",
      rubricDesc: "Baholash mezonini tavsiflang..."
    }
  },
  'uz-cyr': {
    nav: {
      dashboard: "Бошқарув панели",
      assessor: "AI баҳоловчи",
      about: "Биз ҳақимизда"
    },
    dashboard: {
      heroTitle: "TSUL Finalizer",
      heroSubtitle: "Ҳуқуқ соҳасидаги энг яхши AI якуний имтиҳон баҳоловчиси",
      cta: "Баҳолашни бошлаш",
      feature1Title: "Lex.uz интеграцияси",
      feature1Text: "Ўзбекистон миллий қонунчилик базасига чуқур ҳаволалар.",
      feature2Title: "Академик аниқлик",
      feature2Text: "ТДЮУ баҳолаш стандартларига мослаштирилган махсус рубрикалар.",
      feature3Title: "Кўп тиллилик",
      feature3Text: "Ўзбек, рус ва инглиз тилларидаги юридик терминологияни қўллаб-қувватлаш.",
      statsTitle: "ТДЮУ стандартларига мувофиқлик",
      stats1: "Ўзбекистон процессуал кодексларига қатъий риоя қилиш.",
      stats2: "Ҳуқуқий асослаш ва хулоса учун мослашувчан вазн.",
      stats3: "Имтиҳон маълумотлари учун хавфсиз, маҳаллийлаштирилган муҳит.",
      accuracy: "Аниқлик",
      model: "Gemini 3 Pro"
    },
    about: {
      heroTitle: "TSUL Finalizer - Ҳуқуқий мукаммаллик",
      heroSubtitle: "Тошкент давлат юридик университети (ТДЮУ) стандартларига мослаштирилган сунъий интеллект платформаси.",
      missionTitle: "Бизнинг миссиямиз",
      missionText: "Юридик таълимни рақамлаштириш ва талабаларга энг сўнгги педагогик технологиялар ёрдамида чуқур билим бериш.",
      techTitle: "AI технологияси",
      techText: "Google Gemini 3 Pro моделлари асосида ишловчи тизим ҳар бир талабанинг эҳтиёжига мослаштирилган ноёб дарсларни яратади.",
      developerTitle: "Ишлаб чиқарувчи",
      developerText: "Ушбу платформа Oxforder МЧЖ томонидан академик мукаммаллик тамойиллари асосида яратилган.",
      legalTitle: "ЮРИДИК ОГОҲЛАНТИРИШ",
      legalText: "TSUL Finalizer - бу сунъий интеллектга асосланган академик ёрдамчи. Яратилган таркиб фақат маълумот олиш учун мўлжалланган ва профессионал юридик маслаҳат ҳисобланмайди."
    },
    footer: {
      platform: "ПЛАТФОРМА",
      rights: "© 2026 Oxforder МЧЖ. Барча ҳуқуқлар ҳимояланган.",
      privacy: "Махфийлик сиёсати",
      terms: "Фойдаланиш шартлари",
      support: "Қўллаб-қувватлаш"
    },
    step1: "Конфигурация",
    step2: "Ижро",
    step3: "Якуний ҳукм",
    masterCase: "Асосий иш фабуласи",
    questions: "Имтиҳон саволлари",
    addQuestion: "Савол қўшиш",
    maxWeight: "Макс. балл",
    rubric: "Рубрика",
    quickRubric: "Тезкор рубрика",
    advancedRubric: "Махсус рубрика",
    next: "Кейинги босқич",
    back: "Орқага",
    assess: "Баҳолаш",
    studentAnswer: "Талаба жавоби",
    score: "Балл",
    rationale: "Асосли тушунтириш",
    roadmap: "Ўсиш режаси",
    citations: "Қонунчиликка ҳаволалар (Lex.uz)",
    totalScore: "Жами балл",
    assessing: "Баҳоланмоқда...",
    rubricUI: {
      weight: "Вазн",
      addCriterion: "Мезон қўшиш",
      name: "Номи",
      description: "Тавсифи",
      maxBall: "Ball",
      total: "Jami",
      delete: "Ўчириш"
    },
    placeholders: {
      case: "Ҳуқуқий казусни киритинг...",
      question: "Imtihon саволини киритинг...",
      answer: "Талаба жавобини шу ерга ёзинг...",
      rubricName: "Мезон номи...",
      rubricDesc: "Баҳолаш мезонини тавсифланг..."
    }
  }
};

export const DEFAULT_RUBRIC: Rubric = {
  type: 'quick',
  items: [
    { id: '1', label: 'Huquqiy normalarni aniqlash', description: 'Identification of accurate legal norms and issues', weight: 8, maxWeight: 10, enabled: true },
    { id: '2', label: 'Faktlarni qonunga tatbiq etish', description: 'Application of law to specific case facts', weight: 8, maxWeight: 10, enabled: true },
    { id: '3', label: 'Mantiqiy xulosa va yechim', description: 'Logical reasoning and definitive conclusion', weight: 5, maxWeight: 10, enabled: true },
    { id: '4', label: 'Lex.uz havolalari (Statutes)', description: 'Correct citation of statutes from Lex.uz', weight: 4, maxWeight: 10, enabled: true },
  ]
};