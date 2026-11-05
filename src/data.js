/* ================= ENGINE START ================= */
"use strict";
/* ---------- 基础数据 ---------- */
var REGIONS = [
  { id:"ea",  name:"东亚 · 中国小城", pack:"asia", lang:"zh",
    boys:["李明轩","王浩然","陈子墨"], girls:["李小雨","王思涵","陈安然"], surname:"李",
    place:"临江市", fatherJob:"中学教师", motherJob:"护士", motif:"江 城" },
  { id:"sea", name:"东南亚 · 海岛渔村", pack:"asia", lang:"zh",
    boys:["阿南","巴颂","阿迪"], girls:["妮拉","玛雅","素丽"], surname:"海",
    place:"蓝礁村", fatherJob:"渔民", motherJob:"海产摊主", motif:"渔 港" },
  { id:"sa",  name:"南亚 · 恒河平原城镇", pack:"asia", lang:"zh",
    boys:["阿尔琼","罗希特","维克拉姆"], girls:["普里娅","卡维塔","安妮塔"], surname:"辛格",
    place:"巴特那", fatherJob:"布商", motherJob:"小学教师", motif:"河 原" },
  { id:"eu",  name:"西欧 · 巴伐利亚小镇", pack:"eu", lang:"en",
    boys:["Lukas","Jonas","Felix"], girls:["Anna","Mia","Lena"], surname:"Lukas",
    place:"巴伐利亚小镇", fatherJob:"面包师", motherJob:"药剂师", motif:"小 镇" },
  { id:"na",  name:"北美 · 中西部小镇", pack:"eu", lang:"en",
    boys:["Jack","Ethan","Noah"], girls:["Emma","Ava","Sophia"], surname:"Jack",
    place:"枫树镇", fatherJob:"农场主", motherJob:"图书管理员", motif:"原 野" },
  { id:"lat", name:"拉丁美洲 · 安第斯山城", pack:"asia", lang:"es",
    boys:["马特奥","圣地亚哥","迭戈"], girls:["卢西亚","瓦伦蒂娜","卡米拉"], surname:"加西亚",
    place:"昆卡", fatherJob:"陶匠", motherJob:"裁缝", motif:"山 城" }
];
var WEALTHS = [
  { id:"rich",   name:"富裕", wealth:82, hp:6,  iq:4,  desc:"家境殷实，起跑线靠前" },
  { id:"well",   name:"小康", wealth:62, hp:3,  iq:2,  desc:"衣食无忧，偶有余钱" },
  { id:"normal", name:"普通", wealth:45, hp:0,  iq:0,  desc:"寻常人家，靠自己打拼" },
  { id:"poor",   name:"贫寒", wealth:24, hp:-4, iq:0,  desc:"家徒四壁，每一步都难" }
];
var ASPS = [
  { id:"sci",  name:"科研", iq:8,  desc:"对世界好奇，想弄明白一切" },
  { id:"trav", name:"旅行", hp:4,  charm:3, desc:"想走遍天下，看没看过的风景" },
  { id:"art",  name:"艺术", charm:7, desc:"心里有团火，想把它画出来、唱出来" },
  { id:"biz",  name:"创业", wealth:6, desc:"不甘心打工，想闯出自己的天地" },
  { id:"med",  name:"从医", iq:5, happy:2, desc:"想治病救人，做个好大夫" },
  { id:"calm", name:"安稳", happy:6, hp:2, desc:"不求大富大贵，只求一生平安顺遂" }
];
var STAGES = [
  { max:6,   name:"幼儿期", stepMin:1.2, stepMax:2.6 },
  { max:17,  name:"少年期", stepMin:1.6, stepMax:3.2 },
  { max:30,  name:"青年期", stepMin:1.6, stepMax:3.4 },
  { max:50,  name:"中年期", stepMin:2.0, stepMax:4.2 },
  { max:70,  name:"晚年期", stepMin:2.0, stepMax:4.2 },
  { max:999, name:"暮年期", stepMin:1.6, stepMax:3.4 }
];
function stageOf(age){ for (var i=0;i<STAGES.length;i++) if (age<=STAGES[i].max) return i; return 5; }
function rnd(a,b){ return a + Math.random()*(b-a); }
function ri(a,b){ return Math.floor(rnd(a,b+1)); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function clamp(v){ return Math.max(0, Math.min(100, Math.round(v))); }

/* ---------- 事件池（fx: hp健康 iq智力 ch魅力 we财富 ha幸福 fa声望 fam亲情 fri友情 lov爱情） ---------- */
var EVENTS = [
 /* 幼儿期 0-6 */
 { st:0, title:"学前班的名额", motif:"书 包", scene:"村里（镇上）新办的学前班只剩最后几个名额，报名费对家里不是个小数目。母亲抱着你，父亲蹲在门口抽烟，谁都没先开口。",
   ch:[ {t:"咬牙报上名", fx:{we:-6,iq:5,fam:2}, log:"家里咬牙供你上了学前班。"},
        {t:"在家跟着父母", fx:{fam:5,hp:2,iq:-2}, log:"你没上学前班，童年在田埂与灶台边度过。"} ] },
 { st:0, title:"一场高烧", motif:"夜 灯", scene:"半夜你烧得说胡话，雨下得正大。去镇医院要走一个多小时山路（街路），家里的手电筒只剩半格电。",
   ch:[ {t:"连夜送医", fx:{hp:4,we:-5,fam:3}, log:"父母连夜冒雨送你去医院，高烧退了。"},
        {t:"土办法硬扛", fx:{hp:-7,fam:1}, log:"你靠土办法扛过了高烧，身子骨落下点弱根。"} ] },
 { st:0, title:"父母的争吵", motif:"雨 声", scene:"这几年家里手头紧，父母为钱吵得越来越凶。你躲在门后，听见「过不下去」四个字。",
   ch:[ {t:"跑过去抱住他们", fx:{fam:4,ha:-2}, log:"你抱住争吵的父母，他们红着眼停了手。"},
        {t:"躲起来装睡", fx:{ha:-4,iq:2}, log:"你在争吵声里学会了察言观色。"} ] },
 /* 少年期 7-17 */
 { st:1, req:{school:true}, title:"校园里的拳头", motif:"操 场", scene:"高年级的几个孩子盯上了你，放学路上堵着要「借」零花钱，不给就推搡。你的书包带子已经被扯断过一次。",
   ch:[ {t:"告诉老师和父母", fx:{fam:3,fri:2,ha:1}, log:"你把霸凌告诉了大人，事情被压了下去。"},
        {t:"自己硬扛", fx:{hp:-4,ch:-2,ha:-3}, log:"你一个人扛过了被霸凌的日子，心里留了疤。"},
        {t:"攒钱请他们吃冰棍", fx:{we:-3,fri:5,ch:3}, log:"你用冰棍化敌为友，多了几个「兄弟」。"} ] },
 { st:1, req:{school:true}, title:"第一次心动", motif:"晚 霞", scene:"同桌换座位那天，阳光正落在新同桌的侧脸上。你发现自己开始在意上学路上「偶遇」的次数，心跳得不像话。",
   ch:[ {t:"写一封信塞进对方书包", fx:{lov:8,ha:4,ch:2}, log:"你写了人生第一封情书，心跳了一整个夏天。"},
        {t:"把心思压回书本", fx:{iq:5,lov:-2,ha:-1}, log:"你把第一次心动压成了习题册里的一页。"} ] },
 { st:1, req:{school:true}, title:"升学还是辍学", motif:"岔 路", scene:"初中快毕业了。家里说：读下去要花钱，出去打工能挣钱。你的成绩单摊在桌上，分数不算差。",
   ch:[ {t:"继续升学", set:{work:false}, fx:{iq:7,we:-5,fam:-2}, log:"你选择了继续读书，家里为此更紧巴了。"},
        {t:"辍学去打工", set:{school:false, work:true}, fx:{we:8,iq:-4,fam:4}, log:"你辍学进了厂，工资一分不少地交给家里。"} ] },
 { st:1, req:{school:true}, title:"恩师的一句话", motif:"粉 笔", scene:"一位老师在你的作文本上批了一行字：「你有想法，别浪费。」就是这一行字，你看了很多遍。",
   ch:[ {t:"把这句话记一辈子", fx:{iq:5,ha:4,fa:2}, log:"恩师的一句话，你记了一辈子。"},
        {t:"笑笑就翻页了", fx:{ha:1}, log:"老师的话，你听过也就忘了。"} ] },
 /* 青年期 18-30 */
 { st:2, req:{school:false}, title:"进城的第一份工", motif:"扳 手", scene:"没有文凭，能选的活不多：工厂流水线、工地、餐馆后厨。第一份工的工头打量你一眼：「年轻，能吃苦就行。」",
   ch:[ {t:"进厂上流水线", set:{work:true}, fx:{we:7,hp:-3,ha:-1}, log:"你进了工厂流水线，站着干满了第一个月。"},
        {t:"跟老乡上工地", set:{work:true}, fx:{we:9,hp:-5}, log:"你跟着老乡上了工地，钱多些，人也糙了。"},
        {t:"去餐馆学手艺", set:{work:true}, fx:{we:5,iq:3,ha:2}, log:"你在餐馆后厨学起了手艺，师傅说你有悟性。"} ] },
 { st:2, req:{school:false}, title:"离乡的车票", motif:"站 台", scene:"成年了。摆在面前的有两张「票」：一张去远方的大城市，机会多、活法新；一张留在家乡，安稳、熟悉、父母在身边。",
   ch:[ {t:"去远方闯荡", set:{away:true, work:true}, fx:{we:6,ch:4,fam:-5,ha:2}, log:"你买了去远方的票，从此故乡只有冬夏。"},
        {t:"留下来守着家", set:{work:true}, fx:{fam:6,ha:3,we:-2}, log:"你留在了家乡，守着父母过日子。"} ] },
 { st:2, req:{work:true}, title:"第一份工作被裁", motif:"纸 箱", scene:"经济不景气，公司贴出裁员名单，你的名字在上面。抱着纸箱走出写字楼时，天正下着小雨，和当年很像。",
   ch:[ {t:"连夜改简历再战", fx:{iq:3,ch:2,ha:-2}, log:"被裁后你连夜改简历，很快找到了下家。"},
        {t:"回老家歇一阵", fx:{hp:3,fam:4,we:-4,ha:1}, log:"你回老家歇了几个月，把气喘匀了再出发。"},
        {t:"干脆自己创业", fx:{we:-6,fa:3,ha:2}, log:"被裁成了你创业的导火索。", condAsp:"biz"} ] },
 { st:2, req:{married:false}, title:"恋爱与面包", motif:"烛 光", scene:"你遇到了想共度一生的人。可谈婚论嫁要房子、要彩礼（礼金）、要一个看得见的未来。爱情和面包，第一次摆在同一张桌子上。",
   ch:[ {t:"先成家，面包慢慢挣", set:{married:true}, fx:{lov:10,ha:6,we:-8}, log:"你们先成了家，苦日子是一起熬的。"},
        {t:"先立业，感情等一等", fx:{we:7,lov:-6,iq:2}, log:"你选择先立业，那段感情慢慢淡了。"} ] },
 { st:2, req:{work:true, married:false}, title:"工友的婚事", motif:"喜 糖", scene:"一起干活的工友给你介绍了对象：人实在，家里也是普通人家。见了一面，不讨厌，也说不上心动。处，还是不处？",
   ch:[ {t:"处处看，奔着结婚去", set:{married:true}, fx:{lov:8,ha:4,we:-4}, log:"你和工友介绍的对象成了家，日子平平淡淡往前过。"},
        {t:"还想再闯几年", fx:{we:4,lov:-4,ha:-1}, log:"你婉拒了介绍，想趁年轻再闯几年。"} ] },
 { st:2, req:{away:false}, title:"移民的机会", motif:"地 图", scene:"一个去异国工作生活的机会落在你头上：语言不通、文化全非，但起薪是现在的五倍。签，还是不签？",
   ch:[ {t:"签，去看看世界", set:{away:true, work:true}, fx:{we:10,ch:5,fam:-6,ha:3}, log:"你签下合同，把人生搬到了另一个国家。"},
        {t:"不签，根在这里", set:{work:true}, fx:{fam:5,ha:2,we:-3}, log:"你放弃了移民机会，留在了熟悉的土地上。"} ] },
 /* 中年期 31-50 */
 { st:3, req:{married:true}, title:"房贷与育儿", motif:"灯 火", scene:"孩子出生那晚，你在产房外走来走去——像极了当年你的父亲。房贷、奶粉、父母的药费，账本一页比一页厚。",
   ch:[ {t:"拼命加班挣钱", set:{kids:true, house:true}, fx:{we:9,hp:-6,fam:-3,ha:1}, log:"你拼命挣钱，家里的账本好看了，身体差了。"},
        {t:"钱少挣点，多陪家人", set:{kids:true}, fx:{fam:8,ha:5,we:-5,hp:2}, log:"你把时间留给了家人，钱挣得少些，心是满的。"} ] },
 { st:3, title:"父母病了", motif:"病 房", scene:"父亲（母亲）住院了，需要人陪护。你的工作正到节骨眼上，请假就可能丢位置。病床边和会议室，你只能选一个先去。",
   ch:[ {t:"请假陪护", fx:{fam:9,we:-5,fa:-2,ha:2}, log:"你在病床边守了半个月，没留遗憾。"},
        {t:"请护工，自己多挣钱寄回去", fx:{we:5,fam:-6,ha:-3}, log:"你请了护工寄了钱，心里一直欠着。"} ] },
 { st:3, req:{married:false}, title:"一个人的晚饭", motif:"泡 面", scene:"加完班回到出租屋，你给自己煮了碗面。同学群里在晒孩子、晒房本，你划了两下，放下手机——一个人的日子，是自由，也是清冷。",
   ch:[ {t:"把日子过成自己的节奏", fx:{ha:5,iq:3,fa:2}, log:"你没有结婚，把一个人的日子过出了自己的节奏。"},
        {t:"托人介绍，认真相一次亲", set:{married:true}, fx:{lov:7,ha:3,we:-3}, log:"你认真相了一次亲，遇到了愿意搭伙过日子的人。"} ] },
 { st:3, req:{work:true}, title:"中年危机", motif:"镜 子", scene:"某天照镜子，你发现眼角有了纹，头发稀了。同学群里有人功成名就，有人已经离世。你坐在车里，半天没发动。",
   ch:[ {t:"开始锻炼，先把身体找回来", fx:{hp:8,ha:3}, log:"你开始跑步健身，把中年危机跑成了转机。"},
        {t:"报个班学新东西", fx:{iq:6,ch:3,we:-3}, log:"你中年转行学新本事，居然学成了。"},
        {t:"算了，就这样吧", fx:{ha:-5,hp:-3}, log:"你叹了口气，日子照旧往前滑。"} ] },
 { st:3, title:"老友的求助", motif:"酒 杯", scene:"多年没联系的老友突然找你借钱，说是救命的急事。借，怕有去无回；不借，怕寒了几十年的情分。",
   ch:[ {t:"二话不说借了", fx:{fri:9,we:-6,ha:2}, log:"你借了老友一笔救命钱，情分更重了。"},
        {t:"婉拒了，各有难处", fx:{fri:-6,we:2,ha:-2}, log:"你婉拒了老友，之后再没联系过。"} ] },
 /* 晚年期 51-70 */
 { st:4, title:"退休那天", motif:"夕 阳", scene:"办完退休手续，你抱着自己的搪瓷缸走出单位大门。几十年的日子忽然空出一大块，接下来怎么过？",
   ch:[ {t:"含饴弄孙，享天伦", fx:{fam:7,ha:5,hp:1}, log:"退休后你围着孙辈转，忙碌又满足。"},
        {t:"重拾年轻时的爱好", fx:{ha:7,fa:3,ch:2}, log:"你捡起了年轻时放下的爱好，活出了第二春。"},
        {t:"返聘回去继续干", fx:{we:6,hp:-4,ha:-1}, log:"你返聘回了单位，还是闲不住。"} ] },
 { st:4, req:{kids:true}, title:"子女远行", motif:"航 班", scene:"孩子要去很远的地方发展了，机场送别时他（她）抱了抱你，说「会常回来看你们」。你知道这话和当年你说的一样，半真半假。",
   ch:[ {t:"笑着挥手，回家偷偷抹泪", fx:{fam:3,ha:-3}, log:"你送走了远行的孩子，家里安静下来。"},
        {t:"收拾行李跟过去住一阵", fx:{fam:6,we:-4,ha:3}, log:"你去孩子所在的城市住了一阵，又回了老家。"} ] },
 { st:4, title:"投资被骗", motif:"碎 纸", scene:"一个「高回报、保本」的项目找上门，经手人是你信得过的熟人。养老钱投进去三个月，群解散了，人也找不到了。",
   ch:[ {t:"报警追讨，能追回多少算多少", fx:{we:-8,ha:-4,fa:1}, log:"你报了警，养老钱只追回零星一点。"},
        {t:"认栽，就当买个教训", fx:{we:-10,ha:-2,iq:2}, log:"你认了栽，从此对「高回报」三个字免疫。"} ] },
 { st:4, req:{work:true}, title:"老工友的聚会", motif:"老 照 片", scene:"退休后的老工友张罗了一次聚会。几十年没见的人，头发都白了，聊起当年一起扛过的活、挨过的骂，笑着笑着就红了眼。",
   ch:[ {t:"年年都聚，越老越亲", fx:{fri:7,ha:6}, log:"你和老工友们年年一聚，越老越亲。"},
        {t:"聚了一次就散了", fx:{fri:2,ha:1}, log:"老工友聚了一次，又各自散回了各自的日子。"} ] },
 { st:4, req:{married:true}, title:"老伴先走一步", motif:"空 椅", scene:"相伴几十年的人，先你一步走了。家里那把椅子空着，电视还是两个人看的音量。你开始学着一个人生活。",
   ch:[ {t:"把日子重新过起来", fx:{ha:2,hp:-2,fam:3}, log:"你慢慢学着一个人生活，把日子重新过起来。"},
        {t:"沉在回忆里出不来", fx:{ha:-8,hp:-5}, log:"你沉在回忆里，身体也跟着垮了下去。"} ],
   cond:{minAge:55} },
 /* 暮年期 71+ */
 { st:5, req:{kids:true}, title:"立遗嘱", motif:"印 章", scene:"你把子女叫到跟前，拿出了写好的遗嘱：房子、存款、老物件，一样样交代清楚。屋里安静得能听见钟走。",
   ch:[ {t:"平均分，谁也不偏", fx:{fam:5,ha:3}, log:"你把遗产平均分好，身后事清清爽爽。"},
        {t:"多给最困难的那个孩子", fx:{fam:1,ha:2,fa:2}, log:"你把大头留给了过得最难的孩子。"} ] },
 { st:5, title:"回望故土", motif:"老 树", scene:"你想再回一次出生的地方看看。老屋还在不在，老树还在不在，当年送你出门的人，还剩几个？",
   ch:[ {t:"回去看看，住些日子", fx:{ha:6,fam:2,hp:-1}, log:"你回了一趟故土，在老树下坐了很久。"},
        {t:"不回了，留在记忆里最好", fx:{ha:1,iq:1}, log:"你没有回去——有些地方，留在记忆里最好。"} ] },
 { st:5, title:"写回忆录", motif:"手 稿", scene:"孙辈缠着你讲「以前的故事」。你忽然想把这一生写下来：出生那年的雨、离乡的票、深夜的病房、退休的夕阳。",
   ch:[ {t:"认真写，留给后人", fx:{fa:6,iq:2,ha:4}, log:"你写下了回忆录，成了一家人的传家宝。"},
        {t:"讲讲就好，不必成文", fx:{fam:4,ha:2}, log:"你把故事讲给了孙辈听，讲着讲着自己先笑了。"} ] },
 { st:5, title:"告别的方式", motif:"远 山", scene:"你心里清楚，时间不多了。你想把最后的日子过得有尊严些：见想见的人，说想说的话，去想去的地方。",
   ch:[ {t:"把老朋友都见一遍", fx:{fri:6,ha:5}, log:"你把一生的老朋友都见了一遍，逐一道别。"},
        {t:"安安静静，不折腾", fx:{ha:4,hp:1}, log:"你选择了安静地度过最后的时光。"} ] }
];
/* 随机际遇池（任意阶段，低权重穿插） */
var RANDOM_EVENTS = [
 { title:"一笔意外之财", motif:"彩 票", scene:"你随手买的彩票（或早年随手买的小物件）竟然升值了，一笔不大不小的意外之财落进口袋。",
   ch:[ {t:"存起来，以备不时之需", fx:{we:7,ha:2}, log:"一笔意外之财，你稳稳地存了下来。"},
        {t:"请亲朋好友好好吃一顿", fx:{fri:4,fam:3,we:-3,ha:5}, log:"你用意外之财请大家吃了顿饭，热闹了一场。"} ] },
 { title:"一场大病预警", motif:"体 检", scene:"体检报告上有几个指标亮了红灯，医生说：现在改习惯，还来得及。",
   ch:[ {t:"戒烟戒酒，认真调理", fx:{hp:7,ha:1,we:-2}, log:"一次体检预警，让你把坏习惯戒了。"},
        {t:"该吃吃该喝喝，听天由命", fx:{hp:-8,ha:2}, log:"你对体检预警满不在乎，身体记了账。"} ] },
 { title:"故人重逢", motif:"街 角", scene:"在异乡（异国）的街角，你撞见了少年时代最好的朋友。两个人都愣了三秒，然后像当年一样捶了对方一拳。",
   ch:[ {t:"长谈一整夜，约好常联系", fx:{fri:8,ha:6}, log:"异乡重逢故人，你们长谈了一整夜。"},
        {t:"留个联系方式，各自散了", fx:{fri:2,ha:1}, log:"故人重逢，留了联系方式，又各自散进人海。"} ] },
 { title:"时代的风口", motif:"风 口", scene:"一个新的行业（新技术、新政策）正在兴起，身边有人已经赚到了第一桶金。跟，还是不跟？",
   ch:[ {t:"跟上风口，搏一把", fx:{we:9,fa:3,ha:2}, log:"你踩中了时代的风口，日子翻了新篇。"},
        {t:"守住本行，不贪快钱", fx:{we:2,hp:1,ha:1}, log:"你没跟风口，守住了自己的本行和安稳。"} ] }
];
/* 志向专属小事件 */
var ASP_EVENTS = {
  sci:{ title:"实验室的深夜", motif:"星 图", scene:"课题卡了三个月，今晚数据忽然对上了。你站在实验室窗前，天边已经发白——这种时刻，一生没有几次。",
    ch:[ {t:"趁热打铁，写成论文", fx:{fa:8,iq:5,ha:5,hp:-2}, log:"实验室的深夜攻关，成了你的代表作。"},
         {t:"先回家睡一觉", fx:{hp:3,ha:2}, log:"你回家睡了个饱觉，成果第二天照样发表。"} ] },
  trav:{ title:"一个人的远方", motif:"地 平 线", scene:"攒了很久的假和钱，够去一次很远的地方。地图摊开，你的手指停在一个从没听过名字的小城上。",
    ch:[ {t:"就去那里，说走就走", fx:{ha:9,ch:4,we:-6}, log:"你去了一次说走就走的远方，回来像换了个人。"},
         {t:"还是选个稳妥的热门地", fx:{ha:4,we:-3}, log:"你去了热门景点，人挤人，但也算看过了。"} ] },
  biz:{ title:"第一笔大订单", motif:"合 同", scene:"熬了两年，公司终于等来第一笔大订单——签了，可能翻身；黄了，可能关门。对方的条件很苛刻。",
    ch:[ {t:"签！苛刻也接", fx:{we:12,fa:4,hp:-3}, log:"你咬牙接下大订单，公司活了过来。"},
         {t:"条件太苛，忍痛放弃", fx:{we:-2,ha:-2,iq:2}, log:"你放弃了苛刻的大订单，等来了更合适的。"} ] }
};

/* ---------- 联网生图：地区画面描述 + 事件提示词（英文，人物背影/剪影以避开面孔一致性问题） ---------- */
var REGION_IMG = {
  ea: "a small city in China", sea: "an island fishing village in Southeast Asia",
  sa: "a town on the Ganges plain in India", eu: "a small town in Bavaria, Germany",
  na: "a small town in the American Midwest", lat: "a mountain town in the Andes, Latin America"
};
var REGION_LOOK = {
  ea: "East Asian appearance, black hair", sea: "Southeast Asian appearance, tan skin, black hair",
  sa: "South Asian appearance, brown skin, black hair", eu: "European appearance, fair skin, light brown hair",
  na: "North American appearance", lat: "Latin American appearance, tan skin, dark hair"
};
var IMG_PROMPTS = {
  "学前班的名额": "a small kindergarten entrance, a mother holding a toddler looking at children playing inside, morning light",
  "一场高烧": "a father carrying a feverish child on his back, running through heavy rain at night toward a distant clinic light",
  "父母的争吵": "a small child peeking through a doorway at parents arguing in a dim kitchen, tense quiet atmosphere",
  "校园里的拳头": "a schoolyard at dusk, a lone student with a torn backpack facing a group of older students",
  "第一次心动": "two students at adjacent desks in a sunlit classroom, golden afternoon light through the windows, shy tender mood",
  "升学还是辍学": "a crossroads at dawn, one road leading to a school building, the other to a factory with chimneys",
  "恩师的一句话": "a kind teacher handing a graded notebook to a student in an empty classroom, warm light",
  "进城的第一份工": "a young migrant worker with a duffel bag standing before a large factory gate at dawn",
  "离乡的车票": "a young traveler with a suitcase on a misty train station platform, a train arriving",
  "第一份工作被裁": "an office worker carrying a cardboard box of belongings out of an office building in light rain",
  "恋爱与面包": "a young couple talking seriously at a small candlelit table in a modest apartment, city lights outside the window",
  "工友的婚事": "coworkers celebrating at a simple wedding banquet in a workers canteen with red decorations",
  "移民的机会": "a person looking at a large world map on the wall, a contract and a pen on the desk, thoughtful mood",
  "房贷与育儿": "a tired young father holding a newborn baby outside a hospital nursery window at night",
  "父母病了": "an adult sitting beside a hospital bed holding an elderly parent hand, soft evening light",
  "一个人的晚饭": "a person eating instant noodles alone in a small rented apartment at night, phone glowing on the table",
  "中年危机": "a middle-aged driver sitting alone in a parked car at dusk, city lights reflecting on the windshield",
  "老友的求助": "two old friends at a small tea table, one looking troubled, the other listening quietly",
  "退休那天": "a newly retired worker holding an enamel mug, walking out of a workplace gate into sunset light",
  "子女远行": "elderly parents waving goodbye to their adult child in an airport departure hall, morning light through glass",
  "投资被骗": "an elderly person holding crumpled investment papers in a dim room, a silent phone on the table",
  "老工友的聚会": "elderly retired workers laughing together at a reunion dinner, old photographs spread on the table",
  "老伴先走一步": "an elderly person sitting alone at home beside an empty chair, television glow, quiet grief",
  "立遗嘱": "an elderly person signing a will at a desk while adult children stand around, solemn quiet room",
  "回望故土": "an elderly person returning to an old childhood house under a big old tree, nostalgic afternoon light",
  "写回忆录": "an elderly person writing a memoir by hand at a wooden desk under lamplight, grandchildren listening nearby",
  "告别的方式": "an old person standing on a hill at sunrise looking at distant mountains, peaceful dignified farewell",
  "一笔意外之财": "a surprised happy person holding a winning lottery ticket at a small shop counter",
  "一场大病预警": "a person reading a medical report with red warning marks in a clinic waiting room, worried mood",
  "故人重逢": "two old friends meeting by chance on a street corner far from home, surprised and joyful",
  "时代的风口": "people looking toward a rising new industrial skyline at dawn, wind blowing, hopeful energy",
  "实验室的深夜": "a scientist alone in a laboratory late at night, glowing data screens, dawn breaking outside the window",
  "一个人的远方": "a lone traveler with a map standing before a vast horizon at golden hour, mountains far away",
  "第一笔大订单": "a young entrepreneur signing a big contract in a small office, tense and hopeful"
};

/* ---------- 等待轮播内容：人生格言（各文化谚语与名言，多为公共领域）+ 出生地风土卡 ---------- */
var QUOTES = [
  "人生天地之间，若白驹之过隙，忽然而已。——《庄子》",
  "路漫漫其修远兮，吾将上下而求索。——屈原《离骚》",
  "未经审视的人生不值得过。——苏格拉底",
  "生活只能倒着被理解，却必须正着去活。——克尔凯郭尔",
  "人是为活着本身而活着，而不是为了活着之外的任何事物。——余华《活着》",
  "把每一个黎明看作生命的开始，把每一个黄昏看作生命的小结。——罗斯金",
  "人生就像骑自行车，想保持平衡就得往前走。——爱因斯坦",
  "岁月极美，在于它必然的流逝。——三毛",
  "世界以痛吻我，我却报之以歌。——泰戈尔",
  "人虽老，腿脚尚健，但愿云游天下。——安徒生",
  "所有大人最初都是孩子，可惜很少有人记得这一点。——《小王子》",
  "生命的意义在于成为你自己。——荣格",
  "每一个不曾起舞的日子，都是对生命的辜负。——尼采",
  "愿你出走半生，归来仍是少年。——孙衍《愿你出走半生，归来仍是少年》",
  "生活是种律动，须有光有影，有左有右，有晴有雨。——老舍",
  "人生的道路虽然漫长，但紧要处常常只有几步。——柳青",
  "万物皆有裂痕，那是光照进来的地方。——莱昂纳德·科恩",
  "种一棵树最好的时间是十年前，其次是现在。——非洲谚语",
  "不要温和地走进那个良夜。——狄兰·托马斯",
  "我们记忆中的昨天，比真实的昨天更长。——佚名",
  "人生没有彩排，每一天都是现场直播。——佚名",
  "所爱隔山海，山海皆可平。——佚名",
  "人活着，总得有个可以回头的家。——佚名",
  "平平淡淡才是真。——中国俗语"
];
var LOCALE_CARDS = {
  ea: [
    "风土 · 临江一带过年讲究「年夜饭有鱼」，寓意年年有余，初一凌晨的饺子比炮仗先响。",
    "风土 · 小城的早点摊是社交中心：一碗热干面（或豆浆油条）下肚，一天的消息就交换完了。",
    "风土 · 本地婚俗里有「哭嫁」，新娘出门前要哭着唱，哭得越响，日子被认为越有福气。",
    "风土 · 清明上坟、冬至祭祖，一年两次，散在天涯的人都要往老屋赶。",
    "风土 · 江边长大的人都懂：梅雨季的潮气能把墙沁出水，晒被子要抢每一个晴天。",
    "风土 · 考大学在小城是全家的大事，金榜题名时，鞭炮能从巷头响到巷尾。"
  ],
  sea: [
    "风土 · 海岛渔村出海前要祭妈祖，香点三炷，船头洒酒，回来先报平安。",
    "风土 · 季风一到，渔船歇港，村里就靠修网、晒鱼干过日子，节奏跟着海走。",
    "风土 · 渔村的婚事爱在退潮后的沙滩上摆席，海鲜现捞现煮，潮涨前散席。",
    "风土 · 村里孩子多半会泅水先于会骑车，第一课是认潮汐表。",
    "风土 · 台风天全村挤到祠堂（或教堂）避风，一锅粥分给几十口人。",
    "风土 · 出海的人腰间系红绳，岸上的人在灯塔下等，灯不灭，人不散。"
  ],
  sa: [
    "风土 · 恒河平原的清晨属于恒河：沐浴、献花、放河灯，一天的开始先给河神。",
    "风土 · 排灯节（Diwali）家家点油灯，黑暗再长，也要亲手点亮一盏。",
    "风土 · 本地集市按星期轮转，今天这个村卖布，明天那个村卖香料，商贩走村串巷。",
    "风土 · 婚礼一场能办三天，鼓乐从村头排到村尾，新人脚不沾地地收祝福。",
    "风土 · 雨季（季风）迟到一周，全村的脸色就跟着阴一周——田等水，人等雨。",
    "风土 · 给客人倒茶要满到杯沿，是热情；留一点空，反倒显得生分。"
  ],
  eu: [
    "风土 · 巴伐利亚小镇的周日安静得出奇，商店全关门，人们去教堂、去啤酒园、去森林散步。",
    "风土 · 面包是主食也是手艺：每家面包房都有自己的酸面种，传了几代人。",
    "风土 · 十月节（啤酒节）不只是喝酒，是全镇人穿上传统服装的一年一度的大团圆。",
    "风土 · 圣诞市集从十一月末摆到平安夜，热红酒的香气飘满老城石板路。",
    "风土 · 本地人办事讲究预约与准时，迟到五分钟，要提前打电话说明。",
    "风土 · 森林浴（Waldbaden）是正经的疗养方式：钻进林子走一下午，什么都不想。"
  ],
  na: [
    "风土 · 中西部小镇的秋天属于橄榄球：周五夜赛，全镇的灯都为高中球队亮着。",
    "风土 · 感恩节回家的路最堵，也最暖——再远的人，这一天都要往餐桌赶。",
    "风土 · 玉米地一望无际，夏天的雷暴从地平线滚过来，像一面移动的墙。",
    "风土 · 小镇人打招呼不问去哪，问「需要搭把手吗」，帮忙不用等开口第二遍。",
    "风土 · 县集市（County Fair）是暑假的高潮：比最大的南瓜，坐最晃的摩天轮。",
    "风土 · 冬天暴风雪封路，邻居会先敲你家门，确认炉子还烧着、管道没冻裂。"
  ],
  lat: [
    "风土 · 安第斯山城的市集日，印第安摊主把土豆按颜色码成小山——这里光土豆就有上百个品种。",
    "风土 · 亡灵节（Día de los Muertos）要给逝去的亲人摆祭坛，在墓园里野餐、弹琴、讲他们生前的笑话。",
    "风土 · 高原的下午四点准时下雨，人们管它叫「上帝的钟表」，约会都按雨点排时间。",
    "风土 · 山城的房子爱刷成明黄、天蓝、粉红，说是让回家的路在雾里也认得清。",
    "风土 · 这里的问候先问家人：你母亲好吗？你父亲的腿好吗？人排在事前面。",
    "风土 · 丰收后要「还愿」给大地母亲（Pachamama），把第一杯酒洒在土里，谢土地养人。"
  ]
};
/* ================= ENGINE END ================= */
