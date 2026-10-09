/*
 * Maudhui ya utafiti (survey content).
 * Faili hii inatumika na ukurasa (index.html) NA na seva (api/submit.js),
 * kwa hiyo badiliko lolote la swali au chaguo lifanyike hapa tu.
 *
 * type:  single | multi | scale | nps | matrix | yesno | text | name | phone
 * required: true  -> lazima lijibiwe
 * showIf: { id, equals } -> swali linaonekana tu kama jibu la swali `id` ni `equals`
 * other: chaguo ambalo likichaguliwa linaonyesha kisanduku cha "Tafadhali taja"
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SURVEY = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var SCALE_LABELS = ['Sijaridhika kabisa', 'Sijaridhika', 'Wastani', 'Nimeridhika', 'Nimeridhika sana'];

  return {
    title: 'Utafiti wa Kuridhika kwa Wateja',
    event: 'Wiki ya Huduma kwa Wateja 2026',
    date: 'Oktoba 2026',
    intro: [
      'Sauti yako inaboresha jinsi tunavyokuhudumia.',
      'Tueleze tunachofanya vizuri na mahali tunapopaswa kuboresha. Itakuchukua takriban dakika 5.'
    ],
    privacy: 'Majibu yako ni siri. Hayataathiri kamwe mkopo wako wala maombi yako yoyote ya baadaye.',
    thanks: 'Asante kwa kutusaidia kukuhudumia vizuri zaidi.',
    scaleLabels: SCALE_LABELS,
    yes: 'Ndiyo',
    no: 'Hapana',

    sections: [
      {
        title: 'Kuhusu wewe',
        questions: [
          {
            id: 'q1', n: 1, type: 'single', required: true,
            text: 'Ni tawi au kituo gani cha huduma cha Victoria Finance kinachokuhudumia?',
            options: [
              'Kijitonyama (Makao Makuu), Dar es Salaam',
              'Mbezi, Dar es Salaam',
              'Dodoma',
              'Morogoro',
              'Dakawa, Morogoro (pamoja na Kilangali)',
              'Madibira, Mbeya',
              'Mafinga, Iringa',
              'Tandahimba, Mtwara',
              'Sina uhakika'
            ]
          },
          {
            id: 'q2', n: 2, type: 'single', required: true,
            text: 'Umekuwa mteja wa Victoria Finance kwa muda gani?',
            options: ['Chini ya mwaka 1', 'Mwaka 1 hadi miaka 2', 'Miaka 3 hadi 5', 'Zaidi ya miaka 5']
          },
          {
            id: 'q3', n: 3, type: 'multi', required: true, other: 'Nyingine',
            text: 'Ni huduma zipi za mikopo za Victoria Finance ulizowahi kutumia?',
            options: [
              'Mkopo wa Kilimo',
              'Mkopo wa Biashara',
              'Mkopo wa Ufugaji wa Kuku',
              'Mkopo wa Elimu',
              'Rise Up Queen',
              'Mkopo wa Nyumba (Microhousing)',
              'Mkopo wa Watumishi wa Serikali',
              'Mkopo wa Matumizi Binafsi au Dharura',
              'Nyingine'
            ]
          }
        ]
      },
      {
        title: 'Huduma yetu kwa wateja',
        questions: [
          {
            id: 'q4', n: 4, type: 'scale', required: true,
            text: 'Kwa ujumla, umeridhika kiasi gani na Victoria Finance?'
          },
          {
            id: 'q5', n: 5, type: 'nps', required: true,
            text: 'Kuna uwezekano gani wa kumshauri rafiki au ndugu yako kuja Victoria Finance?',
            lowLabel: '0 = Haiwezekani kabisa',
            highLabel: '10 = Inawezekana sana'
          },
          {
            id: 'q6', n: 6, type: 'matrix', required: true,
            text: 'Umeridhika kiasi gani na kila moja ya haya yafuatayo?',
            items: [
              { id: 'a', text: 'Adabu na heshima ya wafanyakazi wetu' },
              { id: 'b', text: 'Wafanyakazi husikiliza na kutoa majibu yaliyo wazi' },
              { id: 'c', text: 'Kasi ya kuhudumiwa tawini' },
              { id: 'd', text: 'Muda kuanzia kuomba hadi kupokea mkopo' },
              { id: 'e', text: 'Riba, ada na utaratibu wa marejesho vilielezwa kwa uwazi' },
              { id: 'f', text: 'Urahisi wa kufanya marejesho' }
            ]
          }
        ]
      },
      {
        title: 'Changamoto na mapendekezo yako',
        questions: [
          {
            id: 'q7', n: 7, type: 'yesno', required: true,
            text: 'Katika miezi 12 iliyopita, umewahi kupata tatizo au kuwa na malalamiko kuhusu huduma yetu?'
          },
          {
            id: 'q8', n: 8, type: 'multi', required: true, other: 'Nyingine',
            showIf: { id: 'q7', equals: 'Ndiyo' },
            text: 'Tatizo lilihusu nini?',
            options: [
              'Kuchelewa kupata mkopo wangu',
              'Tabia au lugha ya wafanyakazi',
              'Gharama au masharti ya mkopo hayakuwa wazi',
              'Marejesho au ufuatiliaji wa madeni',
              'Mawasiliano duni au kutopata mrejesho',
              'Nyingine'
            ]
          },
          {
            id: 'q9', n: 9, type: 'single', required: true,
            showIf: { id: 'q7', equals: 'Ndiyo' },
            text: 'Lilishughulikiwa vipi?',
            options: ['Lilitatuliwa kikamilifu', 'Lilitatuliwa kwa sehemu', 'Halikutatuliwa', 'Sikuliripoti']
          },
          {
            id: 'q10', n: 10, type: 'multi', required: true,
            text: 'Ni kipi kati ya haya kingekusaidia zaidi?',
            options: [
              'Kiasi kikubwa zaidi cha mkopo',
              'Muda mrefu zaidi wa kurejesha mkopo',
              'Kuidhinishiwa mkopo kwa haraka zaidi',
              'Gharama nafuu za kukopa',
              'Kuomba na kufuatilia mkopo wangu kwa simu',
              'Bima (mazao, afya, maisha, mali)',
              'Mafunzo ya elimu ya fedha'
            ]
          },
          {
            id: 'q11', n: 11, type: 'text', required: false,
            text: 'Tuboreshe nini kwanza katika huduma yetu kwa wateja?'
          },
          {
            id: 'q12', n: 12, type: 'text', required: false,
            text: 'Je, una pendekezo au maoni mengine yoyote kwetu?'
          }
        ]
      },
      {
        title: 'Ungependa tukupigie simu kuhusu maoni yako?',
        note: 'Andika jina lako na namba ya simu. Hii ni hiari.',
        questions: [
          { id: 'q13', n: 13, type: 'name', required: false, text: 'Jina lako' },
          { id: 'q14', n: 14, type: 'phone', required: false, text: 'Namba ya simu' }
        ]
      }
    ]
  };
});
