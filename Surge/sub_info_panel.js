/*
Surge Ultimate Airport Panel PRO
JSON API version
适配 搬瓦工 Just My Socks
*/

const args = getArgs();

(async () => {

let traffic = await getTraffic(args.api);
let nodes = await getNodes(args.sub);
let ip = await getIP();
let unlock = await unlock();
let delay = await ping();

let used = traffic.used;
let total = traffic.total;
let left = total - used;

let percent = ((used/total)*100).toFixed(1);

let bar = progress(percent);

let reset = resetDays(traffic.reset_day);

let now = new Date().toTimeString().slice(0,5);

let content = [

`${bar}`,
`流量 ${size(used)} / ${size(total)}`,
`剩余 ${size(left)} (${percent}%)`,
``,
`节点 ${nodes} | ${ip.flag} ${ip.ip}`,
``,
`ChatGPT ${unlock.gpt}  Gemini ${unlock.gemini}`,
`Netflix ${unlock.netflix}`,
``,
`延迟 ${delay}ms | 重置 ${reset}天`

];

$done({
title:`机场状态 | ${now}`,
content:content.join("\n"),
icon:"wifi",
"icon-color":"#007aff"
});

})();

function getArgs(){
if(!$argument) return {};
return Object.fromEntries(
$argument.split("&")
.map(i=>i.split("="))
.map(([k,v])=>[k,decodeURIComponent(v)])
)
}

async function getTraffic(url){

return new Promise(resolve=>{

$httpClient.get(url,(e,r,d)=>{

try{

let j=JSON.parse(d);

resolve({
total:Number(j.monthly_bw_limit_b),
used:Number(j.bw_counter_b),
reset_day:Number(j.bw_reset_day_of_month)
});

}catch{

resolve({total:0,used:0,reset_day:0});

}

})

})

}

async function getNodes(url){

if(!url) return "-";

return new Promise(resolve=>{

$httpClient.get(url,(e,r,d)=>{

try{

let list=atob(d).split("\n");

resolve(list.length);

}catch{

resolve("-");

}

})

})

}

async function getIP(){

return new Promise(resolve=>{

$httpClient.get("https://ipapi.co/json",(e,r,d)=>{

try{

let j=JSON.parse(d);

resolve({
ip:j.ip,
flag:flagEmoji(j.country_code)
});

}catch{

resolve({ip:"-",flag:"🌍"});

}

})

})

}

function flagEmoji(cc){

return cc.toUpperCase().replace(/./g,
c=>String.fromCodePoint(127397+c.charCodeAt())
)

}

async function unlock(){

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

$httpClient.get("https://www.gstatic.com/generate_204",()=>{

resolve(Date.now()-s);

})

})

}

function fetch(url){

return new Promise((resolve,reject)=>{

$httpClient.get(url,(e,r)=>{

if(e) reject(e);
else resolve(r);

})

})

}

function progress(p){

let n=Math.floor(p/10);

let bar="";

for(let i=0;i<10;i++){

bar+=i<n?"█":"░";

}

return `${bar} ${p}%`;

}

function resetDays(d){

if(!d) return "-";

let now=new Date();

let today=now.getDate();

let y=now.getFullYear();

let m=now.getMonth();

if(d>today) return d-today;

let days=new Date(y,m+1,0).getDate();

return days-today+d;

}

function size(b){

if(b==0) return "0B";

let k=1024;

let s=["B","KB","MB","GB","TB"];

let i=Math.floor(Math.log(b)/Math.log(k));

return (b/Math.pow(k,i)).toFixed(2)+" "+s[i];

}
