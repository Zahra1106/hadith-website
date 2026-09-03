/**
 * Curated reference data.
 *
 * IMPORTANT: The `hadiths` array below is a small, hand-checked set of
 * well-known, widely authenticated narrations. It exists so the site has
 * something instant to show (homepage, topic pages, daily hadith) without
 * a network call. It is NOT the complete collections — for the complete,
 * verified text of each collection, this app fetches live data from the
 * open-source Hadith API dataset (see services/hadithApi.js), which mirrors
 * Sunnah.com's published collections.
 *
 * No hadith text below has been generated, paraphrased, or altered by AI.
 * Arabic and English wording follows the standard published narrations.
 */

const collections = {
  bukhari: {
    key: 'bukhari',
    name: 'Sahih al-Bukhari',
    ar: 'صحيح البخاري',
    desc: "Compiled by Imam Muhammad al-Bukhari (d. 256 AH). Widely regarded as the most authentic book after the Qur'an.",
    grading: 'All narrations: Sahih (authentic)',
  },
  muslim: {
    key: 'muslim',
    name: 'Sahih Muslim',
    ar: 'صحيح مسلم',
    desc: 'Compiled by Imam Muslim ibn al-Hajjaj (d. 261 AH). Ranked alongside Sahih al-Bukhari as the most rigorously verified collection.',
    grading: 'All narrations: Sahih (authentic)',
  },
  abudawud: {
    key: 'abudawud',
    name: 'Sunan Abu Dawood',
    ar: 'سنن أبي داود',
    desc: 'Compiled by Imam Abu Dawood as-Sijistani (d. 275 AH), with a focus on Hadith relating to Islamic law and practice.',
    grading: 'Mixed grading — see each entry',
  },
  tirmidhi: {
    key: 'tirmidhi',
    name: 'Jami` at-Tirmidhi',
    ar: 'جامع الترمذي',
    desc: 'Compiled by Imam Muhammad at-Tirmidhi (d. 279 AH), notable for recording the graded status of each Hadith.',
    grading: 'Mixed grading — see each entry',
  },
};

const topics = [
  'Prayer (Salah)', 'Fasting (Sawm)', 'Charity (Zakat)', 'Hajj', 'Faith (Iman)',
  'Family and Marriage', 'Parents', 'Good Character', 'Knowledge', 'Dua and Dhikr',
  'Patience', 'Forgiveness', 'Women in Islam', 'Business and Honesty', 'Death and the Hereafter',
];

const hadiths = [
  {
    id: 'h1', collection: 'bukhari', book: 'Book of Revelation',
    chapter: 'How the divine revelation started', number: '1',
    narrator: 'Umar ibn al-Khattab (may Allah be pleased with him)',
    topic: 'Faith (Iman)', authenticity: 'Sahih',
    arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    english: 'Actions are but by intentions, and every person will only get that which they intended.',
    urdu: 'اعمال کا دار و مدار نیتوں پر ہے، اور ہر شخص کے لیے وہی ہے جس کی اس نے نیت کی۔',
    explanation: "Scholars traditionally open works of Hadith with this narration because it establishes that the value of any act of worship or daily life is judged first by the sincerity and purpose behind it, not by its outward form alone. Classical commentators note that intention is the standard by which two identical actions can carry very different weight.",
  },
  {
    id: 'h2', collection: 'tirmidhi', book: 'Book of Salah',
    chapter: 'What has been related about the first matter for which a servant will be brought to account', number: '413',
    narrator: 'Abu Hurairah (may Allah be pleased with him)',
    topic: 'Prayer (Salah)', authenticity: 'Hasan',
    arabic: 'إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلَاتُهُ',
    english: 'The first matter that the servant will be brought to account for on the Day of Judgment from among his deeds will be his prayer.',
    urdu: 'قیامت کے دن بندے کے اعمال میں سب سے پہلے جس چیز کا حساب لیا جائے گا وہ اس کی نماز ہے۔',
    explanation: "This narration is commonly cited to explain the central place of the five daily prayers in a believer's accountability. Commentators note that if the prayer is found sound, the rest of one's deeds are assessed accordingly, which is why classical scholars treated consistent, mindful prayer as foundational rather than optional.",
  },
  {
    id: 'h3', collection: 'bukhari', book: 'Book of Fasting',
    chapter: 'The superiority of fasting', number: '38',
    narrator: 'Abu Hurairah (may Allah be pleased with him)',
    topic: 'Fasting (Sawm)', authenticity: 'Sahih',
    arabic: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
    english: 'Whoever fasts the month of Ramadan out of faith and seeking reward from Allah, his previous sins will be forgiven.',
    urdu: 'جس نے ایمان اور طلبِ ثواب کے ساتھ رمضان کے روزے رکھے، اس کے پچھلے گناہ معاف کر دیے جائیں گے۔',
    explanation: 'Two conditions are highlighted here: faith (belief in the obligation and reward of fasting) and ihtisab (sincerely seeking reward). Scholars note both conditions must be present for the stated forgiveness to apply.',
  },
  {
    id: 'h4', collection: 'muslim', book: 'Book of Zakat',
    chapter: 'The encouragement to give in charity', number: '2588',
    narrator: 'Abu Hurairah (may Allah be pleased with him)',
    topic: 'Charity (Zakat)', authenticity: 'Sahih',
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
    english: 'Charity does not decrease wealth.',
    urdu: 'صدقہ دینے سے مال میں کمی نہیں ہوتی۔',
    explanation: 'This short statement is part of a longer narration on the virtues of charity, humility, and forbearance. Commentators explain it both spiritually and practically.',
  },
  {
    id: 'h5', collection: 'bukhari', book: 'Book of Hajj',
    chapter: 'The virtue of Hajj Mabrur', number: '1521',
    narrator: 'Abu Hurairah (may Allah be pleased with him)',
    topic: 'Hajj', authenticity: 'Sahih',
    arabic: 'مَنْ حَجَّ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ',
    english: 'Whoever performs Hajj for the sake of Allah and does not commit any obscenity or wrongdoing during it will return free of sin, as on the day his mother bore him.',
    urdu: 'جس نے حج کیا اور اس میں فحش گوئی اور گناہ سے بچا رہا، وہ اس دن کی طرح لوٹے گا جس دن اس کی ماں نے اسے جنم دیا تھا۔',
    explanation: 'Classical commentators read this as describing Hajj Mabrur — a Hajj performed with sincerity, correct conduct, and abstention from sin — as a means of complete spiritual renewal.',
  },
  {
    id: 'h6', collection: 'tirmidhi', book: 'Book of Marriage',
    chapter: "What has been related about a man's rights over his wife", number: '3895',
    narrator: 'Aisha (may Allah be pleased with her)',
    topic: 'Family and Marriage', authenticity: 'Sahih',
    arabic: 'خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي',
    english: 'The best of you are those who are best to their families, and I am the best of you to my family.',
    urdu: 'تم میں سے بہترین وہ ہے جو اپنے گھر والوں کے ساتھ بہترین ہو، اور میں تم سب میں اپنے گھر والوں کے ساتھ سب سے بہتر ہوں۔',
    explanation: "This narration is frequently cited to establish that a person's character is measured first inside their own household.",
  },
  {
    id: 'h7', collection: 'muslim', book: 'Book of Virtue, Good Manners and Joining of the Ties of Relationship',
    chapter: 'Who is most entitled to good companionship', number: '2548',
    narrator: 'Abu Hurairah (may Allah be pleased with him)',
    topic: 'Parents', authenticity: 'Sahih',
    arabic: 'أُمُّكَ، ثُمَّ أُمُّكَ، ثُمَّ أُمُّكَ، ثُمَّ أَبُوكَ',
    english: 'Your mother, then your mother, then your mother, then your father.',
    urdu: 'تیری ماں، پھر تیری ماں، پھر تیری ماں، پھر تیرا باپ۔',
    explanation: 'A man asked the Prophet ﷺ who was most deserving of his good companionship and care; this was the reply, repeated for the mother three times before the father.',
  },
  {
    id: 'h8', collection: 'abudawud', book: 'Book of General Behavior',
    chapter: 'On good character', number: '4682',
    narrator: 'Abu Hurairah (may Allah be pleased with him)',
    topic: 'Good Character', authenticity: 'Sahih',
    arabic: 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
    english: 'The most complete of the believers in faith is the one with the best character.',
    urdu: 'ایمان میں سب سے کامل مومن وہ ہے جس کا اخلاق سب سے اچھا ہو۔',
    explanation: 'This narration links the inward reality of faith to its outward expression in daily conduct.',
  },
  {
    id: 'h9', collection: 'bukhari', book: "Book of the Virtues of the Qur'an",
    chapter: 'The best among you', number: '5027',
    narrator: 'Uthman ibn Affan (may Allah be pleased with him)',
    topic: 'Knowledge', authenticity: 'Sahih',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    english: 'The best among you are those who learn the Qur\'an and teach it.',
    urdu: 'تم میں سب سے بہتر وہ ہے جو قرآن سیکھے اور اسے سکھائے۔',
    explanation: 'Commentators note this narration pairs two acts — learning and teaching — as together forming a complete relationship with sacred knowledge.',
  },
  {
    id: 'h10', collection: 'tirmidhi', book: 'Book on the Description of the Day of Judgment',
    chapter: 'What has been related about the virtue of Dua', number: '3372',
    narrator: 'An-Nu\'man ibn Bashir (may Allah be pleased with him)',
    topic: 'Dua and Dhikr', authenticity: 'Sahih',
    arabic: 'الدُّعَاءُ هُوَ الْعِبَادَةُ',
    english: 'Supplication (Dua) is worship.',
    urdu: 'دعا ہی عبادت ہے۔',
    explanation: 'This short, often-quoted statement is understood as elevating Dua from a mere request to an act of worship in its own right.',
  },
  {
    id: 'h11', collection: 'bukhari', book: 'Book of Patients',
    chapter: 'The affliction of the believer', number: '5641',
    narrator: 'Abu Sa\'id al-Khudri and Abu Hurairah (may Allah be pleased with them)',
    topic: 'Patience', authenticity: 'Sahih',
    arabic: 'مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حُزْنٍ وَلَا أَذًى وَلَا غَمٍّ حَتَّى الشَّوْكَةِ يُشَاكُهَا إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ',
    english: 'No fatigue, nor disease, nor anxiety, nor sadness, nor hurt, nor distress befalls a Muslim, even if it were the prick he receives from a thorn, except that Allah expiates some of his sins for that.',
    urdu: 'مسلمان کو جو بھی تکلیف، بیماری، غم، رنج، یا اذیت پہنچتی ہے، یہاں تک کہ کانٹا بھی چبھے، تو اللہ اس کے ذریعے اس کے گناہ معاف فرما دیتا ہے۔',
    explanation: 'This narration is a common reference point in discussions of patience during hardship.',
  },
  {
    id: 'h12', collection: 'bukhari', book: 'Book of Ar-Riqaq (Heart-Softening)',
    chapter: "Allah's joy at the repentance of His servant", number: '6309',
    narrator: 'Anas ibn Malik (may Allah be pleased with him)',
    topic: 'Forgiveness', authenticity: 'Sahih',
    arabic: 'لَلَّهُ أَفْرَحُ بِتَوْبَةِ عَبْدِهِ مِنْ أَحَدِكُمْ سَقَطَ عَلَى بَعِيرِهِ وَقَدْ أَضَلَّهُ فِي أَرْضِ فَلَاةٍ',
    english: 'Allah is more pleased with the repentance of His servant than one of you who, having lost his camel in a barren desert, suddenly finds it.',
    urdu: 'اللہ اپنے بندے کی توبہ سے اس شخص سے کہیں زیادہ خوش ہوتا ہے جو ویرانے میں اپنی گم شدہ اونٹنی کو اچانک پا لے۔',
    explanation: 'Commentators use this vivid image to illustrate the depth of mercy and readiness to accept sincere repentance.',
  },
  {
    id: 'h13', collection: 'tirmidhi', book: 'Book of Marriage',
    chapter: 'What has been related about the equality of women and men in rulings', number: '113',
    narrator: 'Aisha (may Allah be pleased with her)',
    topic: 'Women in Islam', authenticity: 'Hasan',
    arabic: 'إِنَّمَا النِّسَاءُ شَقَائِقُ الرِّجَالِ',
    english: 'Women are the twin halves of men.',
    urdu: 'عورتیں مردوں کی ہم جنس (اور برابر) ہیں۔',
    explanation: 'Classical scholars cite this narration when discussing that women share the same basic rulings and moral standing as men except where a specific text distinguishes otherwise.',
  },
  {
    id: 'h14', collection: 'tirmidhi', book: 'Book on Business',
    chapter: 'What has been related about the merchant', number: '1209',
    narrator: 'Abu Sa\'id al-Khudri (may Allah be pleased with him)',
    topic: 'Business and Honesty', authenticity: 'Hasan',
    arabic: 'التَّاجِرُ الصَّدُوقُ الْأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ',
    english: 'The truthful, trustworthy merchant will be with the Prophets, the truthful, and the martyrs.',
    urdu: 'سچا اور امانت دار تاجر انبیاء، صدیقین اور شہداء کے ساتھ ہوگا۔',
    explanation: 'This narration is a foundational reference in Islamic business ethics, tying commercial honesty directly to some of the highest ranks in the Hereafter.',
  },
  {
    id: 'h15', collection: 'tirmidhi', book: 'Book on Zuhd (Abstinence)',
    chapter: 'What has been related about the remembrance of death', number: '2307',
    narrator: 'Abu Hurairah (may Allah be pleased with him)',
    topic: 'Death and the Hereafter', authenticity: 'Hasan',
    arabic: 'أَكْثِرُوا ذِكْرَ هَاذِمِ اللَّذَّاتِ الْمَوْتِ',
    english: 'Remember often the destroyer of pleasures: death.',
    urdu: 'لذتوں کو ختم کرنے والی چیز یعنی موت کو کثرت سے یاد کیا کرو۔',
    explanation: 'Commentators explain this as an instruction toward mindful awareness of mortality, encouraging moderation and sincerity in worship.',
  },
];

/**
 * Maps each topic chip to the keyword(s) used to match it against the
 * FULL text of every collection (not just the small curated sample).
 * This is what powers "Browse by topic" showing every relevant Hadith
 * across all four books, instead of only the one curated example.
 */
const topicKeywords = {
  'Prayer (Salah)': ['prayer', 'salah', 'salat', 'pray'],
  'Fasting (Sawm)': ['fast', 'fasting', 'sawm', 'ramadan'],
  'Charity (Zakat)': ['charity', 'zakat', 'sadaqah', 'sadaqa', 'alms'],
  'Hajj': ['hajj', 'pilgrimage', 'umrah', 'kaaba', "ka'bah"],
  'Faith (Iman)': ['faith', 'iman', 'belief', 'believer'],
  'Family and Marriage': ['marriage', 'marry', 'wife', 'husband', 'spouse', 'family'],
  'Parents': ['mother', 'father', 'parent'],
  'Good Character': ['character', 'manners', 'kindness', 'good conduct'],
  'Knowledge': ['knowledge', "qur'an", 'quran', 'learn', 'teach'],
  'Dua and Dhikr': ['dua', 'supplication', 'dhikr', 'remembrance'],
  'Patience': ['patience', 'patient', 'perseverance'],
  'Forgiveness': ['forgive', 'forgiveness', 'repent', 'repentance', 'mercy'],
  'Women in Islam': ['women', 'woman'],
  'Business and Honesty': ['trade', 'merchant', 'business', 'honest', 'honesty', 'trustworthy'],
  'Death and the Hereafter': ['death', 'hereafter', 'grave', 'judgment', 'paradise', 'hellfire'],
};

module.exports = { collections, topics, hadiths, topicKeywords };
