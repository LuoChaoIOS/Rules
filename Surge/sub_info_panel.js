/*
Surge Ultimate Panel (No Node Count)
Compatible with Surge 5/6
适配 搬瓦工 Just My Socks
*/

const args = getArgs();

(async () => {

try {

let traffic = await getTraffic(args.api);
let ip = await getIP();
let unlock = await unlockTest();
let delay = await ping();

let used = traffic.used;
let total = traffic.total;
let left = total - used;

let percent = total ? ((used / total) * 100).toFixed(1) : 0;

let bar = progress(percent);

let reset = resetDays(traffic.reset_day);

let time = new Date().toTimeString().slice(0,5);

let content = [

`${bar}`,
`流量 ${size(used)} / ${size(total)}`,
`剩余 ${size(left)} (${percent}%)`,
``,
`${ip.flag} ${ip.ip}`,
``,
`ChatGPT ${unlock.gpt} Gemini ${unlock.gemini}`,
`Netflix ${unlock.netflix}`,
``,
`延迟 ${delay}ms | 重置 ${reset}天`

];

$done({
title:`机场状态 | ${time}`,
content:content.join("\n"),
icon:"antenna.radiowaves.left.and.right",
"icon-color":"#007aff"
});

} catch(e){

$done({
title:"机场状态",
content:"脚本执行失败"
});

}

})();

function getArgs(){
if(!$argument) return {};
return Object.fromEntries(
$argument.split("&")
.map(i=>i.split("="))
.map(([k,v])=>[k,decodeURIComponent(v)])
);
}

async function getTraffic(url){

return new Promise(resolve=>{

$httpClient.get({url:url},(err,resp,data)=>{

if(err){
resolve({total:0,used:0,reset_day:0});
return;
}

try{

let j = JSON.parse(data);

resolve({
total:Number(j.monthly_bw_limit_b || 0),
used:Number(j.bw_counter_b || 0),
reset_day:Number(j.bw_reset_day_of_month || 0)
});

}catch{

resolve({total:0,used:0,reset_day:0});

}

});

});

}

async function getIP(){

return new Promise(resolve=>{

$httpClient.get({url:"https://ipapi.co/json"},(e,r,d)=>{

try{

let j=JSON.parse(d);

resolve({
ip:j.ip,
flag:flagEmoji(j.country_code)
});

}catch{

resolve({ip:"-",flag:"🌍"});

}

});

});

}

function flagEmoji(cc){

if(!cc) return "🌍";

return cc.toUpperCase().replace(/./g,
c=>String.fromCodePoint(127397+c.charCodeAt())
);

}

async function unlockTest(){

let r={gpt:"❌",gemini:"❌",netflix:"❌"};

try{
let a=await fetch("https://chat.openai.com");
if(a.status==200) r.gpt="✅";
}catch{}

try{
let a=await fetch("https://gemini.google.com");
if(a.status==200) r.gemini="✅";
}catch{}

try{
let a=await fetch("https://www.netflix.com/title/80018499");
if(a.status==200) r.netflix="✅";
}catch{}

return r;

}

async function ping(){

let s=Date.now();

return new Promise(resolve=>{

$httpClient.get({url:"https://www.gstatic.com/generate_204"},()=>{

resolve(Date.now()-s);

});

});

}

function fetch(url){

return new Promise((resolve,reject)=>{

$httpClient.get({url:url},(e,r)=>{

if(e) reject(e);
else resolve(r);

});

});

}

function progress(p){

let n=Math.floor(p/10);

let bar="";

for(let i=0;i<10;i++){
bar+=i<n?"█":"░";
}

return `${bar} ${p}%`;

}

function resetDays(day){

if(!day) return "-";

let now=new Date();
let today=now.getDate();

let y=now.getFullYear();
let m=now.getMonth();

if(day>today) return day-today;

let days=new Date(y,m+1,0).getDate();

return days-today+day;

}

function size(b){

if(!b) return "0B";

let k=1024;
let s=["B","KB","MB","GB","TB"];

let i=Math.floor(Math.log(b)/Math.log(k));

return (b/Math.pow(k,i)).toFixed(2)+" "+s[i];

}
