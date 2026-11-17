export interface IranCityInfo {
  id: string;
  name: string;
  province: string;
  popular: boolean;
  lat: number;
  lng: number;
  neighborhoods: string[];
}

export const IRAN_PROVINCE_CITIES: IranCityInfo[] = [
  // ۱. تهران
  {
    id: 'tehran',
    name: 'تهران',
    province: 'تهران',
    popular: true,
    lat: 35.6997,
    lng: 51.338,
    neighborhoods: ['سعادت‌آباد', 'زعفرانیه', 'نیاوران', 'ونک', 'ستارخان', 'پونک', 'گیشا', 'مرزداران', 'تهرانپارس', 'شهرک غرب', 'شریعتی', 'صادقیه'],
  },
  { id: 'shahriar', name: 'شهریار', province: 'تهران', popular: false, lat: 35.6598, lng: 51.0578, neighborhoods: ['مرکزی', 'اندیشه', 'بکه', 'باغستان'] },
  { id: 'eslamshahr', name: 'اسلامشهر', province: 'تهران', popular: false, lat: 35.5446, lng: 51.2302, neighborhoods: ['مرکزی', 'واوان', 'قائمیه'] },
  { id: 'parand', name: 'پرند', province: 'تهران', popular: false, lat: 35.4796, lng: 50.9465, neighborhoods: ['فاز ۱', 'فاز ۲', 'فاز ۳', 'فاز ۶'] },
  { id: 'pardis', name: 'پردیس', province: 'تهران', popular: false, lat: 35.7445, lng: 51.8027, neighborhoods: ['فاز ۱', 'فاز ۲', 'فاز ۱۱'] },
  { id: 'andisheh', name: 'اندیشه', province: 'تهران', popular: false, lat: 35.6808, lng: 51.0191, neighborhoods: ['فاز ۱', 'فاز ۲', 'فاز ۳'] },
  { id: 'varamin', name: 'ورامین', province: 'تهران', popular: false, lat: 35.3242, lng: 51.6457, neighborhoods: ['مرکزی', 'شهرک ولیعصر'] },
  { id: 'damavand', name: 'دماوند', province: 'تهران', popular: false, lat: 35.7178, lng: 52.065, neighborhoods: ['گیلاوند', 'آبسرد', 'مرکزی'] },
  { id: 'pakdasht', name: 'پاکدشت', province: 'تهران', popular: false, lat: 35.4817, lng: 51.6861, neighborhoods: ['مرکزی', 'مامازند'] },
  { id: 'robat-karim', name: 'رباط‌کریم', province: 'تهران', popular: false, lat: 35.4846, lng: 51.0829, neighborhoods: ['مرکزی', 'نصیرشهر'] },
  { id: 'shahr-e-qods', name: 'شهر قدس', province: 'تهران', popular: false, lat: 35.7214, lng: 51.109, neighborhoods: ['مرکزی', '۳۰ متری', 'شهرک ابریشم'] },
  { id: 'lavasan', name: 'لواسان', province: 'تهران', popular: false, lat: 35.8213, lng: 51.6285, neighborhoods: ['مرکزی', 'باستی هیلز'] },

  // ۲. البرز
  { id: 'karaj', name: 'کرج', province: 'البرز', popular: true, lat: 35.84, lng: 50.9391, neighborhoods: ['گوهردشت', 'عظیمیه', 'مهرشهر', 'جهانشهر', 'گلشهر', 'فردیس'] },
  { id: 'fardis', name: 'فردیس', province: 'البرز', popular: false, lat: 35.7244, lng: 50.9885, neighborhoods: ['فلکه اول', 'مشکین‌دشت'] },
  { id: 'hashtgerd', name: 'هشتگرد', province: 'البرز', popular: false, lat: 35.9619, lng: 50.68, neighborhoods: ['مرکزی', 'شهر جدید مهستان'] },
  { id: 'nazarabad', name: 'نظرآباد', province: 'البرز', popular: false, lat: 35.9541, lng: 50.6063, neighborhoods: ['مرکزی'] },
  { id: 'kordan', name: 'کردان', province: 'البرز', popular: false, lat: 35.9327, lng: 50.8342, neighborhoods: ['مرکزی', 'برغان'] },

  // ۳. مازندران
  { id: 'sari', name: 'ساری', province: 'مازندران', popular: true, lat: 36.5659, lng: 53.0586, neighborhoods: ['مرکزی', 'فرهنگ', 'پیوندی', 'فرح‌آباد'] },
  { id: 'amol', name: 'آمل', province: 'مازندران', popular: false, lat: 36.4696, lng: 52.3507, neighborhoods: ['مرکزی', 'هراز', 'چمستان'] },
  { id: 'babol', name: 'بابل', province: 'مازندران', popular: false, lat: 36.5449, lng: 52.6787, neighborhoods: ['مرکزی', 'شهریارپوری', 'باغ فردوس'] },
  { id: 'qaemshahr', name: 'قائم‌شهر', province: 'مازندران', popular: false, lat: 36.4631, lng: 52.86, neighborhoods: ['مرکزی', 'ساری‌پل'] },
  { id: 'nowshahr', name: 'نوشهر', province: 'مازندران', popular: false, lat: 36.649, lng: 51.4962, neighborhoods: ['مرکزی', 'نخ شمال', 'سیسنگان'] },
  { id: 'chalus', name: 'چالوس', province: 'مازندران', popular: false, lat: 36.655, lng: 51.4204, neighborhoods: ['مرکزی', 'نمک‌آبرود', 'هچیرود'] },
  { id: 'tonekabon', name: 'تنکابن', province: 'مازندران', popular: false, lat: 36.8163, lng: 50.8738, neighborhoods: ['مرکزی', 'بلوار فردوسی', 'شیرود'] },
  { id: 'ramsar', name: 'رامسر', province: 'مازندران', popular: false, lat: 36.9026, lng: 50.6584, neighborhoods: ['مرکزی', 'توسکاسرا'] },
  { id: 'mahmudabad', name: 'محمودآباد', province: 'مازندران', popular: false, lat: 36.6319, lng: 52.2629, neighborhoods: ['مرکزی', 'سرخرود', 'کلوده'] },
  { id: 'noor', name: 'نور', province: 'مازندران', popular: false, lat: 36.5735, lng: 52.0138, neighborhoods: ['مرکزی', 'ایزدشهر', 'رویان', 'چمستان'] },
  { id: 'babolsar', name: 'بابلسر', province: 'مازندران', popular: false, lat: 36.7025, lng: 52.6576, neighborhoods: ['مرکزی', 'دریاکنار', 'خزرشهر'] },

  // ۴. گیلان
  { id: 'rasht', name: 'رشت', province: 'گیلان', popular: true, lat: 37.2808, lng: 49.5832, neighborhoods: ['گلسار', 'معلم', 'منظریه', 'بلوار گیلان'] },
  { id: 'anzali', name: 'بندر انزلی', province: 'گیلان', popular: false, lat: 37.4727, lng: 49.4622, neighborhoods: ['مرکزی', 'غازیان', 'منطقه آزاد'] },
  { id: 'lahijan', name: 'لاهیجان', province: 'گیلان', popular: false, lat: 37.2071, lng: 50.0034, neighborhoods: ['مرکزی', 'کاشف شرقی', 'شیخ زاهد'] },
  { id: 'astara', name: 'آستارا', province: 'گیلان', popular: false, lat: 38.4291, lng: 48.872, neighborhoods: ['مرکزی'] },
  { id: 'langarud', name: 'لنگرود', province: 'گیلان', popular: false, lat: 37.197, lng: 50.1535, neighborhoods: ['مرکزی', 'چمخاله'] },
  { id: 'fuman', name: 'فومن', province: 'گیلان', popular: false, lat: 37.224, lng: 49.3125, neighborhoods: ['مرکزی'] },

  // ۵. اصفهان
  { id: 'isfahan', name: 'اصفهان', province: 'اصفهان', popular: true, lat: 32.6539, lng: 51.666, neighborhoods: ['آپادانا', 'چهارباغ', 'مرداویج', 'سپاهان‌شهر', 'جلفا'] },
  { id: 'kashan', name: 'کاشان', province: 'اصفهان', popular: false, lat: 33.985, lng: 51.41, neighborhoods: ['مرکزی', 'امیرکبیر'] },
  { id: 'shahin-shahr', name: 'شاهین‌شهر', province: 'اصفهان', popular: false, lat: 32.8579, lng: 51.5535, neighborhoods: ['مرکزی', 'فردوسی'] },
  { id: 'najafabad', name: 'نجف‌آباد', province: 'اصفهان', popular: false, lat: 32.6344, lng: 51.3668, neighborhoods: ['مرکزی'] },
  { id: 'khomeinishahr', name: 'خمینی‌شهر', province: 'اصفهان', popular: false, lat: 32.6856, lng: 51.5217, neighborhoods: ['مرکزی'] },

  // ۶. فارس
  { id: 'shiraz', name: 'شیراز', province: 'فارس', popular: true, lat: 29.5926, lng: 52.5836, neighborhoods: ['معالی‌آباد', 'قدوسی', 'عفیف‌آباد', 'ستارخان', 'صدرا', 'کوی بهاران'] },
  { id: 'marvdasht', name: 'مرودشت', province: 'فارس', popular: false, lat: 29.8742, lng: 52.8025, neighborhoods: ['مرکزی'] },
  { id: 'jahrom', name: 'جهرم', province: 'فارس', popular: false, lat: 28.5, lng: 53.5605, neighborhoods: ['مرکزی'] },
  { id: 'fasa', name: 'فسا', province: 'فارس', popular: false, lat: 28.9383, lng: 53.6482, neighborhoods: ['مرکزی'] },
  { id: 'kazerun', name: 'کازرون', province: 'فارس', popular: false, lat: 29.6195, lng: 51.6541, neighborhoods: ['مرکزی'] },

  // ۷. خراسان رضوی
  { id: 'mashhad', name: 'مشهد', province: 'خراسان رضوی', popular: true, lat: 36.2972, lng: 59.6067, neighborhoods: ['رحمانیه', 'هنرستان', 'احمدآباد', 'وکیل‌آباد', 'الهیه', 'قاسم‌آباد'] },
  { id: 'neyshabur', name: 'نیشابور', province: 'خراسان رضوی', popular: false, lat: 36.2133, lng: 58.7958, neighborhoods: ['مرکزی'] },
  { id: 'sabzevar', name: 'سبزوار', province: 'خراسان رضوی', popular: false, lat: 36.2126, lng: 57.6819, neighborhoods: ['مرکزی'] },
  { id: 'torbat-heydarieh', name: 'تربت حیدریه', province: 'خراسان رضوی', popular: false, lat: 35.274, lng: 59.2195, neighborhoods: ['مرکزی'] },

  // ۸. آذربایجان شرقی
  { id: 'tabriz', name: 'تبریز', province: 'آذربایجان شرقی', popular: true, lat: 38.0962, lng: 46.2738, neighborhoods: ['ولیعصر', 'رشدیه', 'ائل‌گلی', 'شهرک مرزداران'] },
  { id: 'maragheh', name: 'مراغه', province: 'آذربایجان شرقی', popular: false, lat: 37.3921, lng: 46.2391, neighborhoods: ['مرکزی'] },
  { id: 'marand', name: 'مرند', province: 'آذربایجان شرقی', popular: false, lat: 38.4329, lng: 45.7749, neighborhoods: ['مرکزی'] },
  { id: 'mianeh', name: 'میانه', province: 'آذربایجان شرقی', popular: false, lat: 37.421, lng: 47.715, neighborhoods: ['مرکزی'] },

  // ۹. آذربایجان غربی
  { id: 'urmia', name: 'ارومیه', province: 'آذربایجان غربی', popular: false, lat: 37.5527, lng: 45.0761, neighborhoods: ['آزادگان', 'خیام', 'بند', 'امام'] },
  { id: 'khoy', name: 'خوی', province: 'آذربایجان غربی', popular: false, lat: 38.5503, lng: 44.9521, neighborhoods: ['مرکزی'] },
  { id: 'mahabad', name: 'مهاباد', province: 'آذربایجان غربی', popular: false, lat: 36.7631, lng: 45.7222, neighborhoods: ['مرکزی'] },
  { id: 'bukan', name: 'بوکان', province: 'آذربایجان غربی', popular: false, lat: 36.521, lng: 46.2089, neighborhoods: ['مرکزی'] },

  // ۱۰. خوزستان
  { id: 'ahvaz', name: 'اهواز', province: 'خوزستان', popular: true, lat: 31.3183, lng: 48.6706, neighborhoods: ['کیانپارس', 'زیتون کارمندی', 'گلستان', 'پادادشهر'] },
  { id: 'dezful', name: 'دزفول', province: 'خوزستان', popular: false, lat: 32.3811, lng: 48.4058, neighborhoods: ['مرکزی', 'فرهنگ‌شهر'] },
  { id: 'abadan', name: 'آبادان', province: 'خوزستان', popular: false, lat: 30.3392, lng: 48.3043, neighborhoods: ['مرکزی', 'امیری'] },
  { id: 'khorramshahr', name: 'خرمشهر', province: 'خوزستان', popular: false, lat: 30.4398, lng: 48.1664, neighborhoods: ['مرکزی'] },
  { id: 'mahshahr', name: 'ماهشهر', province: 'خوزستان', popular: false, lat: 30.5589, lng: 49.1981, neighborhoods: ['مرکزی', 'ناحیه صنعتی'] },

  // ۱۱. قم
  { id: 'qom', name: 'قم', province: 'قم', popular: true, lat: 34.6416, lng: 50.8746, neighborhoods: ['سالاریه', 'پردیسان', 'صفاشهر', 'بنیاد'] },

  // ۱۲. مرکزی
  { id: 'arak', name: 'اراک', province: 'مرکزی', popular: false, lat: 34.0954, lng: 49.7013, neighborhoods: ['الغدیر', 'الهیه', 'صنایع', 'شریعتی'] },
  { id: 'saveh', name: 'ساوه', province: 'مرکزی', popular: false, lat: 35.0213, lng: 50.3566, neighborhoods: ['مرکزی'] },
  { id: 'khomein', name: 'خمین', province: 'مرکزی', popular: false, lat: 33.6423, lng: 50.0789, neighborhoods: ['مرکزی'] },
  { id: 'mahallat', name: 'محلات', province: 'مرکزی', popular: false, lat: 33.9052, lng: 50.4572, neighborhoods: ['مرکزی'] },

  // ۱۳. گلستان
  { id: 'gorgan', name: 'گرگان', province: 'گلستان', popular: false, lat: 36.8456, lng: 54.4393, neighborhoods: ['ناهارخوران', 'عدالت', 'صیاد شیرازی'] },
  { id: 'gonbad-kavus', name: 'گنبد کاووس', province: 'گلستان', popular: false, lat: 37.25, lng: 55.1672, neighborhoods: ['مرکزی'] },
  { id: 'aliabad', name: 'علی‌آباد کتول', province: 'گلستان', popular: false, lat: 36.9082, lng: 54.8674, neighborhoods: ['مرکزی'] },

  // ۱۴. یزد
  { id: 'yazd', name: 'یزد', province: 'یزد', popular: false, lat: 31.8974, lng: 54.3569, neighborhoods: ['صفائیه', 'آزادشهر', 'اطلسی'] },
  { id: 'meybod', name: 'میبد', province: 'یزد', popular: false, lat: 32.2501, lng: 54.0166, neighborhoods: ['مرکزی'] },
  { id: 'ardakan', name: 'اردکان', province: 'یزد', popular: false, lat: 32.31, lng: 54.0175, neighborhoods: ['مرکزی'] },

  // ۱۵. هرمزگان
  { id: 'bandar-abbas', name: 'بندرعباس', province: 'هرمزگان', popular: false, lat: 27.1832, lng: 56.2666, neighborhoods: ['گلشهر', 'رسالت', 'نخل ناخدا'] },
  { id: 'kish', name: 'کیش', province: 'هرمزگان', popular: true, lat: 26.5328, lng: 53.9803, neighborhoods: ['دامون', 'صدف', 'مرجان', 'میرداماد'] },
  { id: 'qeshm', name: 'قشم', province: 'هرمزگان', popular: false, lat: 26.9581, lng: 56.2719, neighborhoods: ['مرکزی', 'درگهان'] },
  { id: 'minab', name: 'میناب', province: 'هرمزگان', popular: false, lat: 27.1467, lng: 57.0801, neighborhoods: ['مرکزی'] },

  // ۱۶. بوشهر
  { id: 'bushehr', name: 'بوشهر', province: 'بوشهر', popular: false, lat: 28.9234, lng: 50.8203, neighborhoods: ['بهمنی', 'سنگی', 'عاشوری'] },
  { id: 'asaluyeh', name: 'عسلویه', province: 'بوشهر', popular: false, lat: 27.4761, lng: 52.6075, neighborhoods: ['مرکزی'] },
  { id: 'kangan', name: 'کنگان', province: 'بوشهر', popular: false, lat: 27.834, lng: 52.0628, neighborhoods: ['مرکزی'] },

  // ۱۷. کرمان
  { id: 'kerman', name: 'کرمان', province: 'کرمان', popular: false, lat: 30.2839, lng: 57.0834, neighborhoods: ['جمهوری', 'هزارویک‌شب', 'الهیه'] },
  { id: 'rafsanjan', name: 'رفسنجان', province: 'کرمان', popular: false, lat: 30.4067, lng: 55.9939, neighborhoods: ['مرکزی'] },
  { id: 'sirjan', name: 'سیرجان', province: 'کرمان', popular: false, lat: 29.4514, lng: 55.6809, neighborhoods: ['مرکزی'] },
  { id: 'jiroft', name: 'جیرفت', province: 'کرمان', popular: false, lat: 28.6781, lng: 57.7406, neighborhoods: ['مرکزی'] },
  { id: 'bam', name: 'بم', province: 'کرمان', popular: false, lat: 29.106, lng: 58.357, neighborhoods: ['مرکزی'] },

  // ۱۸. کرمانشاه
  { id: 'kermanshah', name: 'کرمانشاه', province: 'کرمانشاه', popular: false, lat: 34.3142, lng: 47.065, neighborhoods: ['نوبهار', '۲۲ بهمن', 'الهیه', 'گلستان'] },
  { id: 'eslamabad-gharb', name: 'اسلام‌آباد غرب', province: 'کرمانشاه', popular: false, lat: 34.1094, lng: 46.5275, neighborhoods: ['مرکزی'] },

  // ۱۹. همدان
  { id: 'hamedan', name: 'همدان', province: 'همدان', popular: false, lat: 34.799, lng: 48.515, neighborhoods: ['پاسداران', 'سعیدیه', 'اعتمادیه'] },
  { id: 'malayer', name: 'ملایر', province: 'همدان', popular: false, lat: 34.2969, lng: 48.8235, neighborhoods: ['مرکزی'] },
  { id: 'nahavand', name: 'نهاوند', province: 'همدان', popular: false, lat: 34.1883, lng: 48.3769, neighborhoods: ['مرکزی'] },

  // ۲۰. زنجان
  { id: 'zanjan', name: 'زنجان', province: 'زنجان', popular: false, lat: 36.6769, lng: 48.4963, neighborhoods: ['انصاریه', 'گلشهر', 'اعتمادیه'] },
  { id: 'abhar', name: 'ابهر', province: 'زنجان', popular: false, lat: 36.1468, lng: 49.218, neighborhoods: ['مرکزی'] },

  // ۲۱. قزوین
  { id: 'qazvin', name: 'قزوین', province: 'قزوین', popular: false, lat: 36.2797, lng: 50.0049, neighborhoods: ['نوروزیان', 'پونک', 'مینودر'] },
  { id: 'takestan', name: 'تاکستان', province: 'قزوین', popular: false, lat: 36.0696, lng: 49.7013, neighborhoods: ['مرکزی'] },

  // ۲۲. اردبیل
  { id: 'ardabil', name: 'اردبیل', province: 'اردبیل', popular: false, lat: 38.2498, lng: 48.2933, neighborhoods: ['شوراییل', 'کارشناسان', 'حافظ'] },
  { id: 'parsabad', name: 'پارس‌آباد', province: 'اردبیل', popular: false, lat: 39.6482, lng: 47.9174, neighborhoods: ['مرکزی'] },
  { id: 'sarein', name: 'سرعین', province: 'اردبیل', popular: false, lat: 38.1514, lng: 48.0708, neighborhoods: ['مرکزی'] },

  // ۲۳. سمنان
  { id: 'semnan', name: 'سمنان', province: 'سمنان', popular: false, lat: 35.5769, lng: 53.392, neighborhoods: ['مرکزی', 'شهرک انقلاب'] },
  { id: 'shahrud', name: 'شاهرود', province: 'سمنان', popular: false, lat: 36.4182, lng: 54.9763, neighborhoods: ['مرکزی'] },
  { id: 'damghan', name: 'دامغان', province: 'سمنان', popular: false, lat: 36.1683, lng: 54.348, neighborhoods: ['مرکزی'] },
  { id: 'garmsar', name: 'گرمسار', province: 'سمنان', popular: false, lat: 35.2182, lng: 52.3409, neighborhoods: ['مرکزی'] },

  // ۲۴. لرستان
  { id: 'khorramabad', name: 'خرم‌آباد', province: 'لرستان', popular: false, lat: 33.4878, lng: 48.3558, neighborhoods: ['گلدشت', 'شریعتی', 'کیو'] },
  { id: 'borujerd', name: 'بروجرد', province: 'لرستان', popular: false, lat: 33.8973, lng: 48.7516, neighborhoods: ['مرکزی'] },

  // ۲۵. کردستان
  { id: 'sanandaj', name: 'سنندج', province: 'کردستان', popular: false, lat: 35.3219, lng: 46.9862, neighborhoods: ['بهاران', 'صفری', 'مبارک‌آباد'] },
  { id: 'saqqez', name: 'سقز', province: 'کردستان', popular: false, lat: 36.2499, lng: 46.2735, neighborhoods: ['مرکزی'] },
  { id: 'baneh', name: 'بانه', province: 'کردستان', popular: false, lat: 35.9975, lng: 45.8853, neighborhoods: ['مرکزی'] },

  // ۲۶. ایلام
  { id: 'ilam', name: 'ایلام', province: 'ایلام', popular: false, lat: 33.6374, lng: 46.4227, neighborhoods: ['مرکزی', 'بلوار سیدالشهدا'] },

  // ۲۷. کهگیلویه و بویراحمد
  { id: 'yasuj', name: 'یاسوج', province: 'کهگیلویه و بویراحمد', popular: false, lat: 30.6682, lng: 51.588, neighborhoods: ['مرکزی', 'گلستان'] },
  { id: 'gachsaran', name: 'دوگنبدان (گچساران)', province: 'کهگیلویه و بویراحمد', popular: false, lat: 30.3586, lng: 50.7981, neighborhoods: ['مرکزی'] },

  // ۲۸. چهارمحال و بختیاری
  { id: 'shahrekord', name: 'شهرکرد', province: 'چهارمحال و بختیاری', popular: false, lat: 32.3256, lng: 50.8644, neighborhoods: ['منظریه', 'کاشانی', 'میرآباد'] },
  { id: 'borujen', name: 'بروجن', province: 'چهارمحال و بختیاری', popular: false, lat: 31.9652, lng: 51.2873, neighborhoods: ['مرکزی'] },

  // ۲۹. سیستان و بلوچستان
  { id: 'zahedan', name: 'زاهدان', province: 'سیستان و بلوچستان', popular: false, lat: 29.4963, lng: 60.8629, neighborhoods: ['زیباشهر', 'بزرگمهر', 'دانشگاه'] },
  { id: 'chabahar', name: 'چابهار', province: 'سیستان و بلوچستان', popular: false, lat: 25.2919, lng: 60.643, neighborhoods: ['مرکزی', 'منطقه آزاد'] },
  { id: 'iranshahr', name: 'ایرانشهر', province: 'سیستان و بلوچستان', popular: false, lat: 27.2024, lng: 60.6848, neighborhoods: ['مرکزی'] },

  // ۳۰. خراسان شمالی
  { id: 'bojnurd', name: 'بجنورد', province: 'خراسان شمالی', popular: false, lat: 37.4747, lng: 57.329, neighborhoods: ['مرکزی', 'امام خمینی'] },
  { id: 'shirvan', name: 'شیروان', province: 'خراسان شمالی', popular: false, lat: 37.3967, lng: 57.9295, neighborhoods: ['مرکزی'] },

  // ۳۱. خراسان جنوبی
  { id: 'birjand', name: 'بیرجند', province: 'خراسان جنوبی', popular: false, lat: 32.8663, lng: 59.2211, neighborhoods: ['معلم', 'تخته‌جان', 'مهرشهر'] },
  { id: 'qaen', name: 'قائن', province: 'خراسان جنوبی', popular: false, lat: 33.7265, lng: 59.1844, neighborhoods: ['مرکزی'] },
];

export const IRAN_CITY_COORDS_MAP: Record<string, [number, number]> = Object.fromEntries(
  IRAN_PROVINCE_CITIES.map((c) => [c.name, [c.lat, c.lng]]),
);

export const IRAN_PROVINCES_LIST: string[] = Array.from(
  new Set(IRAN_PROVINCE_CITIES.map((c) => c.province)),
);
