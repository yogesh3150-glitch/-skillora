const http=require("http"),fs=require("fs"),path=require("path"),crypto=require("crypto"),querystring=require("querystring");
const PORT=3000, DB=path.join(__dirname,"db.json");
const initial={users:[{id:"admin",name:"Skillora Admin",email:"admin@skillora.local",password:"admin123",role:"admin",createdAt:new Date().toISOString()}],
courses:[
{id:"c1",title:"Digital Marketing",price:999,oldPrice:1999,icon:"📣",description:"SEO, social media, ads and practical campaigns."},
{id:"c2",title:"Data Analytics",price:699,oldPrice:1299,icon:"📊",description:"Excel, dashboards and practical data analysis."},
{id:"c3",title:"Affiliate Marketing",price:799,oldPrice:1499,icon:"💼",description:"Learn referral marketing and audience growth."},
{id:"c4",title:"Website Creation",price:799,oldPrice:1499,icon:"🌐",description:"Build modern responsive websites."},
{id:"c5",title:"Canva Design",price:599,oldPrice:999,icon:"🎨",description:"Create social posts, thumbnails and ads."},
{id:"c6",title:"AI Productivity",price:699,oldPrice:1299,icon:"🤖",description:"Use AI tools to work faster and smarter."}],
orders:[],enrollments:[],affiliates:[],settings:{brand:"Skillora",tagline:"Learn. Earn. Grow."}};
if(!fs.existsSync(DB))fs.writeFileSync(DB,JSON.stringify(initial,null,2));
function db(){return JSON.parse(fs.readFileSync(DB,"utf8"))} function save(x){fs.writeFileSync(DB,JSON.stringify(x,null,2))}
function send(res,s,t,d){res.writeHead(s,{"Content-Type":t});res.end(d)}
function json(res,s,o){send(res,s,"application/json; charset=utf-8",JSON.stringify(o))}
function body(req){return new Promise(r=>{let d="";req.on("data",x=>d+=x);req.on("end",()=>r(querystring.parse(d)))})}
function id(){return crypto.randomBytes(5).toString("hex")}
const server=http.createServer(async(req,res)=>{
 let d=db(), u=req.url.split("?")[0], method=req.method;
 if(method==="GET"&&u==="/api/state")return json(res,200,{courses:d.courses,settings:d.settings});
 if(method==="POST"&&u==="/api/register"){let b=await body(req),email=String(b.email||"").toLowerCase().trim();if(!b.name||!email||String(b.password).length<6)return json(res,400,{ok:false,message:"Name, valid email and 6+ character password required."});if(d.users.some(x=>x.email===email))return json(res,409,{ok:false,message:"Email already registered."});let x={id:id(),name:String(b.name),email,password:String(b.password),role:"student",createdAt:new Date().toISOString()};d.users.push(x);save(d);return json(res,200,{ok:true,user:{id:x.id,name:x.name,email:x.email,role:x.role}})}
 if(method==="POST"&&u==="/api/login"){let b=await body(req),x=d.users.find(x=>x.email===String(b.email||"").toLowerCase()&&x.password===String(b.password||""));if(!x)return json(res,401,{ok:false,message:"Invalid email or password."});return json(res,200,{ok:true,user:{id:x.id,name:x.name,email:x.email,role:x.role}})}
 if(method==="GET"&&u==="/api/admin"){return json(res,200,{users:d.users.map(x=>({id:x.id,name:x.name,email:x.email,role:x.role,createdAt:x.createdAt})),courses:d.courses,orders:d.orders,enrollments:d.enrollments,affiliates:d.affiliates,settings:d.settings})}
 if(method==="POST"&&u==="/api/course"){let b=await body(req),x={id:id(),title:String(b.title),price:Number(b.price||0),oldPrice:Number(b.oldPrice||0),icon:String(b.icon||"📚"),description:String(b.description||"")};d.courses.push(x);save(d);return json(res,200,{ok:true,course:x})}
 if(method==="POST"&&u==="/api/course/delete"){let b=await body(req);d.courses=d.courses.filter(x=>x.id!==b.id);save(d);return json(res,200,{ok:true})}
 if(method==="POST"&&u==="/api/buy"){let b=await body(req),c=d.courses.find(x=>x.id===b.courseId);if(!c)return json(res,404,{ok:false,message:"Course not found"});let o={id:"ORD-"+id().toUpperCase(),userId:b.userId,courseId:c.id,amount:c.price,status:"paid-demo",createdAt:new Date().toISOString()};d.orders.push(o);d.enrollments.push({id:id(),userId:b.userId,courseId:c.id,progress:0});save(d);return json(res,200,{ok:true,order:o})}
 if(method==="GET"&&u==="/api/student"){let uid=new URL(req.url,"http://x").searchParams.get("userId");return json(res,200,{user:d.users.find(x=>x.id===uid),enrollments:d.enrollments.filter(x=>x.userId===uid).map(e=>({...e,course:d.courses.find(c=>c.id===e.courseId)})),orders:d.orders.filter(x=>x.userId===uid)})}
 if(method==="POST"&&u==="/api/affiliate"){let b=await body(req),x={id:id(),name:String(b.name),email:String(b.email),clicks:0,conversions:0,earnings:0};d.affiliates.push(x);save(d);return json(res,200,{ok:true,affiliate:x})}
 if(method==="POST"&&u==="/api/settings"){let b=await body(req);d.settings={...d.settings,brand:String(b.brand||d.settings.brand),tagline:String(b.tagline||d.settings.tagline)};save(d);return json(res,200,{ok:true,settings:d.settings})}
 let file=u==="/"?"index.html":u.slice(1),fp=path.join(public,file);if(!fp.startsWith(public)||!fs.existsSync(fp))return send(res,404,"text/plain","Not found");let ext=path.extname(fp);let mt={".html":"text/html",".css":"text/css",".js":"text/javascript",".json":"application/json"}[ext]||"text/plain";send(res,200,mt,fs.readFileSync(fp));
});
server.listen(process.env.PORT || 3000, "0.0.0.0", () =>
  console.log("Skillora running")
);
