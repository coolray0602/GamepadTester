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
				//  ↓       ↓    ↓   ↓   ↓    ↓   ↓    ↓     ↓    ↓    ↓    ↓    ↓     ↓  ↓  ↓   ↓    ↓    ↓	 ↓          ↓
	Model.create("FJR03K",true,100,60,true,7,true,2,true,100,false,true,7,true,55,95,true,10,false,"不需測試制具",[5]),
	Model.create("FJR10K",true,96,40,true,7.5,false,100,true,300,true,true,4,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2]),
	Model.create("FJH10K-S★(產線)",true,96,40,true,7.5,false,100,false,300,true,true,3.8,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-S★(品保)",true,98,38,true,8,false,100,false,300,true,true,4,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-0022A(產線)",true,86,34,true,6.5,false,100,false,300,true,true,3.8,true,10,30,false,10,true,"19度(直徑6.5mm)測試頭",[2]),
	Model.create("FJH10K-0022A(品保)",true,90,30,true,7,false,100,false,300,true,true,4,true,10,30,false,10,true,"19度(直徑6.5mm)測試頭",[2]),
	Model.create("FJH10K-S★D(產線)",true,99,50,true,7.5,false,100,false,300,true,true,3.8,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-S★D(品保)",true,99.6,49,true,8,false,100,false,300,true,true,4,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-S★D1T(產線)",true,100,81,true,17,false,100,false,300,true,true,5.8,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-S★D1T(品保)",true,100,80,true,18,false,100,false,300,true,true,6,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-S★D2T(產線)",true,100,50,true,17,false,100,false,300,true,true,4.8,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-S★D2T(品保)",true,100,49,true,18,false,100,false,300,true,true,5,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-S★M(產線)",true,90,60,true,4.5,false,100,false,300,true,true,3.8,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-S★M(品保)",true,94,56,true,5,false,100,false,300,true,true,4,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-0014A/0019A/0023A(產線/品保)",true,90,60,true,4.5,false,100,false,300,true,true,3.8,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[3]),
	Model.create("FJH10K-0015A/0020A/0024A(產線/品保)",true,90,60,true,4.5,false,100,false,300,true,true,3.8,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[4]),
	Model.create("FJH10K-0016A/0021A/0025A(產線/品保)",true,90,60,true,4.5,false,100,false,300,true,true,3.8,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[5]),
	Model.create("FJH10K-0011A(產線)",true,120,70,true,7.5,false,100,false,300,true,true,3.8,true,10,30,false,10,true,"不需要測試頭",[3]),
	Model.create("FJH10K-S★-R-A1(產線)",true,90,60,true,4.5,false,100,false,300,true,true,3.8,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-S★-R-A1(品保)",true,94,56,true,5,false,100,false,300,true,true,4,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-S★-R-D(產線)",true,90,60,true,7.5,false,100,false,300,true,true,3.8,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5]),
	Model.create("FJH10K-S★-R-D(品保)",true,94,56,true,8,false,100,false,300,true,true,4,true,10,30,false,10,true,"22度(直徑5.5mm)測試頭",[2,3,4,5])
];

