// 定義不同語言的文本內容
const translations = {
	en: {
		header: "Ray's Gamepad Tester",
		oscilloscope: "Oscilloscope",
		home: "Home",
		linearity: "Linearity",
		staticNoise: "Static Noise Test",
		wobble: "Wobble Check",
		roundness: "Roundness Test",
		direction: "Direction Check",
		cw: "CW",
		ccw: "CCW",
		adjustment: "Adjustment plans:",
		none: "None",
		original: "The original output.",
		general: "General:",
		amp: "Output Amplify",
		deadzone: "Deadzone",
		roundLock: "Round Lock",
		individual: "Individual:",
		edge: "Edge Compensation (Draw 3 circles)",
		left: "Left Joystick:",
		right: "Right Joystick:",
		bg: "Background Color:",
		black: "BLACK",
		linearityStd: "Independent Linearity Standard:",
		require: "(Requires special tool.)",
		xpush: "X Axis Push",
		ypush: "Y Axis Push",
		xreturn: "X Axis Return",
		yreturn: "Y Axis Return",
		copyright: "© 2024 Ray Liu. All rights reserved.",
		range: "Range",
		rj: "Right Joystick",
		lj: "Left Joystick"
	},
	zh: {
		header: "Ray的手柄測試工具",
		oscilloscope: "示波器",
		home: "首頁",
		linearity: "線性測試",
		staticNoise: "靜態雜波測試",
		wobble: "復歸精度測試",
		roundness: "真圓度測試",
		direction: "檢查旋轉方向",
		cw: "順時針",
		ccw: "逆時針",
		adjustment: "校正方案：",
		none: "無校正",
		original: "原始輸出",
		general: "通用型：",
		amp: "輸出放大百分比",
		deadzone: "死區百分比",
		roundLock: "外圓鎖定",
		individual: "單體校正：",
		edge: "尋邊校正(左右搖桿各轉三圈)",
		left: "左搖桿：",
		right: "右搖桿：",
		bg: "背景顏色：",
		black: "黑色",
		linearityStd: "獨立線性測試標準",
		require: "(需要特殊測試制具)",
		xpush: "X軸去程",
		ypush: "Y軸去程",
		xreturn: "X軸返程",
		yreturn: "Y軸返程",
		copyright: "© 2024 Ray Liu. 保留所有權利。",
		range: "範圍",
		rj: "右搖桿",
		lj: "左搖桿"
	}
};

// 切換語言的函數
function switchLanguage(language) {
	// 存儲選擇的語言到 localStorage
    localStorage.setItem('language', language);
	// 獲取所有需要翻譯的元素
	const elements = document.querySelectorAll('[data-key]');
	
	// 遍歷每個元素並更新其文本內容
	elements.forEach(element => {
		const key = element.getAttribute('data-key');
		element.textContent = translations[language][key];
	});
}

// 頁面加載時應用存儲的語言設置
document.addEventListener('DOMContentLoaded', () => {
	const language = localStorage.getItem('language') || 'en';
	switchLanguage(language);
});