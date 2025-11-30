import { Exercise } from './types';

export const EXERCISE_DB: Exercise[] = [
  // --- 胸部 (Chest) ---
  { 
    id: 'bench_press', 
    name: '槓鈴臥推', 
    part: '胸部', 
    type: 'Compound', 
    tips: '肩胛骨後收下沈，手肘與身體呈 45-75 度，足底踩實地面。',
    iconColor: 'bg-blue-500'
  },
  { 
    id: 'db_bench_press', 
    name: '啞鈴臥推', 
    part: '胸部', 
    type: 'Compound', 
    tips: '增加活動範圍，感受胸大肌拉伸，頂峰時稍微內夾。',
    iconColor: 'bg-blue-400'
  },
  { 
    id: 'incline_bench', 
    name: '上斜槓鈴臥推', 
    part: '胸部', 
    type: 'Compound', 
    tips: '針對上胸，椅背約 30-45 度，落點在鎖骨下方。',
    iconColor: 'bg-blue-600'
  },
  { 
    id: 'db_incline', 
    name: '上斜啞鈴臥推', 
    part: '胸部', 
    type: 'Isolation', 
    tips: '椅背 30-45 度，專注上胸收縮，離心下放慢。',
    iconColor: 'bg-indigo-500'
  },
  { 
    id: 'decline_bench', 
    name: '下斜臥推', 
    part: '胸部', 
    type: 'Compound', 
    tips: '針對下胸，注意握距與落點，避免肩膀壓力過大。',
    iconColor: 'bg-blue-700'
  },
  {
    id: 'machine_chest_press',
    name: '機械式推胸',
    part: '胸部',
    type: 'Machine',
    tips: '背部貼緊椅背，握把高度約在胸線位置。',
    iconColor: 'bg-blue-300'
  },
  { 
    id: 'cable_fly', 
    name: '滑輪夾胸', 
    part: '胸部', 
    type: 'Isolation', 
    tips: '保持手肘微彎固定，專注胸肌收縮，想像要環抱一棵大樹。',
    iconColor: 'bg-cyan-500'
  },
  { 
    id: 'pec_deck', 
    name: '蝴蝶機夾胸', 
    part: '胸部', 
    type: 'Machine', 
    tips: '手肘高度與肩膀平行或略低，專注胸肌內側擠壓。',
    iconColor: 'bg-cyan-600'
  },
  { 
    id: 'dips_chest', 
    name: '雙槓體撐 (胸)', 
    part: '胸部', 
    type: 'Bodyweight', 
    tips: '身體前傾，手肘外開，感受下胸拉伸。',
    iconColor: 'bg-indigo-400'
  },

  // --- 背部 (Back) ---
  { 
    id: 'deadlift', 
    name: '傳統硬舉', 
    part: '背部', 
    type: 'Compound', 
    tips: '槓鈴貼近小腿，先屈髖再屈膝，拉起時臀部夾緊。',
    iconColor: 'bg-yellow-500'
  },
  { 
    id: 'pull_up', 
    name: '引體向上', 
    part: '背部', 
    type: 'Bodyweight', 
    tips: '核心收緊，啟動時先下壓肩胛骨，將胸口拉向單槓。',
    iconColor: 'bg-amber-500'
  },
  { 
    id: 'lat_pull', 
    name: '滑輪下拉', 
    part: '背部', 
    type: 'Cable', 
    tips: '挺胸，手肘下拉至腰際，肩胛骨主導動作。',
    iconColor: 'bg-purple-500'
  },
  { 
    id: 'db_row', 
    name: '單臂啞鈴划船', 
    part: '背部', 
    type: 'Isolation', 
    tips: '背部打直，將啞鈴拉向髖關節位置，感受背闊肌收縮。',
    iconColor: 'bg-purple-400'
  },
  { 
    id: 'seated_row', 
    name: '坐姿划船', 
    part: '背部', 
    type: 'Cable', 
    tips: '挺胸不聳肩，將把手拉向肚臍，感受背肌擠壓。',
    iconColor: 'bg-violet-500'
  },
  { 
    id: 't_bar_row', 
    name: 'T Bar 划船', 
    part: '背部', 
    type: 'Compound', 
    tips: '核心收緊，背部保持平直，避免下背借力代償。',
    iconColor: 'bg-yellow-600'
  },
  { 
    id: 'straight_arm_pulldown', 
    name: '直臂下壓', 
    part: '背部', 
    type: 'Cable', 
    tips: '手臂微彎固定，專注背闊肌將重量壓向大腿。',
    iconColor: 'bg-purple-600'
  },
  { 
    id: 'machine_row', 
    name: '機械划船', 
    part: '背部', 
    type: 'Machine', 
    tips: '胸口貼緊靠墊，專注肩胛骨後收。',
    iconColor: 'bg-violet-400'
  },

  // --- 腿部 (Legs) ---
  { 
    id: 'squat', 
    name: '槓鈴深蹲', 
    part: '腿部', 
    type: 'Compound', 
    tips: '核心繃緊，髖膝同時啟動，膝蓋對準腳尖方向。',
    iconColor: 'bg-red-500'
  },
  { 
    id: 'front_squat', 
    name: '前頸深蹲', 
    part: '腿部', 
    type: 'Compound', 
    tips: '手肘抬高，軀幹保持直立，更專注於股四頭肌。',
    iconColor: 'bg-red-600'
  },
  { 
    id: 'goblet_squat', 
    name: '高腳杯深蹲', 
    part: '腿部', 
    type: 'Compound', 
    tips: '雙手捧住啞鈴貼胸，下蹲時保持挺胸。',
    iconColor: 'bg-orange-700'
  },
  { 
    id: 'leg_press', 
    name: '腿推舉', 
    part: '腿部', 
    type: 'Machine', 
    tips: '背部緊貼椅背，不要鎖死膝蓋，專注大腿前側發力。',
    iconColor: 'bg-red-400'
  },
  { 
    id: 'rdl', 
    name: '羅馬尼亞硬舉', 
    part: '腿部', 
    type: 'Compound', 
    tips: '膝蓋微彎固定，屁股向後推，感受大腿後側拉伸。',
    iconColor: 'bg-yellow-700'
  },
  { 
    id: 'leg_extension', 
    name: '坐姿腿屈伸', 
    part: '腿部', 
    type: 'Isolation', 
    tips: '針對股四頭肌，動作頂端停留 1 秒感受收縮，控制下放。',
    iconColor: 'bg-red-600'
  },
  { 
    id: 'leg_curl', 
    name: '俯臥腿後勾', 
    part: '腿部', 
    type: 'Isolation', 
    tips: '臀部貼緊椅墊，勾起時不要用腰借力。',
    iconColor: 'bg-rose-500'
  },
  { 
    id: 'lunges', 
    name: '啞鈴弓箭步', 
    part: '腿部', 
    type: 'Compound', 
    tips: '軀幹保持正直，後腳膝蓋接近地面但不觸地。',
    iconColor: 'bg-rose-400'
  },
  { 
    id: 'bulgarian_split_squat', 
    name: '保加利亞分腿蹲', 
    part: '腿部', 
    type: 'Compound', 
    tips: '後腳置於板凳，身體微前傾，專注前腳發力。',
    iconColor: 'bg-red-700'
  },
  { 
    id: 'hip_thrust', 
    name: '槓鈴臀推', 
    part: '腿部', 
    type: 'Compound', 
    tips: '下巴收緊，利用臀部力量將槓鈴推起至身體呈一直線。',
    iconColor: 'bg-pink-700'
  },
  { 
    id: 'calf_raise', 
    name: '提踵 (小腿)', 
    part: '腿部', 
    type: 'Isolation', 
    tips: '腳跟盡可能下放拉伸，再用力踮起至最高點。',
    iconColor: 'bg-stone-500'
  },

  // --- 肩膀 (Shoulders) ---
  { 
    id: 'ohp', 
    name: '站姿肩推', 
    part: '肩膀', 
    type: 'Compound', 
    tips: '臀部夾緊，核心收緊，槓鈴路徑垂直向上，頭部適時閃避。',
    iconColor: 'bg-orange-500'
  },
  { 
    id: 'db_shoulder_press', 
    name: '坐姿啞鈴肩推', 
    part: '肩膀', 
    type: 'Compound', 
    tips: '核心穩定，不要過度拱腰，推至頭頂上方。',
    iconColor: 'bg-orange-300'
  },
  { 
    id: 'lateral_raise', 
    name: '啞鈴側平舉', 
    part: '肩膀', 
    type: 'Isolation', 
    tips: '針對中束，手肘微彎，像倒水一樣將啞鈴舉起，不要聳肩。',
    iconColor: 'bg-orange-400'
  },
  { 
    id: 'front_raise', 
    name: '啞鈴前平舉', 
    part: '肩膀', 
    type: 'Isolation', 
    tips: '針對前束，控制速度，不要用身體晃動借力。',
    iconColor: 'bg-orange-200'
  },
  { 
    id: 'face_pull', 
    name: '臉拉', 
    part: '肩膀', 
    type: 'Cable', 
    tips: '針對後束與旋轉肌袖，將繩索拉向額頭，大臂外旋。',
    iconColor: 'bg-orange-600'
  },
  { 
    id: 'reverse_fly', 
    name: '反向飛鳥', 
    part: '肩膀', 
    type: 'Isolation', 
    tips: '針對後束，手臂向兩側展開，感受肩胛骨後方收縮。',
    iconColor: 'bg-amber-600'
  },
  { 
    id: 'shrugs', 
    name: '啞鈴聳肩', 
    part: '肩膀', 
    type: 'Isolation', 
    tips: '針對斜方肌上束，直上直下，不要旋轉肩膀。',
    iconColor: 'bg-stone-600'
  },

  // --- 手臂 (Arms) ---
  {
    id: 'bicep_curl',
    name: '二頭彎舉',
    part: '手臂',
    type: 'Free Weight',
    tips: '大臂夾緊身體兩側，不要藉力甩動。',
    iconColor: 'bg-pink-500'
  },
  {
    id: 'hammer_curl',
    name: '錘式彎舉',
    part: '手臂',
    type: 'Free Weight',
    tips: '掌心相對，針對肱肌與二頭肌長頭。',
    iconColor: 'bg-pink-600'
  },
  {
    id: 'preacher_curl',
    name: '牧師椅彎舉',
    part: '手臂',
    type: 'Machine',
    tips: '大臂完全貼合靠墊，避免借力，孤立二頭肌。',
    iconColor: 'bg-pink-400'
  },
  {
    id: 'tricep_pushdown',
    name: '三頭下壓',
    part: '手臂',
    type: 'Cable',
    tips: '手肘固定在身體兩側，完全伸直手臂。',
    iconColor: 'bg-fuchsia-400'
  },
  {
    id: 'skull_crusher',
    name: '仰臥臂屈伸',
    part: '手臂',
    type: 'Free Weight',
    tips: '保持大臂穩定，彎曲手肘將重量下放至額頭附近。',
    iconColor: 'bg-fuchsia-500'
  },
  {
    id: 'overhead_extension',
    name: '過頭三頭屈伸',
    part: '手臂',
    type: 'Free Weight',
    tips: '手肘朝上，下放啞鈴至頸後，感受三頭肌長頭拉伸。',
    iconColor: 'bg-fuchsia-600'
  },
  {
    id: 'close_grip_bench',
    name: '窄距臥推',
    part: '手臂',
    type: 'Compound',
    tips: '握距與肩同寬，手肘貼近身體，主攻三頭肌。',
    iconColor: 'bg-fuchsia-700'
  },

  // --- 核心 (Core) ---
  {
    id: 'plank',
    name: '棒式',
    part: '核心',
    type: 'Stability',
    tips: '肘撐地，臀部收緊，身體呈一直線，不要塌腰。',
    iconColor: 'bg-emerald-500'
  },
  {
    id: 'crunch',
    name: '捲腹',
    part: '核心',
    type: 'Isolation',
    tips: '利用腹肌收縮將上背部捲離地面，下背貼地。',
    iconColor: 'bg-emerald-400'
  },
  {
    id: 'leg_raise',
    name: '懸垂舉腿',
    part: '核心',
    type: 'Bodyweight',
    tips: '骨盆後傾，利用下腹力量將腿抬起，避免晃動。',
    iconColor: 'bg-emerald-600'
  },
  {
    id: 'russian_twist',
    name: '俄羅斯轉體',
    part: '核心',
    type: 'Bodyweight',
    tips: '坐姿平衡，轉動軀幹而非只有手臂，感受側腹收縮。',
    iconColor: 'bg-emerald-700'
  },
  {
    id: 'ab_wheel',
    name: '健腹輪',
    part: '核心',
    type: 'Bodyweight',
    tips: '核心全程繃緊，下背不要凹陷，用腹肌力量拉回。',
    iconColor: 'bg-teal-700'
  }
];

export const INITIAL_WORKOUT_STATE: Exercise[] = [
  { 
    ...EXERCISE_DB[0], // Bench Press
    localId: 1,
    sets: [
      { id: 101, kg: 60, reps: 12, rpe: 7, completed: true },
      { id: 102, kg: 60, reps: 10, rpe: 8, completed: false },
      { id: 103, kg: 60, reps: 8, rpe: 9, completed: false },
    ]
  },
  { 
    ...EXERCISE_DB[18], // Squat
    localId: 2,
    sets: [
      { id: 201, kg: 100, reps: 5, rpe: 8, completed: false },
      { id: 202, kg: 100, reps: 5, rpe: 8, completed: false },
    ] 
  }
];