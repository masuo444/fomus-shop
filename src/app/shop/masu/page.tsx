import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/product/ProductCard'
import { getPublishedShopIds } from '@/lib/shop'
import { getCurrency } from '@/lib/currency'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import type { Product } from '@/lib/types'
import siteConfig from '@/site.config'

export const metadata: Metadata = {
  title: '枡（ます・升・桝）の購入・名入れ・オーダーメイド | 国産ヒノキ枡専門',
  description:
    '国産ヒノキ（檜）を使用した高品質な枡（ます）の通販・販売。全8サイズ（三勺枡〜一升枡）を取り揃え。名入れ・焼印・レーザー刻印・企業ロゴ入りのオーダーメイドも対応。結婚祝い・記念品・企業ノベルティ・日本酒用ギフトに。1300年の伝統を受け継ぐ枡職人の技。FOMUS公式オンラインショップ。',
  keywords: [
    '枡', '升', '桝', 'ます', '枡 購入', '枡 通販', '枡 販売',
    'ヒノキ枡', '檜枡', '名入れ枡', '枡 ギフト', '枡 プレゼント',
    '枡 オーダーメイド', '枡 名入れ', '枡 ノベルティ', '枡 記念品',
    '一合枡', '五勺枡', '八勺枡', '三勺枡', '一升枡', '五合枡',
    '日本酒 枡', '枡 日本酒', 'もっきり', '枡酒',
    '枡 結婚祝い', '枡 引き出物', '枡 企業ギフト',
    '枡 節分', '枡 鏡開き', '枡 お手入れ',
    '枡 歴史', '枡 サイズ', '枡 選び方',
    '枡 海外発送', '枡 お土産',
  ].join(','),
  openGraph: {
    title: '枡（ます）の購入・名入れ・オーダーメイド | FOMUS SHOP',
    description: '国産ヒノキの高品質な枡を全8サイズ販売。名入れ・焼印・レーザー刻印対応。結婚祝い・記念品・企業ノベルティに。1300年の伝統を受け継ぐ職人の技。',
    type: 'website',
  },
  alternates: {
    canonical: '/shop/masu',
  },
}

// Masu size/type reference data
const masuTypes = [
  { name: '三勺枡', reading: 'さんしゃくます', size: '56×56×39mm', capacity: '54ml', capacityNote: 'おちょこ約1杯分', use: 'インテリア・飾り枡・アクセサリー入れ・ミニギフト', price: '¥500〜' },
  { name: '五勺枡', reading: 'ごしゃくます', size: '67×67×47mm', capacity: '100ml', capacityNote: 'ワイングラス約半分', use: '日本酒・お祝い・プチギフト・名入れ記念品', price: '¥600〜' },
  { name: '八勺枡', reading: 'はっしゃくます', size: '76×76×51mm', capacity: '144ml', capacityNote: '湯のみ約1杯分', use: '日本酒・乾杯枡・記念品・飲食店', price: '¥700〜' },
  { name: '一合枡', reading: 'いちごうます', size: '85×85×56mm', capacity: '180ml', capacityNote: '牛乳瓶1本分', use: '日本酒の定番・名入れ・ギフト・節分', price: '¥800〜' },
  { name: '二合半枡', reading: 'にごうはんます', size: '117×117×75mm', capacity: '450ml', capacityNote: 'ペットボトル約半分', use: '小物入れ・ディスプレイ・節分の豆入れ', price: '¥1,200〜' },
  { name: '五合枡', reading: 'ごごうます', size: '135×135×92mm', capacity: '900ml', capacityNote: '一升瓶の半分', use: '節分・豆まき・インテリア・鏡開き', price: '¥1,800〜' },
  { name: '一升枡', reading: 'いっしょうます', size: '170×170×92mm', capacity: '1800ml', capacityNote: '一升瓶1本分', use: '鏡開き・イベント・大型ディスプレイ', price: '¥2,500〜' },
]

// Selection guide: purpose → recommended size
const selectionGuide = [
  { purpose: '日本酒を飲む（普段使い）', recommended: '一合枡（180ml）', reason: '日本酒一合分がぴったり入る定番サイズ。「もっきり」スタイルで楽しむなら八勺枡も人気です。' },
  { purpose: '日本酒を飲む（少量・おちょこ代わり）', recommended: '五勺枡（100ml）', reason: '少量をゆっくり味わいたい方に。おちょこより大きく、一合枡より小さい絶妙なサイズ。' },
  { purpose: '結婚祝い・引き出物', recommended: '五勺枡 or 一合枡 + 名入れ', reason: '名前や日付を刻印して世界に一つだけのギフトに。ペアで贈るのも人気です。' },
  { purpose: '企業ノベルティ・記念品', recommended: '一合枡 + ロゴ入れ', reason: '企業ロゴや社名を焼印・レーザーで刻印。周年記念、顧客ギフト、イベント配布に最適。' },
  { purpose: '節分の豆まき', recommended: '五合枡（900ml）', reason: '豆まきに使う枡として最も一般的なサイズ。家族分の豆がしっかり入ります。' },
  { purpose: '鏡開き・イベント', recommended: '一升枡（1800ml）', reason: '式典や祝い事の鏡開きに。迫力のある大型サイズで場を盛り上げます。' },
  { purpose: 'インテリア・小物入れ', recommended: '三勺枡 or 二合半枡', reason: '三勺枡はアクセサリー入れに、二合半枡はペン立てや小物入れにぴったりのサイズ。' },
  { purpose: '海外の方へのお土産', recommended: '一合枡 + 名入れ', reason: '日本の伝統工芸品として喜ばれます。名前をローマ字で刻印するのも人気です。' },
]

// Manufacturing process
const manufacturingSteps = [
  { step: 1, title: '木材の仕入れ', desc: '日本有数のヒノキの産地に近い岐阜県大垣市で、良質な国産ヒノキの端材を仕入れます。建築材として使用された後の端材を活用することで、森の資源を余すことなく使い切ります。' },
  { step: 2, title: '乾燥', desc: '木の水分や油分を散らします。天日干しや乾燥場での燻し、電気ヒーターなどを使い分け、天日干しの場合は冬に仕入れた材料を夏まで待ち、ひと夏かけてじっくり干します。' },
  { step: 3, title: 'モルダー加工', desc: '4軸モルダーでヒノキの板材の4面を同時に削り加工。一合枡だけでもおよそ一日2,000枚の板材を加工します。' },
  { step: 4, title: '駒切り', desc: 'ジャンピングソーで板を枡の寸法に合わせてカット。一合枡の場合、1日に側板用8,000枚、底板用2,000枚を裁断します。' },
  { step: 5, title: 'カッター（ほぞ加工）', desc: 'ロッキングカッターで枡の組目となる溝（ほぞ）を掘ります。精密な溝加工が、枡の強度と美しさを決定づける重要な工程です。' },
  { step: 6, title: 'のり付け', desc: '溝の間にブラシで糊を塗ります。食品安全衛生上問題のない木工用接着剤を使用しています。' },
  { step: 7, title: '組み（仮組・本締）', desc: '駒4枚を一組で四角に組み、圧をかけます。「あられ組」と呼ばれるこの技術が、液体まで保持できる性能と枡の美しさを実現します。' },
  { step: 8, title: '底付け', desc: '木枠に底板を貼り付けます。ここで初めて枡の原形が完成します。' },
  { step: 9, title: '仕上げ削り', desc: '円盤カンナで側面4面を一気に削ります。研ぎ澄まされた職人の手先の感覚と機械の絶妙な調和が、なめらかな手触りを生み出します。' },
  { step: 10, title: '面取り', desc: '製品の角を丸め、やさしい手触りや口当たりに仕上げます。全12辺の面を丁寧に取り、枡が完成します。' },
  { step: 11, title: '名入れ加工', desc: 'オリジナルデザインや名入れを施します。焼印（約400度の銅版で押す伝統技法）、レーザー刻印（濃淡・写真表現が可能）、シルクプリント（唯一カラー対応）の3種類から選べます。' },
  { step: 12, title: '検品・梱包・出荷', desc: '一つひとつ検品し、ヒノキの削り節を緩衝材として使用して梱包。脱プラスチックにも取り組んでいます。' },
]

// Care guide
const careGuide = {
  before: {
    title: 'ご使用前',
    content: '枡の原材料であるヒノキには天然の殺菌作用があり、衛生的に生産されていますので、そのままご使用いただけます。気になる場合は乾いた布巾で枡の内側を軽く拭いてください。',
  },
  after: {
    title: 'ご使用後',
    content: 'なるべく早く枡の内側と飲み口を水でさっと洗い流してください。軽く水を切って、底を上にして自然乾燥させます。外側はあまり濡らさないようにしましょう。',
  },
  storage: {
    title: '保管方法',
    content: '湿気の少ない暗所での保管をおすすめします。高温多湿な場所や直射日光にさらすと、割れ・ヤニ・漏れの原因となります。',
  },
  cleaning: {
    title: '洗剤について',
    content: '無加工の枡には食器用洗剤は使用しないでください。塩や重曹でやさしくこすり洗いし、水ですすぎます。ウレタン加工された枡は、中性洗剤を使いスポンジでやさしく洗えます。',
  },
  sticky: {
    title: 'ベタつき（ヤニ）が出たら',
    content: 'ヤニは天然木材にはつきもので、完全に防ぐことは難しいです。乾いた布やキッチンペーパーにエタノール（消毒用アルコール）を含ませ、ベタつく部分を拭き取ってください。',
  },
  caution: {
    title: 'ご注意',
    items: [
      '長時間の浸け置き洗いはお控えください',
      '食洗機・乾燥機の使用はお控えください',
      '電子レンジでの使用はできません',
      '水に長時間浸さないでください',
    ],
  },
}

const faqItems = [
  // 枡の基本
  {
    q: '枡（ます）とは何ですか？',
    a: '枡（ます）は、古来より穀物や液体を量るために使われてきた日本の伝統的な木製の器です。漢字では「枡」「升」「桝」と複数の表記があります。主に国産ヒノキ（檜）で作られ、ヒノキの自然な香りが日本酒の味わいを引き立てます。「枡」は「益」（ますます繁栄する）に通じることから、古くから縁起物として祝い事やギフトに広く使われてきました。約1300年の歴史を持つ日本の伝統工芸品です。',
  },
  {
    q: '「枡」「升」「桝」の違いは何ですか？',
    a: 'いずれも「ます」と読み、同じものを指します。「升」は最も古い漢字で、一升・一合などの単位として使われます。「枡」は「木」と「升」を組み合わせた国字（日本で作られた漢字）で、木製の計量器そのものを表します。「桝」も同様に「木」と「升」の組み合わせで、排水枡など建築用語でも使われます。一般的な木製の枡を指す場合、「枡」の表記が最も広く使われています。',
  },
  // サイズ・選び方
  {
    q: '枡のサイズにはどんな種類がありますか？',
    a: '一般的なサイズは、三勺枡（54ml）、五勺枡（100ml）、八勺枡（144ml）、一合枡（180ml）、二合半枡（450ml）、五合枡（900ml）、一升枡（1800ml）の全7サイズです。「勺（しゃく）」「合（ごう）」「升（しょう）」は日本の伝統的な体積の単位で、1合＝180ml、1升＝1800ml（1合の10倍）が基準です。日本酒を飲むには一合枡が最も定番のサイズです。',
  },
  {
    q: '一合枡の大きさはどのくらいですか？',
    a: '一合枡の外寸は約85×85×56mmで、容量は180ml（牛乳瓶1本分とほぼ同じ）です。手のひらに収まるサイズで、日本酒を飲むための最も標準的な枡です。550mlペットボトルの約3分の1の容量にあたります。',
  },
  {
    q: '日本酒を飲むのに最適なサイズは？',
    a: '最も定番は一合枡（180ml）です。日本酒一合分がぴったり入ります。少量をゆっくり味わいたい方には五勺枡（100ml）や八勺枡（144ml）もおすすめです。居酒屋でグラスの下に枡を敷いて溢れさせる「もっきり」スタイルには八勺枡がよく使われます。',
  },
  {
    q: '節分の豆まきに使う枡のサイズは？',
    a: '節分の豆まきには五合枡（900ml）が最も一般的です。家族分の豆がしっかり入り、手で持って撒きやすいサイズです。神社やお寺の節分祭では一升枡（1800ml）が使われることもあります。三勺枡や五勺枡に少量の豆を入れて飾りとして使うのも人気です。',
  },
  {
    q: '鏡開きに使う枡のサイズは？',
    a: '鏡開き（樽酒を開ける儀式）で乾杯に使う枡は、一合枡（180ml）または八勺枡（144ml）が一般的です。イベントや式典の鏡開きでは、企業ロゴや日付を名入れした一合枡を参加者に配布するケースが多いです。',
  },
  // 素材・品質
  {
    q: '枡の素材は何ですか？',
    a: '当店の枡はすべて国産ヒノキ（檜）を使用しています。日本有数のヒノキの産地に近い岐阜県大垣市で仕入れた良質な天然ヒノキです。ヒノキは抗菌・防カビ性に優れ、「フィトンチッド」という成分が森林浴のようなリラックス効果をもたらします。美しい木目と淡黄色の色合い、なめらかな木肌が特徴で、食品との相性も抜群です。',
  },
  {
    q: '枡で日本酒を飲むとなぜ美味しいのですか？',
    a: 'ヒノキには「ヒノキチオール」や「フィトンチッド」などの天然の芳香成分が含まれています。枡に日本酒を注ぐと、ヒノキの爽やかな香りが日本酒の風味と調和し、グラスでは味わえない独特の美味しさが生まれます。また、木肌から微かに溶け出すヒノキの成分が日本酒にまろやかさを加えるとも言われています。視覚的にも木の温もりが「和」の雰囲気を演出し、五感で日本酒を楽しめます。',
  },
  {
    q: '枡は液体を入れても漏れませんか？',
    a: 'はい、正しく製作された枡は液体を保持できます。「あられ組」と呼ばれる伝統的な組み方と、食品安全上問題のない接着剤を使用することで、液体が漏れない構造になっています。ただし長時間の使用で乾燥すると隙間ができることがあります。その場合は使用前に水を入れて10分ほど置くと木が膨張し、再び漏れにくくなります。',
  },
  // 名入れ・オーダーメイド
  {
    q: '名入れ・焼印はできますか？',
    a: 'はい、対応しています。お名前、企業ロゴ、記念日、メッセージなどを刻印できます。加工方法は3種類あります。①焼印：約400度の銅版を押し付ける伝統技法で、白黒のみですが味わいのある仕上がりに。②レーザー刻印：濃淡や写真表現も可能で、細かいデザインに対応。③シルクプリント：唯一カラー対応可能で、鮮やかなデザインが表現できます。結婚式の引き出物、企業ノベルティ、記念品などに人気です。',
  },
  {
    q: '何個から注文できますか？',
    a: '1個からご注文いただけます。名入れ・オーダーメイドも小ロットから対応しています。企業ノベルティなどの大口注文（100個以上）も承っており、数量に応じた価格のご案内が可能です。まずはオーダーメイド相談フォームからお気軽にお問い合わせください。',
  },
  {
    q: '手書きのデザインでも名入れできますか？',
    a: 'はい、手書きのイラストや筆文字なども対応可能です。手書きのデザインをスキャンまたは撮影してお送りいただければ、データ化して刻印いたします。細かい線や文字が多いデザインの場合は、仕上がりについて事前にご相談させていただくことがあります。',
  },
  // お手入れ
  {
    q: '枡のお手入れ方法は？',
    a: '使用後はなるべく早く枡の内側と飲み口を水でさっと洗い流し、底を上にして自然乾燥させてください。ポイントは3つです。①使用後は「すぐ水洗い、すぐ自然乾燥」②外側をなるべく濡らさない③水に長時間浸さない。無加工の枡には食器用洗剤は使わず、塩や重曹でやさしく洗います。ウレタン加工された枡は中性洗剤とスポンジで洗えます。',
  },
  {
    q: '枡にカビやヤニが出た場合はどうすればいいですか？',
    a: 'ヤニ（ベタつき）は天然のヒノキには起こりうる現象で、品質に問題はありません。エタノール（消毒用アルコール）を含ませた布やキッチンペーパーで拭き取ってください。カビが発生した場合も同様にアルコールで拭き取り、風通しの良い場所でしっかり乾燥させてください。保管は湿気の少ない暗所がおすすめです。',
  },
  {
    q: '枡の寿命はどのくらいですか？',
    a: '適切にお手入れすれば、枡は何年もお使いいただけます。直射日光や高温多湿を避け、使用後にしっかり乾燥させることが長持ちのコツです。経年変化でヒノキの色味が深まり、使い込むほどに味わいが増していきます。木の香りが薄くなった場合は、軽くヤスリがけをすると再びヒノキの香りを楽しめます。',
  },
  {
    q: '食洗機は使えますか？',
    a: 'いいえ、食洗機・乾燥機の使用はお控えください。高温と水圧により、割れや変形の原因になります。電子レンジでの使用もできません。手洗いで水洗いし、自然乾燥させてください。',
  },
  // 文化・歴史
  {
    q: '「もっきり」とは何ですか？',
    a: '「もっきり（盛り切り）」は、居酒屋や日本酒バーでの日本酒の提供スタイルです。グラスを枡の中に置き、グラスから溢れるまで日本酒を注ぎます。枡に溜まった日本酒も楽しめるため「お得感」があり、日本酒ファンに人気の飲み方です。八勺枡や一合枡が使われ、グラスと枡の両方でヒノキの香りとともに日本酒を味わえます。',
  },
  {
    q: '枡が縁起物とされる理由は？',
    a: '枡（ます）は「益す」＝「増す」「益々繁栄」に通じることから、古くから縁起の良いものとされてきました。お正月の祝い酒を枡で飲む習慣や、節分の豆まきに枡を使う風習はこの縁起担ぎに由来します。結婚式では「幸せが益す」、商売では「商い益々繁盛」、新築では「益々発展」の意味を込めて贈られます。',
  },
  {
    q: '枡はどうやって処分すればいいですか？',
    a: '枡は天然木（ヒノキ）でできているため、自治体の分別に従い燃えるゴミとして処分できます。ただし縁起物としていただいた枡は、神社で「お焚き上げ」をしていただく方法もあります。まだ使える状態であれば、小物入れやインテリアとして再活用するのもおすすめです。',
  },
  // 配送
  {
    q: 'オーダーメイドの納期はどのくらいですか？',
    a: '名入れ枡は通常2〜3週間程度で製作・発送いたします。数量やデザインの内容によって異なりますので、お気軽にご相談ください。お急ぎの場合も可能な限り対応いたします。大口注文（100個以上）の場合は3〜4週間程度を目安としています。',
  },
  {
    q: '海外発送は対応していますか？',
    a: 'はい、海外発送にも対応しています。アジア、北米、ヨーロッパなど世界各地への発送実績がございます。日本の伝統工芸品として海外の方へのギフトに、また海外在住の日本人の方にもご利用いただいています。送料は地域・重量によって異なりますので、お問い合わせください。',
  },
]

export default async function MasuPage() {
  const supabase = await createClient()
  const currency = await getCurrency()
  const shopIds = await getPublishedShopIds()

  // Load masu-related products
  let products: Product[] = []
  if (shopIds.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .eq('item_type', 'physical')
      .or('name.ilike.%枡%,name.ilike.%masu%,name.ilike.%ます%')
      .order('created_at', { ascending: false })

    products = data || []

    if (products.length === 0) {
      const { data: allProducts } = await supabase
        .from('products')
        .select('*')
        .in('shop_id', shopIds)
        .eq('is_published', true)
        .eq('item_type', 'physical')
        .order('created_at', { ascending: false })
        .limit(8)

      products = allProducts || []
    }
  }

  // FAQ JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  // Store + OfferCatalog JSON-LD
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop.fomus.co.jp'
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: `${siteConfig.name} — 国産ヒノキ枡の専門店`,
    description: '国産ヒノキ（檜）枡の販売・名入れ・オーダーメイド。1300年の伝統を受け継ぐ枡職人の技。ギフト・記念品・ノベルティに対応。全7サイズ取り揃え。',
    url: `${baseUrl}/shop/masu`,
    brand: {
      '@type': 'Brand',
      name: 'FOMUS',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '枡（ます）コレクション',
      itemListElement: masuTypes.map((m) => ({
        '@type': 'Product',
        name: m.name,
        description: `${m.name}（${m.reading}） — 外寸: ${m.size} / 容量: ${m.capacity}（${m.capacityNote}） / 用途: ${m.use}`,
        material: '国産ヒノキ（檜）',
        brand: { '@type': 'Brand', name: 'FOMUS' },
      })),
    },
  }

  // HowTo JSON-LD for care guide
  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: '枡のお手入れ方法',
    description: 'ヒノキ枡を長持ちさせるためのお手入れ方法。使用前の準備から使用後の洗い方、保管方法まで。',
    step: [
      { '@type': 'HowToStep', name: '使用後すぐ水洗い', text: '使用後はなるべく早く枡の内側と飲み口を水でさっと洗い流します。' },
      { '@type': 'HowToStep', name: '水を切る', text: '軽く水を切って、底を上にして自然乾燥させます。' },
      { '@type': 'HowToStep', name: '保管', text: '湿気の少ない暗所で保管します。高温多湿や直射日光を避けてください。' },
    ],
  }

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: '商品一覧', href: '/shop' },
        { name: '枡（ます）', href: '/shop/masu' },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />

      <div>
        {/* ===== HERO ===== */}
        <section className="bg-[var(--foreground)] py-24 md:py-36">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-[10px] tracking-[0.4em] uppercase text-white/25 mb-6">
                国産ヒノキ枡の専門店 — 1300年の伝統
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-light text-white leading-[1.2]">
                枡（ます）の購入・
                <br />
                名入れ・オーダーメイド
              </h1>
              <p className="mt-8 text-sm leading-[2] text-white/40 max-w-lg">
                FOMUSは、日本の伝統工芸「枡（升・桝）」を起点にしたクリエイティブブランドです。
                岐阜県大垣市の枡職人が一つひとつ手がけた国産ヒノキの枡を、スタンダードからアート枡、名入れ・オーダーメイドまで幅広く取り揃えています。
              </p>
              <div className="mt-10 flex items-center gap-6 flex-wrap">
                <a href="#products" className="btn-primary inline-block" style={{ background: '#FAF8F5', color: '#1A1A1A' }}>
                  商品を見る
                </a>
                <Link href="/shop/masu/custom" className="btn-outline inline-block" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}>
                  オーダーメイド相談
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 枡とは — 歴史と文化 ===== */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="max-w-3xl mx-auto">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-6 text-center">About Masu</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)] leading-[1.4] text-center" style={{ fontFamily: "'Noto Serif JP', var(--font-serif), Georgia, serif" }}>
                枡とは — 1300年の歴史
              </h2>

              <div className="mt-12 text-sm leading-[2.4] text-[var(--color-muted)] space-y-8">
                <div>
                  <h3 className="text-base font-medium text-[var(--foreground)] mb-3">日本の伝統工芸「枡（ます）」</h3>
                  <p>
                    枡（ます）は、約1300年前から穀物や液体を量るために使われてきた日本の伝統的な木製の器です。
                    漢字では<strong className="text-[var(--foreground)]">「枡」「升」「桝」</strong>と複数の表記があり、
                    「升」は最も古い漢字で一升・一合などの単位として使われ、「枡」は木製の器そのものを表す国字（日本で作られた漢字）です。
                  </p>
                  <p className="mt-4">
                    主に<strong className="text-[var(--foreground)]">国産ヒノキ（檜）</strong>で作られ、
                    ヒノキの自然な香りが日本酒の味わいを引き立てます。
                    「枡」は<strong className="text-[var(--foreground)]">「益」（ますます繁栄する）</strong>に通じることから、
                    古くから縁起物として祝い事やギフトに広く使われています。
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-medium text-[var(--foreground)] mb-3">飛鳥〜奈良時代：日本最古の枡</h3>
                  <p>
                    日本最古の枡は、奈良の平城京跡近くから出土した木枡です。
                    西暦701年に施行された「大宝律令」で量るという概念が制度化され、
                    1300年以上前から枡が計量器として使われていたと考えられています。
                    中国や朝鮮半島では陶器や金属のはかりが主流でしたが、
                    木の文化が根づく日本では木製の四角い枡が独自に発展しました。
                    まさに日本ならではの伝統工芸品といえます。
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-medium text-[var(--foreground)] mb-3">平安〜室町時代：暮らしを支えた枡</h3>
                  <p>
                    この時代、枡は穀物や酒、油だけでなく、芋や小魚、繭まであらゆるものの計量に使われました。
                    農民にとっては、種まきから収穫量の計量、年貢の計算、家族の翌年までの食糧管理まで、
                    一年を通じて欠くことのできない生活必需品でした。
                    ただし当時は「一升」の大きさが地域や時代によって異なり、
                    年貢を少しでも多く集めたい領主が枡を大きくするなど、統一されていませんでした。
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-medium text-[var(--foreground)] mb-3">安土桃山時代：豊臣秀吉と「京枡」の統一</h3>
                  <p>
                    地域によってバラバラだった枡の大きさを統一しようとしたのが、織田信長と豊臣秀吉です。
                    信長は「楽市楽座」の中で、商業発展には単位の統一が不可欠だと考えました。
                    その後、秀吉による<strong className="text-[var(--foreground)]">「太閤検地」</strong>によって、
                    京都で使用されていた「京枡」が全国基準となり、
                    現代にも用いられる<strong className="text-[var(--foreground)]">「一升＝約1.8リットル」</strong>という単位が定着しました。
                    日本で初めて一升の容量が全国統一で定義された歴史的な出来事です。
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-medium text-[var(--foreground)] mb-3">江戸時代：枡座と厳格な管理</h3>
                  <p>
                    徳川家康が江戸に入府した際には「江戸枡」という独自の枡が使われ、
                    しばらく「京枡」と「江戸枡」の二つの基準が併存しました。
                    江戸幕府は京都と江戸それぞれに<strong className="text-[var(--foreground)]">「枡座」</strong>を設け、
                    枡の製作から販売まで厳格に管理。1669年に京枡に統一されました。
                    大名の力が「百万石」のように米の収穫高で表されるようになり、
                    枡で測る単位は富や景気の象徴となりました。
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-medium text-[var(--foreground)] mb-3">明治〜現代：計量器から文化のシンボルへ</h3>
                  <p>
                    明治時代にメートル法が導入されると、枡は計量器としての役割を終えました。
                    しかし昭和30年代、日本酒を枡で飲む光景がテレビで紹介されたことで
                    <strong className="text-[var(--foreground)]">酒器としての人気</strong>が高まります。
                    現在も日本酒の酒器として、節分の豆まきに、鏡開きの儀式に、そして
                    結婚式やお祝いの贈り物として、枡は日本人の暮らしの中に息づいています。
                  </p>
                  <p className="mt-4">
                    枡の単位である「升（しょう）」や「合（ごう）」は、
                    「一合炊き」「一升瓶」のように現代の日常でも使われ続けています。
                    FOMUSは、この1300年の伝統を守りながら、アートやテクノロジーを掛け合わせた
                    新しい枡の表現にも挑戦しています。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 国産ヒノキの魅力 ===== */}
        <section className="py-20 md:py-28 bg-[var(--color-subtle)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-4">Material</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">
                国産ヒノキ（檜）の魅力
              </h2>
              <p className="mt-4 text-xs text-[var(--color-muted)]">すべて日本産の天然ヒノキを使用</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--color-border)] max-w-5xl mx-auto">
              {[
                {
                  title: '木目の美しさ',
                  desc: 'まったく同じ木目は一つとしてありません。長年、森で育ってきた証。一つひとつ異なる表情が、枡を唯一無二の存在にします。淡黄色に近い落ち着いた色合いは清潔感があります。',
                },
                {
                  title: '抗菌・防カビ効果',
                  desc: 'ヒノキには天然の抗菌・防カビ成分が含まれています。食品との相性が抜群で、まな板やカウンターにも使われるほど衛生的。表面に汚れも付きにくい性質があります。',
                },
                {
                  title: 'リラックス効果',
                  desc: 'ヒノキの「フィトンチッド」は森林浴の爽やかなリフレッシュ感をもたらします。消臭・防臭効果、気分をリラックスさせストレスを軽減する効果が科学的にも認められています。',
                },
                {
                  title: 'なめらかな木肌',
                  desc: '高級木材であるヒノキは光沢があり、やわらかでなめらかな木肌が特徴。やさしい手触りと温もりを感じます。円盤カンナによる仕上げ削りで、つるりとした質感に。',
                },
                {
                  title: '香りが際立つ酒器',
                  desc: '「香りを売る」と言われるほど特有の芳香を持つヒノキ。日本酒を注ぐとヒノキの爽やかな香りが立ちのぼり、グラスでは味わえない独特の美味しさを演出します。',
                },
                {
                  title: '環境にやさしい素材',
                  desc: '住宅建築で使用された檜材の端材を活用しています。枡のために木を伐採するのではなく、使い道の限られた端材を活かすことで、森林資源の有効活用とSDGsに貢献しています。',
                },
              ].map((item) => (
                <div key={item.title} className="bg-[var(--background)] p-8 md:p-10">
                  <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">{item.title}</h3>
                  <p className="text-xs leading-[2.2] text-[var(--color-muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 製造工程 ===== */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-4">Craftsmanship</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">
                枡ができるまで — 職人の12工程
              </h2>
              <p className="mt-4 text-sm text-[var(--color-muted)] max-w-2xl mx-auto">
                シンプルに見える枡ですが、その製作には緻密さが求められます。
                正確に切り出した4枚の側板を組み、底板を貼り、カンナをかけて仕上げる。
                機械を使いながらもさまざまな工程で繊細な手作業を欠かすことができない枡づくりは、
                枡職人の知恵と匠の技が生きています。
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                {manufacturingSteps.map((item) => (
                  <div key={item.step} className="py-6 border-b border-[var(--color-border)]/50">
                    <div className="flex items-start gap-4">
                      <span className="text-[10px] tracking-[0.15em] text-[var(--color-muted)] font-mono mt-0.5 flex-shrink-0 w-6">
                        {String(item.step).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">{item.title}</h3>
                        <p className="text-xs leading-[2] text-[var(--color-muted)]">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 max-w-3xl mx-auto bg-[var(--color-subtle)] p-8 md:p-10">
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">「あられ組」— 枡の最重要技術</h3>
              <p className="text-xs leading-[2.2] text-[var(--color-muted)]">
                枡の側板を組み合わせる「あられ組」は、枡づくりの最も重要な技術です。
                ヒノキの特性を引き出し「木殺し」（木を圧縮して組む技法）を施した組みは、
                液体まで保持できる性能と、枡の美しさの両方を実現します。
                はかりとして活躍してきた枡にとって、形を強固に保つあられ組は欠かすことのできない技術であり、
                この技を継承し続けることが、日本の枡文化を守ることにつながっています。
              </p>
            </div>
          </div>
        </section>

        {/* ===== サイズ一覧 ===== */}
        <section className="py-20 md:py-28 bg-[var(--color-subtle)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-4">Size Guide</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">
                枡のサイズ一覧
              </h2>
              <p className="mt-4 text-sm text-[var(--color-muted)] max-w-2xl mx-auto">
                枡の単位には「勺（しゃく）」「合（ごう）」「升（しょう）」があり、
                1合＝180mlを基準に一桁ずつ異なります。全7サイズをご用意しています。
              </p>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block max-w-5xl mx-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-4 text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] font-normal">名称</th>
                    <th className="text-left py-4 text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] font-normal">読み方</th>
                    <th className="text-left py-4 text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] font-normal">外寸</th>
                    <th className="text-left py-4 text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] font-normal">容量</th>
                    <th className="text-left py-4 text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] font-normal">目安</th>
                    <th className="text-left py-4 text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] font-normal">おすすめ用途</th>
                  </tr>
                </thead>
                <tbody>
                  {masuTypes.map((m) => (
                    <tr key={m.name} className="border-b border-[var(--color-border)]/50">
                      <td className="py-4 font-medium text-[var(--foreground)]">{m.name}</td>
                      <td className="py-4 text-[var(--color-muted)] text-xs">{m.reading}</td>
                      <td className="py-4 text-[var(--color-muted)] text-xs">{m.size}</td>
                      <td className="py-4 text-[var(--color-muted)] text-xs">{m.capacity}</td>
                      <td className="py-4 text-[var(--color-muted)] text-xs">{m.capacityNote}</td>
                      <td className="py-4 text-[var(--color-muted)] text-xs">{m.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {masuTypes.map((m) => (
                <div key={m.name} className="bg-[var(--background)] p-5 border border-[var(--color-border)]">
                  <p className="font-medium text-[var(--foreground)] mb-1">{m.name}<span className="text-xs text-[var(--color-muted)] ml-2">（{m.reading}）</span></p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-muted)] mt-2">
                    <p>外寸: {m.size}</p>
                    <p>容量: {m.capacity}（{m.capacityNote}）</p>
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mt-2">{m.use}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-xs text-[var(--color-muted)]">
              ※ 外寸はおおよそのサイズです。天然木のため個体差があります。
            </p>
          </div>
        </section>

        {/* ===== 用途で選ぶ枡 ===== */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-4">Selection Guide</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">
                用途で選ぶ枡
              </h2>
              <p className="mt-4 text-sm text-[var(--color-muted)]">目的に合った枡のサイズをご案内します</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-0">
              {selectionGuide.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_180px_1fr] gap-4 md:gap-8 py-6 border-b border-[var(--color-border)]/50 items-start">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{item.purpose}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--foreground)] md:text-center bg-[var(--color-subtle)] px-3 py-1.5 inline-block md:w-full">{item.recommended}</p>
                  </div>
                  <div>
                    <p className="text-xs leading-[2] text-[var(--color-muted)]">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 枡の使い方・楽しみ方 ===== */}
        <section className="py-20 md:py-28 bg-[var(--color-subtle)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-4">Use Cases</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">
                枡の使い方・楽しみ方
              </h2>
            </div>

            <div className="max-w-5xl mx-auto space-y-16">
              {/* 日本酒 */}
              <div>
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">日本酒を枡で味わう</h3>
                <div className="text-sm leading-[2.2] text-[var(--color-muted)] space-y-4">
                  <p>
                    枡で日本酒を飲む文化は、昭和30年代にテレビで紹介されたことをきっかけに広まりました。
                    ヒノキの枡に日本酒を注ぐと、木の香りが酒の風味と調和し、
                    グラスやおちょこでは味わえない独特の美味しさが生まれます。
                  </p>
                  <p>
                    居酒屋や日本酒バーでは<strong className="text-[var(--foreground)]">「もっきり（盛り切り）」</strong>と呼ばれるスタイルが人気です。
                    グラスを枡の中に置き、グラスから溢れるまでたっぷりと日本酒を注ぎます。
                    枡に溜まった分も楽しめる贅沢な飲み方で、八勺枡や一合枡がよく使われます。
                    お祝いの席では「升（ます）」＝「益す」の縁起を担ぎ、
                    枡酒で乾杯する風習が今も続いています。
                  </p>
                  <p className="text-xs">おすすめサイズ：一合枡（定番）、八勺枡（もっきり）、五勺枡（少量をゆっくり）</p>
                </div>
              </div>

              {/* ギフト */}
              <div>
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">ギフト・記念品として贈る</h3>
                <div className="text-sm leading-[2.2] text-[var(--color-muted)] space-y-4">
                  <p>
                    枡は「益々繁栄」「商い益々繁盛」の縁起物。
                    結婚祝いには「幸せが益す」、新築祝いには「益々発展」の意味を込めて贈られます。
                    名入れをすれば、お名前・日付・メッセージを刻んだ世界に一つだけの贈り物に。
                    ペアの名入れ枡は結婚式の引き出物として定番の人気を誇ります。
                  </p>
                  <p>
                    海外の方へのお土産としても「日本の伝統工芸品」として非常に喜ばれます。
                    名前をローマ字で刻印したり、日本語のメッセージを入れたりと、
                    日本ならではの特別なギフトとして選ばれています。
                  </p>
                  <p className="text-xs">おすすめサイズ：五勺枡・一合枡 + 名入れ</p>
                </div>
              </div>

              {/* 企業ノベルティ */}
              <div>
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">企業ノベルティ・記念品</h3>
                <div className="text-sm leading-[2.2] text-[var(--color-muted)] space-y-4">
                  <p>
                    企業ロゴや社名を焼印・レーザー・シルクプリントで刻印したオリジナル枡は、
                    周年記念、株主総会、展示会、顧客ギフト、社員への記念品として多くの企業に採用されています。
                    「益々繁盛」の縁起と、日本の伝統を感じさせる上質なノベルティとして、
                    一般的な印刷グッズとは一線を画す特別感があります。
                  </p>
                  <p>
                    1個からのサンプル作成、100個以上の大口注文にも対応。
                    数量に応じた価格のご案内が可能です。手書きのロゴやイラストもデータ化して刻印できます。
                  </p>
                  <p className="text-xs">おすすめサイズ：一合枡 + 企業ロゴ入れ</p>
                </div>
              </div>

              {/* 節分・鏡開き */}
              <div>
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">節分の豆まき・鏡開き</h3>
                <div className="text-sm leading-[2.2] text-[var(--color-muted)] space-y-4">
                  <p>
                    節分に枡で豆をまくのは、「魔を滅する（魔滅＝まめ）」「ますます繁栄する」という
                    二重の縁起担ぎに由来します。神社やお寺の節分祭では大型の枡が使われ、
                    家庭では五合枡に豆を入れて「鬼は外、福は内」と撒くのが一般的です。
                  </p>
                  <p>
                    鏡開き（樽酒を木槌で開ける儀式）では、お酒を注ぐための枡が欠かせません。
                    結婚式、企業式典、開店祝いなどで鏡開きを行う際には、
                    日付やお名前を名入れした一合枡を参加者に配布するケースが多く、
                    記念品として持ち帰っていただけます。
                  </p>
                  <p className="text-xs">おすすめサイズ：五合枡（豆まき）、一合枡・八勺枡（鏡開き乾杯用）</p>
                </div>
              </div>

              {/* インテリア */}
              <div>
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">インテリア・暮らしの中で</h3>
                <div className="text-sm leading-[2.2] text-[var(--color-muted)] space-y-4">
                  <p>
                    酒器としてだけでなく、枡は暮らしのさまざまなシーンで活躍します。
                    三勺枡はアクセサリーやジュエリーの収納に、二合半枡はペン立てや文房具入れに、
                    観葉植物の鉢カバーとしても人気です。
                    ヒノキの香りがほのかに漂い、デスク周りやリビングに温もりを添えます。
                  </p>
                  <p>
                    近年ではキャンドルホルダー、加湿器、コーヒーカップ、お皿など、
                    枡の概念を覆す新しいプロダクトも生まれています。
                    FOMUSでは伝統的な枡に加え、アーティストとコラボレーションしたデザイン枡など、
                    インテリアとして映えるアイテムもご用意しています。
                  </p>
                  <p className="text-xs">おすすめサイズ：三勺枡（アクセサリー入れ）、二合半枡（小物入れ・ペン立て）</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== お手入れガイド ===== */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-4">Care Guide</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">
                枡のお手入れ方法
              </h2>
              <p className="mt-4 text-sm text-[var(--color-muted)] max-w-xl mx-auto">
                ポイントは3つだけ。①すぐ水洗い、すぐ乾燥　②外側を濡らさない　③水に浸さない
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--color-border)]">
                {Object.entries(careGuide).filter(([key]) => key !== 'caution').map(([key, item]) => (
                  <div key={key} className="bg-[var(--background)] p-8">
                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">{(item as { title: string; content: string }).title}</h3>
                    <p className="text-xs leading-[2.2] text-[var(--color-muted)]">{(item as { title: string; content: string }).content}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-red-50 border border-red-100 p-6 md:p-8">
                <h3 className="text-sm font-medium text-red-800 mb-3">{careGuide.caution.title}</h3>
                <ul className="space-y-2">
                  {careGuide.caution.items.map((item, i) => (
                    <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">×</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 bg-[var(--color-subtle)] p-6 md:p-8">
                <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">ヒノキの削り節の活用法</h3>
                <p className="text-xs leading-[2.2] text-[var(--color-muted)]">
                  枡を製造する過程で出るヒノキの削り節は、さまざまな形で活用できます。
                  お風呂に浮かべれば「プチヒノキ風呂」として森林浴のようなリラックスタイムに。
                  布袋に入れてクローゼットや引き出しに置けば天然の芳香剤・防虫剤として。
                  枡と一緒にお届けする際の緩衝材にも使用しており、プラスチックに頼らない梱包を実現しています。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 名入れ・オーダーメイド CTA ===== */}
        <section className="bg-[var(--foreground)] py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/25 mb-6">
              Custom Order
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-white">
              名入れ・オーダーメイド枡
            </h2>
            <p className="mt-6 text-sm leading-[2] text-white/40 max-w-2xl mx-auto">
              お名前、企業ロゴ、記念日、メッセージを焼印・レーザー刻印・シルクプリントで。
              世界に一つだけの枡をお作りします。1個から大口注文まで対応。
              手書きのイラストや筆文字のデータ化も承ります。
            </p>
            <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
              <Link
                href="/shop/masu/custom"
                className="btn-primary inline-block"
                style={{ background: '#FAF8F5', color: '#1A1A1A' }}
              >
                オーダーメイド相談
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto text-left">
              {[
                { label: '焼印', desc: '約400度の銅版で押す伝統技法。白黒のみ。味わいのある仕上がりで大量生産向き。' },
                { label: 'レーザー刻印', desc: '濃淡・写真表現が可能。凹凸のある仕上がりで細かいデザインに対応。' },
                { label: 'シルクプリント', desc: '唯一カラー対応可能。版を製作し1色ずつ加工。鮮やかなデザインに。' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium text-white/70 mb-1">{item.label}</p>
                  <p className="text-[11px] leading-[1.8] text-white/30">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {[
                { label: '名前入り', desc: '結婚・出産祝い' },
                { label: '企業ロゴ', desc: 'ノベルティ・記念品' },
                { label: 'メッセージ', desc: '感謝・お祝い' },
                { label: 'デザイン枡', desc: 'アート・コラボ' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-xs font-medium text-white/70">{item.label}</p>
                  <p className="text-[10px] text-white/30 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 商品一覧 ===== */}
        <section id="products" className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-4">Products</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">
                枡の商品一覧
              </h2>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} currency={currency} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-sm text-[var(--color-muted)]">商品を準備中です</p>
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/shop" className="btn-outline inline-block">
                全商品を見る
              </Link>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="py-24 md:py-32 bg-[var(--color-subtle)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-4">FAQ</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">
                よくある質問
              </h2>
              <p className="mt-4 text-xs text-[var(--color-muted)]">枡に関するよくあるご質問にお答えします</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-0">
              {faqItems.map((item, i) => (
                <details key={i} className="group border-b border-[var(--color-border)]">
                  <summary className="flex items-center justify-between py-6 cursor-pointer text-sm font-medium text-[var(--foreground)] hover:text-[var(--color-muted)] transition-colors">
                    {item.q}
                    <span className="text-[var(--color-muted)] ml-4 flex-shrink-0 group-open:rotate-45 transition-transform duration-300 text-lg">+</span>
                  </summary>
                  <p className="pb-6 text-sm leading-[2] text-[var(--color-muted)] pr-8">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 環境への取り組み ===== */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-6">Sustainability</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)] mb-8">
                環境にやさしい枡づくり
              </h2>
              <div className="text-sm leading-[2.4] text-[var(--color-muted)] text-left space-y-4">
                <p>
                  私たちが使用する木材は、住宅建築で使われるヒノキの<strong className="text-[var(--foreground)]">端材（はざい）</strong>です。
                  枡のために木を伐採するのではなく、建築後に切り落とされた「端っこの材料」を活用しています。
                  サイズ豊富な枡づくりだからこそ、さまざまな端材を無駄なく使い切ることができます。
                </p>
                <p>
                  製造過程で出るヒノキの削り節は、商品の緩衝材として再利用し、
                  プラスチック包装材を使わない<strong className="text-[var(--foreground)]">脱プラスチック</strong>の梱包を実現しています。
                  枡の一部が欠けてしまった製品も、別の商品として再生させる取り組みを行っています。
                </p>
                <p>
                  森の資源を余すことなく活かし、環境に負担をかけない持続可能なものづくり。
                  伝統工芸とSDGsが自然に結びつく、それが枡づくりの魅力です。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Final CTA ===== */}
        <section className="py-24 md:py-32 bg-[var(--color-subtle)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">
              枡をお探しですか？
            </h2>
            <p className="mt-4 text-sm text-[var(--color-muted)] max-w-lg mx-auto">
              スタンダード枡から名入れ・オーダーメイドまで。
              1個からの個人利用、100個以上の企業ノベルティまで対応しています。
            </p>
            <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
              <a href="#products" className="btn-primary inline-block">
                商品を見る
              </a>
              <Link href="/shop/masu/custom" className="btn-outline inline-block">
                オーダーメイド相談
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
