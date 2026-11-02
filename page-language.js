(() => {
  const KEY = "trip-page-language";
  let current = "zh";
  try { current = localStorage.getItem(KEY) === "en" ? "en" : "zh"; } catch (error) { current = "zh"; }

  const PHRASES = {
    "贵阳 + 成都 + 九寨沟模板化旅行路线示意图，共5天": "Schematic route for Guiyang, Chengdu, and Jiuzhai, 5 days",
    "本图仅表达地点的相对方位与路线顺序，不代表真实比例或精确地理边界。": "This map shows relative direction and route order only. It is not to scale and is not an exact boundary.",
    "路线为行程示意，实际驾驶和步行请使用当天的 Google Maps 导航。": "The route is a sketch. Use that day’s Google Maps for driving and walking.",
    "地图需要能够访问 Google 的网络。若一直空白，请在系统浏览器中打开。": "The map needs a network that can reach Google. If it stays blank, open it in the system browser.",
    "请确认 trip-data.json 已通过生成校验，并与网页位于同一目录。": "Check that trip-data.json passed validation and sits in the same folder as this page.",
    "上海飞贵阳，经黄果树、万峰林，由兴义乘火车到成都，再经镇江关到九寨沟，从成都天府机场返回上海。": "Fly Shanghai to Guiyang, then Huangguoshu and Wanfenglin, train from Xingyi to Chengdu, on through Zhenjiangguan to Jiuzhai, and fly back to Shanghai from Chengdu Tianfu.",
    "住宿表未写酒店名。预算表写 Wanfenglin Resident。酒店名称待确认。": "The stay sheet has no hotel name. The budget sheet says Wanfenglin Resident. Hotel name to be confirmed.",
    "晚数与酒店名称待确认。住宿表写 total: 3 nites，但只列了 2024-08-07 与 2024-08-08；预算表为 2 晚，名称 Jiuzhai Tiantang Resort。": "Nights and hotel name to be confirmed. The stay sheet says 3 nites but only lists 2024-08-07 and 2024-08-08; the budget sheet says 2 nights at Jiuzhai Tiantang Resort.",
    "金额待确认。页面上的 0 不是报价。预算表只有分段人均估价。": "Amount to be confirmed. The 0 on this page is not a quote. The budget sheet only has per-person estimates by segment.",
    "租车公司、车型、取还车地点、时间和费用都待确认。资料里是多段 Rented Bus，不是一份完整租车合同。": "Rental company, vehicle, pickup and drop-off places, times, and cost are all to be confirmed. The source lists several rented-bus segments, not one complete rental contract.",
    "费用待确认。预算表有分段人均估价，未当作实付。": "Cost to be confirmed. The budget sheet has per-person estimates by segment, not treated as money actually paid.",
    "行程中的包车是分段记录：贵阳到黄果树、黄果树到万峰林、万峰林到兴义车站、镇江关到酒店、酒店到九寨沟游客中心及返回、九寨沟酒店到车站。公司与订单待确认。": "The chartered buses are recorded in segments: Guiyang to Huangguoshu, Huangguoshu to Wanfenglin, Wanfenglin to Xingyi station, Zhenjiangguan to the hotel, hotel to Jiuzhai visitor center and back, and Jiuzhai hotel to the station. Company and booking to be confirmed.",
    "首段包车：龙洞堡机场前往黄果树": "First chartered bus: Longdongbao Airport to Huangguoshu",
    "建议 ${time} 抵达机场区域，预留还车及值机时间。": "Arrive at the airport area by the suggested time, leaving time to return the vehicle and check in.",
    "预约还车时间已过 · 如尚未还车，请立即联系租车公司": "The reserved return time has passed. If the vehicle is not back, contact the rental company now.",
    "白天活动待确认。原表只有酒店早、中、晚餐。": "Daytime plans to be confirmed. The source sheet only lists hotel breakfast, lunch, and dinner.",
    "火车车次与时刻待确认。兴义按原表 Yixing 理解。": "Train number and times to be confirmed. Xingyi follows the source sheet’s Yixing.",
    "火车车次与时刻待确认。九寨沟酒店名称待确认。": "Train number and times to be confirmed. Jiuzhai hotel name to be confirmed.",
    "进出沟时刻待确认。门票待确认。": "Entry and exit times to be confirmed. Tickets to be confirmed.",
    "离开九寨沟的车站、车次和时刻待确认。": "The station, train number, and time for leaving Jiuzhai are to be confirmed.",
    "8 月 4 日万峰林白天孩子们做作业。8 月 5 日万峰林白天活动待确认。": "On Aug 4 the children do homework at Wanfenglin. Daytime plans at Wanfenglin on Aug 5 are to be confirmed.",
    "兴义到成都、成都到镇江关、九寨沟到成都的车次和时刻待确认。": "Train numbers and times for Xingyi–Chengdu, Chengdu–Zhenjiangguan, and Jiuzhai–Chengdu are to be confirmed.",
    "万峰林与九寨沟酒店名称待确认。九寨沟晚数在住宿表和预算表之间不一致，待确认。": "Wanfenglin and Jiuzhai hotel names to be confirmed. Jiuzhai night counts disagree between the stay sheet and the budget sheet.",
    "包车公司、车型、取还车地点和费用待确认。": "Charter company, vehicle, pickup and drop-off places, and cost to be confirmed.",
    "黄果树、九寨沟门票待确认。": "Huangguoshu and Jiuzhai tickets to be confirmed.",
    "记账待确认。预算表有总预算，实际栏主要只有机票 7900 元，没有逐笔付款和分账。": "The ledger is to be confirmed. The budget sheet has a total, and the actual column is mainly airfare of 7,900 yuan, without itemized payments or splits.",
    "装备清单待确认，未整表导入。": "The packing list is to be confirmed and was not imported as a whole.",
    "行李与装备清单待确认。原表混有其他行程物品，未整表导入。": "Packing and gear to be confirmed. The source sheet mixes in items from other trips and was not imported as a whole.",
    "装备表与其他行程物品混在一起，待确认后再导入。": "The gear sheet is mixed with items from other trips. Import it after it is confirmed.",
    "门票状态默认只保存在当前浏览器。": "Ticket status is stored only in this browser.",
    "票种、订单和 PDF 待确认": "Ticket type, booking, and PDF to be confirmed",
    "上海航空 FM9463，虹桥 T2 → 贵阳龙洞堡 T2，09:30 抵达": "Shanghai Airlines FM9463, Hongqiao T2 → Guiyang Longdongbao T2, arrive 09:30",
    "南方航空 CZ8198，天府 T2 → 浦东 T2，22:30 抵达": "China Southern CZ8198, Tianfu T2 → Pudong T2, arrive 22:30",
    "包车前往黄果树，约 2 小时。司机 18621525837，车牌 沪 AAR8023": "Chartered bus to Huangguoshu, about 2 hours. Driver 18621525837, plate 沪 AAR8023",
    "包车前往黄果树，约 2 小时": "Chartered bus to Huangguoshu, about 2 hours",
    "包车前往万峰林，约 2 小时 45 分，19:15 到达": "Chartered bus to Wanfenglin, about 2 hours 45 min, arrive 19:15",
    "入住万峰林酒店。酒店名称待确认。": "Check in at the Wanfenglin hotel. Hotel name to be confirmed.",
    "万峰林白天活动待确认": "Wanfenglin daytime plans to be confirmed",
    "孩子们做作业": "The children do homework",
    "包车前往兴义车站，约 1 小时。出发时刻待确认。": "Chartered bus to Xingyi station, about 1 hour. Departure time to be confirmed.",
    "火车前往成都。车次与时刻待确认。": "Train to Chengdu. Number and times to be confirmed.",
    "入住维也纳酒店。入住时刻待确认。": "Check in at Vienna Hotel. Check-in time to be confirmed.",
    "火车前往九寨沟镇江关。车次与时刻待确认。": "Train to Jiuzhai Zhenjiangguan. Number and times to be confirmed.",
    "包车前往酒店，约 3 小时 13 分。出发时刻待确认。": "Chartered bus to the hotel, about 3 hours 13 min. Departure time to be confirmed.",
    "入住九寨沟酒店。酒店名称、晚数与时刻待确认。": "Check in at the Jiuzhai hotel. Name, nights, and time to be confirmed.",
    "包车前往游客中心。时刻待确认。": "Chartered bus to the visitor center. Time to be confirmed.",
    "九寨沟游览。具体路线与时刻待确认。": "Visit Jiuzhai. The exact route and times are to be confirmed.",
    "包车返回酒店。时刻待确认。": "Chartered bus back to the hotel. Time to be confirmed.",
    "包车前往车站，约 3 小时 13 分。车站与时刻待确认。": "Chartered bus to the station, about 3 hours 13 min. Station and time to be confirmed.",
    "火车返回成都。车次、时刻与到达车站待确认。": "Train back to Chengdu. Number, times, and arrival station to be confirmed.",
    "出租车前往天府机场。时刻待确认。": "Taxi to Tianfu Airport. Time to be confirmed.",
    "还车地点与时间待确认": "Drop-off place and time to be confirmed",
    "取车地点待确认": "Pickup place to be confirmed",
    "还车地点待确认": "Drop-off place to be confirmed",
    "租车公司待确认": "Rental company to be confirmed",
    "车型待确认": "Vehicle to be confirmed",
    "出发车站待确认": "Departure station to be confirmed",
    "具体车站待确认": "The exact station is to be confirmed",
    "保障内容待确认": "Coverage to be confirmed",
    "贵阳龙洞堡国际机场": "Guiyang Longdongbao International Airport",
    "成都天府国际机场": "Chengdu Tianfu International Airport",
    "贵阳龙洞堡机场": "Guiyang Longdongbao Airport",
    "成都天府机场": "Chengdu Tianfu Airport",
    "九寨沟游客中心": "Jiuzhai Valley Visitor Center",
    "成都 · 维也纳酒店": "Chengdu · Vienna Hotel",
    "九寨沟镇江关": "Jiuzhai Zhenjiangguan",
    "九寨沟住宿": "Jiuzhai lodging",
    "九寨沟酒店": "Jiuzhai hotel",
    "黄果树瀑布": "Huangguoshu Waterfall",
    "黄果树门票": "Huangguoshu ticket",
    "九寨沟门票": "Jiuzhai ticket",
    "兴义车站": "Xingyi station",
    "龙洞堡机场": "Longdongbao Airport",
    "天府机场": "Tianfu Airport",
    "浦东机场": "Pudong Airport",
    "虹桥机场": "Hongqiao Airport",
    "维也纳酒店": "Vienna Hotel",
    "龙洞堡 T2": "Longdongbao T2",
    "虹桥 T2": "Hongqiao T2",
    "天府 T2": "Tianfu T2",
    "浦东 T2": "Pudong T2",
    "万峰林酒店": "Wanfenglin hotel",
    "游客中心": "visitor center",
    "上海 → 贵阳 · 黄果树 · 万峰林": "Shanghai → Guiyang · Huangguoshu · Wanfenglin",
    "九寨沟 → 成都 → 上海": "Jiuzhai → Chengdu → Shanghai",
    "万峰林 → 成都": "Wanfenglin → Chengdu",
    "成都 → 九寨沟": "Chengdu → Jiuzhai",
    "上海 → 贵阳": "Shanghai → Guiyang",
    "成都 → 上海": "Chengdu → Shanghai",
    "贵阳 + 成都 + 九寨沟": "Guiyang + Chengdu + Jiuzhai",
    "贵阳、成都、九寨沟行程示意图": "Sketch of the Guiyang, Chengdu, and Jiuzhai trip",
    "贵阳 + 成都 + 九寨沟 · 旅行路线": "Guiyang + Chengdu + Jiuzhai · route",
    "GUIYANG CHENGDU JIUZHAI / 贵阳 · 成都 · 九寨沟": "GUIYANG · CHENGDU · JIUZHAI",
    "贵阳 · 成都 · 九寨沟": "Guiyang · Chengdu · Jiuzhai",
    "北京时间 UTC+8": "China Standard Time, UTC+8",
    "航班卡片，可左右滑动": "Flight cards, swipe sideways",
    "登机口、座位和舱位未写在行程里。": "Gate, seat, and cabin were not in the itinerary.",
    "已按第二轮确认继续生成标准预览；系统没有猜测或伪造缺失的航班事实。": "This preview follows the confirmed facts. Missing flight details were not guessed.",
    "航班信息待补充": "Flight details still needed",
    "资料待补充": "Details still needed",
    "待补充信息": "Missing detail",
    "当地时区": "Local time zone",
    "出发机场": "Departure airport",
    "抵达机场": "Arrival airport",
    "起飞时间": "Departure time",
    "抵达时间": "Arrival time",
    "起飞信息": "Departure details",
    "抵达信息": "Arrival details",
    "航空公司": "Airline",
    "航班号": "Flight number",
    "距离下一程起飞还剩": "Time to the next departure",
    "距离起飞还剩": "Time to departure",
    "飞行中 · 距抵达": "In the air · time to arrival",
    "即将出发": "Leaving soon",
    "已超过预约还车时间": "Past the reserved return time",
    "距还车截止": "Time to return the vehicle",
    "抵达机场区域，预留还车及值机时间。": "at the airport area, leaving time to return the vehicle and check in.",
    "建议 ": "Suggested ",
    "请立即联系": "Contact now",
    "重要 · 还车截止时间": "Important · return deadline",
    "里程条款见订单": "Mileage terms are on the booking",
    "无限里程": "Unlimited mileage",
    "柜台支付": "Pay at the counter",
    "自驾注意事项": "Driving notes",
    "取还车检查": "Pickup and return checks",
    "订单保障": "Booking coverage",
    "驾驶提醒": "Driving notes",
    "已抵达": "Arrived",
    "已完成": "Completed",
    "距取车": "Time to pickup",
    "距还车": "Time to return",
    "直飞": "Nonstop",
    "登机牌": "Boarding pass",
    "登机口": "Gate",
    "舱位": "Cabin",
    "座位": "Seat",
    "旅客": "Passenger",
    "中转": "Connection",
    "出发": "Depart",
    "抵达": "Arrive",
    "起飞": "Depart",
    "包车巴士": "Chartered bus",
    "包车": "Chartered bus",
    "出租车": "Taxi",
    "火车": "Train",
    "步行": "Walk",
    "酒店早餐，至": "Hotel breakfast until",
    "酒店午餐，至": "Hotel lunch until",
    "酒店晚餐，至": "Hotel dinner until",
    "酒店用餐，至": "Hotel meal until",
    "酒店早餐": "Hotel breakfast",
    "酒店午餐": "Hotel lunch",
    "酒店晚餐": "Hotel dinner",
    "酒店用餐": "Hotel meal",
    "黄果树，至": "Huangguoshu until",
    "步行前往酒店": "Walk to the hotel",
    "黄果树": "Huangguoshu",
    "万峰林": "Wanfenglin",
    "九寨沟": "Jiuzhai",
    "镇江关": "Zhenjiangguan",
    "兴义站": "Xingyi Station",
    "大瀑布 · 布依蜡染": "Great waterfall · Buyei batik",
    "峰林田园 · 布依人家": "Peak forest · Buyei villages",
    "彩池叠瀑 · 藏羌风情": "Colored pools · Tibetan-Qiang",
    "火锅 · 川剧变脸": "Hotpot · face-changing opera",
    "藏寨 · 岷江峡谷": "Tibetan village · Min River gorge",
    "羊肉粉": "Mutton rice noodles",
    "兴义": "Xingyi",
    "龙洞堡": "Longdongbao",
    "虹桥": "Hongqiao",
    "天府": "Tianfu",
    "浦东": "Pudong",
    "安顺": "Anshun",
    "贵阳": "Guiyang",
    "成都": "Chengdu",
    "上海": "Shanghai",
    "上海航空": "Shanghai Airlines",
    "南方航空": "China Southern",
    "车站": "station",
    "经 ": "via ",
    "前": "before",
    "待确认": "to be confirmed",
    "今天": "Today",
    "次日": "Next day",
    "正在载入旅程": "Loading the trip",
    "旅行计划待生成": "Trip plan not ready",
    "等待旅行资料": "Waiting for trip details",
    "目的地待补充": "Destination to be added",
    "跳到主要内容": "Skip to content",
    "返回顶部": "Back to top",
    "回到顶部 ↑": "Back to top ↑",
    "主要模块": "Main sections",
    "旅行信息栏目": "Trip sections",
    "旅行信息": "Trip",
    "航班行程": "Flights",
    "本次旅程": "This trip",
    "每日行程": "Day by day",
    "自驾信息": "Driving",
    "旅行前准备": "Before you go",
    "添加一项准备事项": "Add a prep item",
    "准备事项": "Prep item",
    "门票与预订": "Tickets and bookings",
    "门票详情": "Ticket details",
    "关闭门票详情": "Close ticket details",
    "关闭路线图": "Close the route map",
    "关闭地点地图": "Close the place map",
    "地点地图": "Place map",
    "用 Google Maps 打开 ↗": "Open in Google Maps ↗",
    "行程暂时无法载入": "The itinerary could not be loaded",
    "AI 旅行网页模板": "Trip page",
    "需提前购票": "Buy ahead",
    "建议预约": "Booking recommended",
    "购票方式待确认": "How to buy tickets is to be confirmed",
    "门票信息": "Ticket info",
    "已购票": "Ticket bought",
    "门票已准备": "Tickets ready",
    "暂无准备事项": "Nothing on the list yet",
    "只读": "Read-only",
    "可编辑": "Editable",
    "航班": "Flights",
    "路线": "Route",
    "行程": "Days",
    "自驾": "Drive",
    "记账": "Ledger",
    "添加": "Add",
    "关闭": "Close",
    "日期": "Date",
    "航班": "Flight",
    "旅行记账": "Trip ledger",
    "记账设置": "Ledger settings",
    "记账页面": "Ledger pages",
    "账单结算": "Settle",
    "当前是只读，不能修改。": "This page is read-only and cannot be changed.",
    "保存失败，请检查网络或你的云端数据库配置后重试。": "Could not save. Check the network or the cloud database setup, then try again.",
    "本地保存失败，请检查浏览器存储空间或隐私设置后重试。": "Could not save on this device. Check browser storage or privacy settings, then try again.",
    "备注保存失败，请检查网络或你的云端数据库配置后重试。": "Could not save the note. Check the network or the cloud database setup, then try again.",
    "备注本地保存失败，请检查浏览器存储空间或隐私设置后重试。": "Could not save the note on this device. Check browser storage or privacy settings, then try again.",
    "请先保存或取消正在编辑的账单。": "Save or cancel the bill you are editing first.",
    "账单已更新": "Bill updated",
    "账单已保存": "Bill saved",
    "把一起结账的人编成一个家庭。例如 4 个人组成一个家庭后，家庭内部的账会先抵消，最后只按家庭结算。": "Group people who settle together into a family. After four people form one family, amounts inside the family cancel out, and the final settlement is between families.",
    "还没有家庭。一个家庭可以包含多人，结算时作为一个整体。": "No families yet. A family can include several people and settles as one party.",
    "请先添加同行人。": "Add travel companions first.",
    "选中已属于其他家庭的人，保存后会改到这个家庭。最终转账按家庭计算，不再在家庭内部互相转。": "If you pick someone who is already in another family, saving moves them here. Transfers are calculated between families, not inside a family.",
    "同一家庭内部的差额会先互相抵消。最后只在家庭之间转账；没加入家庭的人仍按个人结算。": "Balances inside a family cancel out first. The final transfers are between families. Anyone not in a family still settles individually.",
    "先添加本次同行人，再开始记账。": "Add the people on this trip, then start the ledger.",
    "记下第一笔花费后，账单会显示在这里。": "Bills show up here after the first expense.",
    "添加同行人后，这里会显示每个人的收支。": "Each person’s balance shows up here after companions are added.",
    "暂无相关账单": "No related bills",
    "还没有同行人。": "No companions yet.",
    "支持中文名、英文名、代码、符号和国家或地区": "Search by Chinese name, English name, code, symbol, or place",
    "按付款当时采用的汇率手动填写": "Enter the rate used when you paid",
    "各家庭的差额": "Family balances",
    "家庭之间怎么结算": "How families settle",
    "谁需要转给谁": "Who pays whom",
    "家庭汇总": "Family summary",
    "成员消费明细": "Spending by person",
    "每个人的收支": "Each person’s balance",
    "实际支付": "Paid",
    "个人应分摊": "Share",
    "结算结果": "Balance",
    "账单明细": "Bills",
    "总支出": "Total spent",
    "管理本次成员": "People on this trip",
    "添加家庭": "Add a family",
    "编辑家庭": "Edit family",
    "保存家庭": "Save family",
    "取消编辑": "Cancel editing",
    "家庭名称": "Family name",
    "家庭成员": "Family members",
    "至少 2 人": "At least 2 people",
    "按家庭结算": "Settle by family",
    "记录本次花费": "Record this expense",
    "记一笔": "Add a bill",
    "当前是只读": "Now read-only",
    "当前是可编辑": "Now editable",
    "输入密码后进入只读": "Enter the password to open read-only",
    "输入密码后进入可编辑": "Enter the password to open editable",
    "修改这笔账": "Edit this bill",
    "本次同行人": "People on this trip",
    "按人数平分": "Split evenly",
    "头像文字会从姓名自动提取；颜色可以随时修改。": "The initial comes from the name. You can change the color anytime.",
    "统计与最终结算都使用这个币种": "Totals and the final settlement use this currency.",
    "已有账单后，本位币会锁定，避免历史换算金额失真。": "After bills exist, the base currency locks so earlier conversions stay intact.",
    "只在记账时显示你选中的币种": "Only the currencies you pick show up when adding a bill.",
    "尚未添加常用外币。": "No extra currencies yet.",
    "已有账单，本位币不能再修改。": "Bills already exist, so the base currency cannot be changed.",
    "选择本位币": "Choose the base currency",
    "添加常用外币": "Add a currency",
    "记账本位币": "Base currency",
    "常用外币": "Currencies you use",
    "可以尝试中文名、英文名、代码、符号或国家与地区。": "Try a Chinese name, English name, code, symbol, or place.",
    "没有找到相关货币": "No matching currency",
    "例如：港币、Hong Kong 或 HKD": "For example: Hong Kong Dollar, Hong Kong, or HKD",
    "世界货币": "All currencies",
    "添加货币": "Add currency",
    "输入货币名称开始查找": "Type a currency name to search",
    "家庭结算": "Family settlement",
    "查看票据": "View ticket",
    "每人约": "about",
    "已选择": "Selected",
    "已选": "Selected",
    "本位币": "Base currency",
    "总览": "Overview",
    "放大": "Enlarge",
    "查看": "View",
    "编辑账单": "Edit bill",
    "保存修改": "Save changes",
    "保存账单": "Save bill",
    "保存备注": "Save note",
    "添加同行人": "Add a person",
    "成员姓名": "Name",
    "头像颜色": "Avatar color",
    "取消编辑": "Cancel edit",
    "折合人民币": "In Chinese Yuan",
    "添加成员": "Add a person",
    "搜索货币": "Search currencies",
    "货币": "Currency",
    "选填": "Optional",
    "单选": "One",
    "多选": "Several",
    "买单人": "Paid by",
    "参与分账人": "Split with",
    "下单时间": "When",
    "全选": "Select all",
    "暂无": "None",
    "备注：": "Note:",
    "备注": "Note",
    "币种": "Currency",
    "金额": "Amount",
    "分类": "Category",
    "买单": "Paid",
    "分账": "Split",
    "应收": "To receive",
    "应付": "To pay",
    "已结清": "Settled",
    "转给": "Pay",
    "现属": "Currently in",
    "同行人": "People",
    "家庭": "Family",
    "设置": "Settings",
    "管理": "Manage",
    "编辑": "Edit",
    "删除": "Delete",
    "完成": "Done",
    "餐饮": "Food",
    "交通": "Transport",
    "住宿": "Stay",
    "门票": "Tickets",
    "购物": "Shopping",
    "其他": "Other",
    "人民币": "Chinese Yuan",
    "港币": "Hong Kong Dollar",
    "澳门元": "Macanese Pataca",
    "新台币": "New Taiwan Dollar",
    "欧元": "Euro",
    "瑞士法郎": "Swiss Franc",
    "美元": "US Dollar",
    "英镑": "British Pound",
    "日元": "Japanese Yen",
    "韩元": "South Korean Won",
    "新加坡元": "Singapore Dollar",
    "马来西亚林吉特": "Malaysian Ringgit",
    "泰铢": "Thai Baht",
    "印度尼西亚盾": "Indonesian Rupiah",
    "菲律宾比索": "Philippine Peso",
    "越南盾": "Vietnamese Dong",
    "加元": "Canadian Dollar",
    "澳大利亚元": "Australian Dollar",
    "新西兰元": "New Zealand Dollar"
  };

  const ORDERED = Object.entries(PHRASES).sort((left, right) => right[0].length - left[0].length);

  function withPad(original, translated) {
    const start = original.match(/^\s*/)[0];
    const end = original.match(/\s*$/)[0];
    return `${start}${translated}${end}`;
  }

  function translate(value) {
    if (current !== "en" || typeof value !== "string" || !/[\u4e00-\u9fff]/.test(value)) return value;
    const trimmed = value.trim();
    if (PHRASES[trimmed]) return withPad(value, PHRASES[trimmed]);
    let next = value;
    next = next.replace(/(\d+)\s*项待购票/g, "$1 tickets to buy");
    next = next.replace(/(\d+)\s*笔账单/g, "$1 bills");
    next = next.replace(/(\d+)\s*笔转账/g, "$1 transfers");
    next = next.replace(/(\d+)\s*分钟/g, "$1 min");
    next = next.replace(/(\d+)\s*小时/g, "$1 hr");
    next = next.replace(/(\d+)\s*分/g, "$1 min");
    next = next.replace(/(\d+)\s*天/g, "$1 days");
    next = next.replace(/(\d+)\s*晚/g, "$1 nights");
    next = next.replace(/(\d+)\s*人/g, "$1 people");
    next = next.replace(/(\d+)\s*个/g, "$1");
    next = next.replace(/至\s*(\d{1,2}:\d{2})/g, "until $1");
    const long = ORDERED.filter(([zh]) => zh.length >= 4);
    const short = ORDERED.filter(([zh]) => zh.length >= 2 && zh.length < 4);
    long.forEach(([zh, en]) => {
      if (next.includes(zh)) next = next.split(zh).join(en);
    });
    short.forEach(([zh, en]) => {
      const pattern = new RegExp(`(^|[^\\u4e00-\\u9fff])${zh.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^\\u4e00-\\u9fff])`, "g");
      next = next.replace(pattern, `$1${en}`);
    });
    next = next.replace(/现属/g, "Currently in ");
    if (!/[\u4e00-\u9fff]/.test(next)) next = next.replace(/，/g, ", ");
    return next;
  }

  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA"]);

  function apply(root) {
    mark();
    if (!root || current !== "en") return;
    const scope = root.nodeType === 1 ? root : document.body;
    if (!scope) return;
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !/[\u4e00-\u9fff]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || SKIP_TAGS.has(parent.tagName) || parent.closest("[data-set-lang]")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const next = translate(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
    scope.querySelectorAll("[placeholder], [aria-label], [title]").forEach((element) => {
      ["placeholder", "aria-label", "title"].forEach((attr) => {
        if (element.closest("[data-set-lang]")) return;
        const text = element.getAttribute(attr);
        if (!text || !/[\u4e00-\u9fff]/.test(text)) return;
        const next = translate(text);
        if (next !== text) element.setAttribute(attr, next);
      });
    });
    if (scope === document.body && /[\u4e00-\u9fff]/.test(document.title)) document.title = translate(document.title);
  }

  function mark() {
    document.documentElement.lang = current === "en" ? "en" : "zh-CN";
    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      const on = button.dataset.setLang === current;
      button.classList.toggle("is-current", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-set-lang]");
    if (!button) return;
    const next = button.dataset.setLang === "en" ? "en" : "zh";
    if (next === current) return;
    try { localStorage.setItem(KEY, next); } catch (error) { /* keep the click local */ }
    location.reload();
  });

  if (document.documentElement) document.documentElement.lang = current === "en" ? "en" : "zh-CN";
  document.addEventListener("DOMContentLoaded", mark);

  globalThis.tripLanguage = { lang: () => current, translate, apply };
})();
