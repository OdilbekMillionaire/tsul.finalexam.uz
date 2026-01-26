
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
      feature1Title: "lex.uz integration",
      feature1Text: "Deep linking to Uzbekistan's national legislation database for accurate statutory citation.",
      feature2Title: "Academic precision",
      feature2Text: "Calibrated to TSUL grading standards with customizable rubrics.",
      feature3Title: "Multi-lingual",
      feature3Text: "Native support for Uzbek, Russian, and English legal terminology.",
      statsTitle: "Higher legal education standards",
      stats1: "Full compliance with the national legislation of the Republic of Uzbekistan.",
      stats2: "Precise assessment of legal analysis and logical reasoning.",
      stats3: "Guaranteed academic integrity and data security.",
      accuracy: "Accuracy",
      model: "Gemini 3 Pro"
    },
    about: {
      heroTitle: "TSUL Finalizer - Legal Excellence",
      heroSubtitle: "Artificial intelligence platform adapted to Tashkent State University of Law (TSUL) standards.",
      missionTitle: "Our mission",
      missionText: "Digitizing legal education and providing deep knowledge to students using the latest pedagogical technologies.",
      techTitle: "AI technology",
      techText: "A system working on Google Gemini 3 Pro models creates unique lessons adapted to each student's needs.",
      developerTitle: "Developer",
      developerText: "This platform is proudly developed by Oxforder LLC — the #1 EdTech company in Uzbekistan, pioneering academic excellence and digital innovation in legal education.",
      legalTitle: "Legal warning",
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
    back: "Back to Execution",
    assess: "Assess Question",
    studentAnswer: "Student Answer",
    score: "Score",
    rationale: "Substantive Rationale",
    roadmap: "Growth Roadmap",
    citations: "Legislative References",
    totalScore: "Total Score",
    downloadPdf: "Download PDF",
    assessing: "Adjudicating...",
    resetAnswers: "New Student (Reset Answers)",
    resetSession: "Reset Session (Delete Everything)",
    confirmReset: "Are you sure you want to start a new lesson? All data will be lost.",
    examConfig: "Exam Configuration",
    saveProgress: "Save Progress",
    saved: "Saved!",
    noQuestions: "No questions added yet.",
    questionAnalysis: "Question {n} Analysis",
    overallAssessment: "Overall Exam Assessment",
    generateFeedback: "Generate Comprehensive Feedback",
    generating: "Generating...",
    growthTips: "General Growth Tips",
    chatTitle: "Exam AI",
    chatGreeting: "Hello! I am Exam AI. I have analyzed the student's performance. Ask me anything about the grading rationale, specific laws, or how to improve.",
    typeMessage: "Ask about the results...",
    send: "Send",
    smartImport: {
      title: "Smart Import",
      description: "Paste your entire exam paper (Case + Questions) here. The AI will automatically separate them.",
      placeholder: "Paste the full text here...",
      button: "Auto-Detect Case & Questions",
      processing: "Analyzing Exam Content..."
    },
    rubricUI: {
      weight: "Importance",
      addCriterion: "Add Criterion",
      name: "Criterion Name",
      description: "Description",
      maxBall: "Pts",
      total: "Total",
      delete: "Delete",
      levels: {
        low: "Low",
        medium: "Medium",
        high: "High"
      },
      structuredMode: "Structured Criteria",
      customMode: "Custom Instructions"
    },
    placeholders: {
      case: "Enter the complex legal fact pattern here...",
      question: "Enter exam question...",
      answer: "Paste student response here...",
      rubricName: "Criterion Name...",
      rubricDesc: "Describe grading expectations...",
      customRubric: "Paste your detailed grading instructions, 'mezon', or specific criteria here. The AI will strictly follow these rules..."
    },
    aiHeaders: {
      strengths: "Overall Strengths",
      weaknesses: "Key Weaknesses in Legal Reasoning",
      tips: "General Growth Tips for the Future"
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
      feature1Title: "Интеграция с lex.uz",
      feature1Text: "Глубокие ссылки на национальную базу законодательства Узбекистана.",
      feature2Title: "Академическая точность",
      feature2Text: "Калибровка под стандарты ТГЮУ с настраиваемыми рубриками.",
      feature3Title: "Мультиязычность",
      feature3Text: "Поддержка узбекской, русской и английской юридической терминологии.",
      statsTitle: "Стандарты высшего юридического образования",
      stats1: "Полное соответствие национальному законодательству Республики Узбекистан.",
      stats2: "Точная оценка юридического анализа и логического мышления.",
      stats3: "Гарантированная академическая честность и безопасность данных.",
      accuracy: "Точность",
      model: "Gemini 3 Pro"
    },
    about: {
      heroTitle: "TSUL Finalizer - Совершенство права",
      heroSubtitle: "Платформа искусственного интеллекта, адаптированная к стандартам Ташкентского государственного юридического университета (ТГЮУ).",
      missionTitle: "Наша миссия",
      missionText: "Цифровизация юридического образования и предоставление студентам глубоких знаний с использованием новейших педагогических технологий.",
      techTitle: "AI технологии",
      techText: "Система, работающая на моделях Google Gemini 3 Pro, создает уникальные уроки, адаптированные под нужды каждого студента.",
      developerTitle: "Разработчик",
      developerText: "Эта платформа разработана ООО Oxforder — лучшей EdTech компанией Узбекистана, лидером в области академического совершенства и инноваций.",
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
    back: "Вернуться к исполнению",
    assess: "Оценить",
    studentAnswer: "Ответ студента",
    score: "Балл",
    rationale: "Обоснование",
    roadmap: "План роста",
    citations: "Законодательные ссылки",
    totalScore: "Итоговый балл",
    downloadPdf: "Скачать PDF",
    assessing: "Оценивание...",
    resetAnswers: "Новый студент (Сброс ответов)",
    resetSession: "Сбросить сессию (Удалить всё)",
    confirmReset: "Вы уверены? Все текущие данные будут удалены.",
    examConfig: "Конфигурация экзамена",
    saveProgress: "Сохранить",
    saved: "Сохранено!",
    noQuestions: "Вопросы еще не добавлены.",
    questionAnalysis: "Анализ вопроса {n}",
    overallAssessment: "Общая оценка экзамена",
    generateFeedback: "Сформировать общий отзыв",
    generating: "Генерация...",
    growthTips: "Советы по развитию",
    chatTitle: "Exam AI",
    chatGreeting: "Привет! Я Exam AI. Я проанализировал результаты. Спрашивайте об оценках, ошибках или способах улучшения.",
    typeMessage: "Задайте вопрос по результатам...",
    send: "Отправить",
    smartImport: {
      title: "Умный импорт",
      description: "Вставьте полный текст экзамена (Фабула + Вопросы) сюда. ИИ автоматически разделит их.",
      placeholder: "Вставьте полный текст здесь...",
      button: "Авто-определение (Фабула и Вопросы)",
      processing: "Анализ текста экзамена..."
    },
    rubricUI: {
      weight: "Важность",
      addCriterion: "Добавить критерий",
      name: "Название",
      description: "Описание",
      maxBall: "Балл",
      total: "Итого",
      delete: "Удалить",
      levels: {
        low: "Низкая",
        medium: "Средняя",
        high: "Высокая"
      },
      structuredMode: "Структурированные критерии",
      customMode: "Свои инструкции"
    },
    placeholders: {
      case: "Введите фабулу дела...",
      question: "Введите вопрос...",
      answer: "Вставьте ответ студента...",
      rubricName: "Название критерия...",
      rubricDesc: "Опишите критерии оценки...",
      customRubric: "Вставьте сюда подробные инструкции по оценке, 'мезоны' или специфические критерии. ИИ будет строго следовать этим правилам..."
    },
    aiHeaders: {
      strengths: "Общие сильные стороны",
      weaknesses: "Ключевые недостатки в юридической аргументации",
      tips: "Общие советы по развитию на будущее"
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
      feature1Title: "lex.uz integratsiyasi",
      feature1Text: "O'zbekiston milliy qonunchilik bazasiga chuqur havolalar.",
      feature2Title: "Akademik aniqlik",
      feature2Text: "TDYU baholash standartlariga moslashtirilgan maxsus rubrikalar.",
      feature3Title: "Ko'p tillilik",
      feature3Text: "O'zbek, rus va ingliz tillaridagi yuridik terminologiyani qo'llab-quvvatlash.",
      statsTitle: "Oliy yuridik ta'lim standartlari",
      stats1: "O'zbekiston milliy qonunchiligi standartlariga to'liq moslik.",
      stats2: "Huquqiy tahlil va mantiqiy xulosa chiqarish ko'nikmalarini baholash.",
      stats3: "Akademik halollik va ma'lumotlar xavfsizligi kafolati.",
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
      developerText: "Ushbu platforma O'zbekistondagi eng zo'r EdTech kompaniyasi — Oxforder MCHJ tomonidan yaratilgan bo'lib, ta'limdagi innovatsiyalar yetakchisi hisoblanadi.",
      legalTitle: "Yuridik ogohlantirish",
      legalText: "TSUL Finalizer - bu sun'iy intellektga asoslangan akademik yordamchi. Yaratilgan tarkib faqat ma'lumot olish uchun mo'ljallangan va professional yuridik maslahat hisoblanmaydi."
    },
    footer: {
      platform: "Platforma",
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
    back: "Ijroga qaytish",
    assess: "Baholash",
    studentAnswer: "Talaba javobi",
    score: "Ball",
    rationale: "Asosli tushuntirish",
    roadmap: "O'sish rejasi",
    citations: "Qonunchilikka havolalar",
    totalScore: "Jami ball",
    downloadPdf: "PDF yuklab olish",
    assessing: "Baholanmoqda...",
    resetAnswers: "Yangi talaba (Javoblarni tozalash)",
    resetSession: "Sessiyani tiklash (Barchasini o'chirish)",
    confirmReset: "Ishonchingiz komilmi? Bu barcha ma'lumotlarni butunlay o'chirib tashlaydi.",
    examConfig: "Imtihon konfiguratsiyasi",
    saveProgress: "Saqlash",
    saved: "Saqlandi!",
    noQuestions: "Savollar hali qo'shilmadi.",
    questionAnalysis: "{n}-savol tahlili",
    overallAssessment: "Imtihon bo'yicha umumiy xulosa",
    generateFeedback: "Umumiy xulosani shakllantirish",
    generating: "Shakllantirilmoqda...",
    growthTips: "O'sish bo'yicha maslahatlar",
    chatTitle: "Exam AI",
    chatGreeting: "Salom! Men Exam AI man. Natijalarni tahlil qildim. Baholash, xatolar yoki yaxshilanish yo'llari haqida so'rang.",
    typeMessage: "Natijalar haqida so'rang...",
    send: "Yuborish",
    smartImport: {
      title: "Aqlli Import",
      description: "Butun imtihon matnini (Fabula + Savollar) shu yerga tashlang. AI ularni avtomatik ajratib beradi.",
      placeholder: "To'liq matnni shu yerga qo'ying...",
      button: "Avto-Aniqlash (Fabula va Savollar)",
      processing: "Imtihon matni tahlil qilinmoqda..."
    },
    rubricUI: {
      weight: "Muhimlik",
      addCriterion: "Mezon qo'shish",
      name: "Nomi",
      description: "Tavsifi",
      maxBall: "Ball",
      total: "Jami",
      delete: "O'chirish",
      levels: {
        low: "Past",
        medium: "O'rta",
        high: "Yuqori"
      },
      structuredMode: "Tuzilgan mezonlar",
      customMode: "Maxsus ko'rsatmalar"
    },
    placeholders: {
      case: "Huquqiy kazusni kiriting...",
      question: "Imtihon savolini kiriting...",
      answer: "Talaba javobini shu yerga yozing...",
      rubricName: "Mezon nomi...",
      rubricDesc: "Baholash mezonini tavsiflang...",
      customRubric: "Baholash bo'yicha batafsil ko'rsatmalar, 'mezonlar' yoki maxsus talablarni shu yerga yozing. AI ushbu qoidalarga qat'iy amal qiladi..."
    },
    aiHeaders: {
      strengths: "Umumiy kuchli tomonlar",
      weaknesses: "Huquqiy asoslashdagi yoki qonunni qo'llashdagi asosiy kamchiliklar",
      tips: "Kelajak uchun umumiy rivojlanish tavsiyalari"
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
      feature1Title: "lex.uz интеграцияси",
      feature1Text: "Ўзбекистон миллий қонунчилик базасига чуқур ҳаволалар.",
      feature2Title: "Академик аниқлик",
      feature2Text: "ТДЮУ баҳолаш стандартларига мослаштирилган махсус рубрикалар.",
      feature3Title: "Кўп тиллилик",
      feature3Text: "Ўзбек, рус ва инглиз тилларидаги юридик терминологияни қўллаб-қувватлаш.",
      statsTitle: "Олий юридик таълим стандартлари",
      stats1: "Ўзбекистон миллий қонунчилиги стандартларига тўлиқ мослик.",
      stats2: "Ҳуқуқий таҳлил ва мантиқий хулоса чиқариш кўникмаларини баҳолаш.",
      stats3: "Академик ҳалоллик ва маълумотлар хавфсизлиги кафолати.",
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
      developerText: "Ушбу платформа Ўзбекистондаги энг зўр EdTech компанияси — Oxforder МЧЖ томонидан яратилган бўлиб, таълимдаги инновациялар етакчиси ҳисобланади.",
      legalTitle: "Юридик огоҳлантириш",
      legalText: "TSUL Finalizer - бу сунъий интеллектга асосланган академик ёрдамчи. Яратилган таркиб фақат маълумот олиш учун мўлжалланган ва профессионал юридик маслаҳат ҳисобланмайди."
    },
    footer: {
      platform: "Платформа",
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
    back: "Ижрога қайтиш",
    assess: "Баҳолаш",
    studentAnswer: "Талаба жавоби",
    score: "Балл",
    rationale: "Асосли тушунтириш",
    roadmap: "Ўсиш режаси",
    citations: "Қонунчиликка ҳаволалар",
    totalScore: "Жами балл",
    downloadPdf: "PDF юклаб олиш",
    assessing: "Baholanmoqda...",
    resetAnswers: "Янги талаба (Жавобларни тозалаш)",
    resetSession: "Сессияни тиклаш (Барчасини ўчириш)",
    confirmReset: "Ишончингиз комилми? Бу барча маълумотларни бутунлай ўчириб ташлайди.",
    examConfig: "Имтиҳон конфигурацияси",
    saveProgress: "Сақлаш",
    saved: "Сақланди!",
    noQuestions: "Саволлар ҳали қўшилмади.",
    questionAnalysis: "{n}-савол таҳлили",
    overallAssessment: "Имтиҳон бўйича умумий хулоса",
    generateFeedback: "Умумий хулосани шакллантириш",
    generating: "Шакллантирилмоқда...",
    growthTips: "Ўсиш бўйича маслаҳатлар",
    chatTitle: "Exam AI",
    chatGreeting: "Салом! Мен Exam AI ман. Натижаларни таҳлил қилдим. Баҳолаш, хатолар ёки яхшиланиш йўллари ҳақида сўранг.",
    typeMessage: "Натижалар ҳақида сўранг...",
    send: "Юбориш",
    smartImport: {
      title: "Ақлли Импорт",
      description: "Бутун имтиҳон матнини (Фабула + Саволлар) шу ерга ташланг. AI уларни автоматик ажратиб беради.",
      placeholder: "Тўлиқ матнни шу ерга қўйинг...",
      button: "Авто-Аниқлаш (Фабула ва Саволлар)",
      processing: "Имтиҳон матни таҳлил қилинмоқда..."
    },
    rubricUI: {
      weight: "Муҳимлик",
      addCriterion: "Mezon qo'shish",
      name: "Nomi",
      description: "Tavsifi",
      maxBall: "Ball",
      total: "Jami",
      delete: "O'chirish",
      levels: {
        low: "Паст",
        medium: "Ўрта",
        high: "Юқори"
      },
      structuredMode: "Тартибланган мезонлар",
      customMode: "Махсус кўрсатмалар"
    },
    placeholders: {
      case: "Huquqiy kazusni kiriting...",
      question: "Imtihon savolini kiriting...",
      answer: "Talaba javobini shu yerga yozing...",
      rubricName: "Mezon nomi...",
      rubricDesc: "Baholash mezonini tavsiflang...",
      customRubric: "Баҳолаш бўйича батафсил кўрсатмалар, 'мезонлар' ёки махсус талабларни шу ерга ёзинг. АI ушбу қоидаларга қатъий амал қилади..."
    },
    aiHeaders: {
      strengths: "Умумий кучли томонлар",
      weaknesses: "Ҳуқуқий асослашдаги ёки қонунни қўллашдаги асосий камчиликлар",
      tips: "Келажак учун умумий ривожланиш тавсиялари"
    }
  }
};

export const RUBRIC_TEMPLATES: Record<Language, Rubric> = {
  en: {
    type: 'quick',
    customInstructions: '',
    items: [
      { id: '1', label: 'Legal Issue Identification', description: 'Identification of accurate legal norms and issues', weight: 8, maxWeight: 10, enabled: true },
      { id: '2', label: 'Application of Law to Facts', description: 'Application of law to specific case facts', weight: 8, maxWeight: 10, enabled: true },
      { id: '3', label: 'Logical Reasoning & Conclusion', description: 'Logical reasoning and definitive conclusion', weight: 5, maxWeight: 10, enabled: true },
    ]
  },
  ru: {
    type: 'quick',
    customInstructions: '',
    items: [
      { id: '1', label: 'Определение правовых норм', description: 'Определение точных правовых норм и вопросов', weight: 8, maxWeight: 10, enabled: true },
      { id: '2', label: 'Применение закона к фактам', description: 'Применение закона к конкретным обстоятельствам дела', weight: 8, maxWeight: 10, enabled: true },
      { id: '3', label: 'Логическое обоснование и вывод', description: 'Логическое рассуждение и окончательный вывод', weight: 5, maxWeight: 10, enabled: true },
    ]
  },
  'uz-lat': {
    type: 'quick',
    customInstructions: '',
    items: [
      { id: '1', label: 'Huquqiy normalarni aniqlash', description: 'Aniq huquqiy normalar va masalalarni aniqlash', weight: 8, maxWeight: 10, enabled: true },
      { id: '2', label: 'Faktlarni qonunga tatbiq etish', description: 'Qonunni aniq ish holatlariga tatbiq etish', weight: 8, maxWeight: 10, enabled: true },
      { id: '3', label: 'Mantiqiy xulosa va yechim', description: 'Mantiqiy asoslash va yakuniy xulosa', weight: 5, maxWeight: 10, enabled: true },
    ]
  },
  'uz-cyr': {
    type: 'quick',
    customInstructions: '',
    items: [
      { id: '1', label: 'Ҳуқуқий нормаларни аниқлаш', description: 'Аниқ ҳуқуқий нормалар ва масалаларни аниқлаш', weight: 8, maxWeight: 10, enabled: true },
      { id: '2', label: 'Фактларни қонунга татбиқ этиш', description: 'Қонунни аниқ иш ҳолатларига татбиқ этиш', weight: 8, maxWeight: 10, enabled: true },
      { id: '3', label: 'Мантиқий хулоса ва ечим', description: 'Мантиқий асослаш ва якуний хулоса', weight: 5, maxWeight: 10, enabled: true },
    ]
  }
};
