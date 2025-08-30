const Model = {
    create: function(name,roundnessTest,rangeUp, rangeDown, only4D,centerV,staticTest,noise,slideTest, slideNoise, directionTest,returnTest,returnAccuracy,returnRing,ringLow,ringUp,balanceTest,balanceStd,switchTest,note,options) {
        return {
            name: name,				//型號名稱
			roundnessTest: roundnessTest,	//是否進行最大最小分壓測試
            rangeUp: rangeUp,		//外圓上限
            rangeDown: rangeDown,	//外圓下限
			only4D: only4D,			//是否只測四個方向
			centerV: centerV,		//中心分壓標準
			staticTest: staticTest,	//是否進行靜態雜訊測試
			noise: noise,			//靜態雜訊標準
			slideTest: slideTest,	//是否進行滑動雜音測試
			slideNoise:slideNoise,	//滑動雜音標準
			directionTest:directionTest, //是否進行方向測試
			returnTest:returnTest,	//是否進行複歸測試
			returnAccuracy: returnAccuracy,	//複歸標準
			returnRing:returnRing,	//是否使用複歸環
			ringLow:ringLow,		//複歸環下限
			ringUp:ringUp,			//複歸環上限
			balanceTest: balanceTest,	//是否進行對稱性測試
			balanceStd: balanceStd,	//對稱性標準
			switchTest: switchTest,	//是否進行開關測試
			note: note,				//備註
			options:options			//存在的本體顏色選項
        };
    }
};
const models = [
				//名稱，上下分壓,上，下，四向，中標，靜雜，標準，滑雜，標準，方向，複歸，標，環，下，上，對稱，標，開關，備註，  本體顏色選項	
				//  ↓      ↓   ↓  ↓   ↓     ↓  ↓   ↓   ↓    ↓    ↓    ↓   ↓  ↓  ↓  ↓   ↓    ↓    ↓	 ↓          ↓
	Model.create("標準手柄",true,120,60,false,7,false,2,true,100,false,true,7,true,55,95,true,10,true,"不需測試制具",[3]),
	Model.create("FJR10K",true,96,40,true,7.5,false,100,true,300,true,true,4,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2]),
];

