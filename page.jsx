"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Cloudinary Config ────────────────────────────────────────────────────── */
const CLOUD_NAME = "drvgcxjll";
const UPLOAD_PRESET = "bestie_uploads";
async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method:"POST", body:fd });
  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url;
}

/* ─── Google Fonts ─────────────────────────────────────────────────────────── */
const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Fredoka:wght@400;600;700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Caveat:wght@400;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Poppins',sans-serif;overflow-x:hidden}
    input,textarea,select,button{font-family:inherit}
    ::-webkit-scrollbar{width:6px}
    ::-webkit-scrollbar-track{background:#ffe4ec}
    ::-webkit-scrollbar-thumb{background:#ffb6c1;border-radius:10px}
    @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
    @keyframes floatYslow{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-24px) rotate(3deg)}}
    @keyframes spin360{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes heartbeat{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
    @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
    @keyframes kenburns{0%{transform:scale(1) translate(0,0)}100%{transform:scale(1.12) translate(-2%,-2%)}}
    @keyframes typewriter{from{width:0}to{width:100%}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes rise{0%{transform:translateY(100vh) rotate(var(--r));opacity:0}20%{opacity:1}80%{opacity:.8}100%{transform:translateY(-20vh) rotate(var(--r));opacity:0}}
    @keyframes explode{0%{transform:scale(0) translate(0,0);opacity:1}100%{transform:scale(1) translate(var(--tx),var(--ty));opacity:0}}
    @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(255,107,107,.3),0 0 60px rgba(255,182,193,.2)}50%{box-shadow:0 0 40px rgba(255,107,107,.6),0 0 80px rgba(255,182,193,.4)}}
    @keyframes ribbonDrop{0%{transform:scaleY(0) rotate(-5deg);transform-origin:top}100%{transform:scaleY(1) rotate(-5deg);transform-origin:top}}
    @keyframes lidOpen{0%{transform:rotateX(0deg)}100%{transform:rotateX(-140deg)}}
    @keyframes bounce2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  `}</style>
);

/* ─── Design Tokens ────────────────────────────────────────────────────────── */
const C = {
  rose:"#FF6B8A", roseDark:"#E8527A", roseLight:"#FFB6C1",
  peach:"#FFD4B8", cream:"#FFF8F0", gold:"#FFD700",
  lavender:"#E8D5F5", mint:"#D4F5E8",
  white:"rgba(255,255,255,0.95)", glass:"rgba(255,255,255,0.7)",
  text:"#3D2030", textSoft:"#8B6070", textLight:"#C4A0B0",
};

/* ─── Animated Background ──────────────────────────────────────────────────── */
function PremiumBG() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:-2,overflow:"hidden"}}>
      {/* Animated gradient base */}
      <div style={{
        position:"absolute",inset:0,
        background:"linear-gradient(135deg,#FFE4EC 0%,#FFF0F7 25%,#FFF8E7 50%,#FFE8F4 75%,#FDE8FF 100%)",
        backgroundSize:"400% 400%",animation:"gradShift 12s ease infinite",
      }}/>
      {/* Soft glow blobs */}
      {[
        {x:"10%",y:"15%",s:"340px",c:"rgba(255,182,193,.35)"},
        {x:"75%",y:"8%",s:"280px",c:"rgba(255,215,180,.3)"},
        {x:"60%",y:"60%",s:"380px",c:"rgba(232,213,245,.4)"},
        {x:"5%",y:"70%",s:"250px",c:"rgba(255,107,138,.2)"},
        {x:"85%",y:"80%",s:"300px",c:"rgba(212,245,232,.35)"},
      ].map((b,i)=>(
        <div key={i} style={{
          position:"absolute",left:b.x,top:b.y,
          width:b.s,height:b.s,borderRadius:"50%",
          background:b.c,filter:"blur(60px)",
          animation:`floatYslow ${8+i*1.5}s ${i*2}s ease-in-out infinite`,
        }}/>
      ))}
      {/* Floating flowers & hearts */}
      {["🌸","💕","✨","🌺","💖","🌼","💗","⭐","🎀","💝","🌸","💕"].map((e,i)=>(
        <div key={i} style={{
          position:"absolute",
          left:`${(i*8+5)%95}%`,
          top:`${(i*13+10)%90}%`,
          fontSize:`${14+i%3*4}px`,
          animation:`floatY ${5+i%4}s ${i*0.7}s ease-in-out infinite`,
          opacity:0.55,pointerEvents:"none",
        }}>{e}</div>
      ))}
    </div>
  );
}

/* ─── Glass Card ───────────────────────────────────────────────────────────── */
function GlassCard({children,style={},glow=false}){
  return(
    <div style={{
      background:C.glass,backdropFilter:"blur(20px)",
      border:"1.5px solid rgba(255,182,193,.5)",
      borderRadius:"28px",padding:"32px 24px",
      boxShadow:glow
        ?"0 8px 40px rgba(255,107,138,.25),0 0 0 1px rgba(255,255,255,.5),inset 0 1px 0 rgba(255,255,255,.8)"
        :"0 8px 32px rgba(255,107,138,.12),0 0 0 1px rgba(255,255,255,.5),inset 0 1px 0 rgba(255,255,255,.8)",
      maxWidth:"420px",width:"94%",margin:"0 auto",
      animation:glow?"glowPulse 3s ease-in-out infinite":"none",
      ...style,
    }}>{children}</div>
  );
}

/* ─── Button ───────────────────────────────────────────────────────────────── */
function Btn({children,onClick,variant="primary",disabled=false,style={}}){
  const variants={
    primary:{background:"linear-gradient(135deg,#FF6B8A,#FF4070)",color:"#fff",shadow:"0 6px 24px rgba(255,64,112,.4)"},
    soft:   {background:"linear-gradient(135deg,#FFD4B8,#FFBFA3)",color:"#8B4513",shadow:"0 6px 20px rgba(255,180,140,.35)"},
    ghost:  {background:"rgba(255,255,255,.6)",color:C.rose,shadow:"0 4px 16px rgba(255,107,138,.15)",border:"1.5px solid #FFB6C1"},
    gold:   {background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#5C3A00",shadow:"0 6px 24px rgba(255,180,0,.4)"},
  };
  const v=variants[variant]||variants.primary;
  return(
    <motion.button
      whileHover={!disabled?{scale:1.04,y:-2}:{}}
      whileTap={!disabled?{scale:.97}:{}}
      onClick={onClick}
      disabled={disabled}
      style={{
        border:v.border||"none",borderRadius:"50px",padding:"14px 28px",
        fontFamily:"'Fredoka',cursive",fontSize:"17px",fontWeight:700,
        cursor:disabled?"not-allowed":"pointer",
        background:v.background,color:v.color,
        boxShadow:v.shadow,transition:"all .2s",
        opacity:disabled?.55:1,...style,
      }}
    >{children}</motion.button>
  );
}

/* ─── Input ────────────────────────────────────────────────────────────────── */
function Input({label,value,onChange,placeholder,type="text",rows}){
  const Tag=rows?"textarea":"input";
  return(
    <div style={{marginBottom:"16px",textAlign:"left"}}>
      {label&&<label style={{display:"block",fontFamily:"'Fredoka',cursive",fontSize:"14px",color:C.rose,marginBottom:"6px",fontWeight:600}}>{label}</label>}
      <Tag
        type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{
          width:"100%",padding:"12px 16px",borderRadius:"16px",
          border:"1.5px solid rgba(255,182,193,.6)",background:"rgba(255,255,255,.75)",
          fontSize:"15px",color:C.text,outline:"none",resize:rows?"vertical":"none",
          fontFamily:"'Poppins',sans-serif",transition:"border .2s",
        }}
        onFocus={e=>e.target.style.borderColor=C.rose}
        onBlur={e=>e.target.style.borderColor="rgba(255,182,193,.6)"}
      />
    </div>
  );
}

/* ─── Particle Burst ───────────────────────────────────────────────────────── */
function ParticleBurst({active}){
  if(!active)return null;
  const parts=Array.from({length:30},(_,i)=>({
    id:i,
    emoji:["💖","✨","🌸","💕","⭐","🎀","💝"][i%7],
    tx:`${(Math.random()-0.5)*300}px`,
    ty:`${(Math.random()-0.5)*300}px`,
    delay:Math.random()*0.5,
  }));
  return(
    <div style={{position:"fixed",inset:0,zIndex:900,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
      {parts.map(p=>(
        <div key={p.id} style={{
          position:"absolute",fontSize:"20px",
          "--tx":p.tx,"--ty":p.ty,
          animation:`explode .8s ${p.delay}s ease-out forwards`,
        }}>{p.emoji}</div>
      ))}
    </div>
  );
}

/* ─── Heart Rain ───────────────────────────────────────────────────────────── */
function HeartRain({active}){
  if(!active)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:50,pointerEvents:"none",overflow:"hidden"}}>
      {Array.from({length:25},(_,i)=>(
        <div key={i} style={{
          position:"absolute",
          left:`${Math.random()*100}%`,top:"-40px",
          fontSize:`${14+Math.random()*16}px`,
          "--r":`${(Math.random()-0.5)*60}deg`,
          animation:`rise ${3+Math.random()*4}s ${Math.random()*5}s linear infinite`,
        }}>{["💖","💕","💝","❤️","🌸"][i%5]}</div>
      ))}
    </div>
  );
}

/* ─── Confetti Canvas ──────────────────────────────────────────────────────── */
function ConfettiCanvas({active}){
  const ref=useRef(null);
  const anim=useRef(null);
  useEffect(()=>{
    if(!active||!ref.current)return;
    const c=ref.current,ctx=c.getContext("2d");
    c.width=window.innerWidth;c.height=window.innerHeight;
    const pieces=Array.from({length:150},()=>({
      x:Math.random()*c.width,y:-20,
      vx:(Math.random()-.5)*4,vy:Math.random()*4+1.5,
      r:Math.random()*7+3,angle:Math.random()*Math.PI*2,va:(Math.random()-.5)*.15,
      color:["#FF6B8A","#FFB6C1","#FFD700","#FF85A1","#FFF4A3","#FF4070","#FFD4B8"][Math.floor(Math.random()*7)],
      shape:Math.random()>.5?"circle":"rect",
    }));
    const loop=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      pieces.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;p.angle+=p.va;
        if(p.y>c.height){p.y=-10;p.x=Math.random()*c.width;}
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
        ctx.fillStyle=p.color;
        if(p.shape==="circle"){ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();}
        else ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);
        ctx.restore();
      });
      anim.current=requestAnimationFrame(loop);
    };loop();
    return()=>cancelAnimationFrame(anim.current);
  },[active]);
  if(!active)return null;
  return<canvas ref={ref} style={{position:"fixed",inset:0,zIndex:40,pointerEvents:"none"}}/>;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SCREENS                                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */

/* ─── SCREEN 0: Creator Mode ────────────────────────────────────────────── */
function CreatorMode({onDone}){
  const [step,setStep]=useState(0);
  const [data,setData]=useState({
    friendName:"",nickname:"",personalMsg:"",secretMsg:"",
    futurePromise:"",favoriteQuote:"",bestMemoryDate:"",
    memories:[],photos:[],
  });
  const [memForm,setMemForm]=useState({title:"",date:"",desc:"",photo:null});
  const [photoFiles,setPhotoFiles]=useState([]); // Cloudinary URLs
  const [uploading,setUploading]=useState(false);
  const [uploadMsg,setUploadMsg]=useState("");

  const set=(k,v)=>setData(d=>({...d,[k]:v}));

  const addMemory=()=>{
    if(!memForm.title)return;
    setData(d=>({...d,memories:[...d.memories,{...memForm,id:Date.now()}]}));
    setMemForm({title:"",date:"",desc:"",photo:null});
  };

  const handlePhotoUpload=async e=>{
    const files=Array.from(e.target.files);
    if(!files.length)return;
    setUploading(true);
    setUploadMsg(`Uploading ${files.length} photo(s)... 🌸`);
    try {
      const urls=await Promise.all(files.map(f=>uploadToCloudinary(f)));
      setPhotoFiles(p=>[...p,...urls]);
      setUploadMsg(`✅ ${files.length} photo(s) uploaded!`);
    } catch(err) {
      setUploadMsg("❌ Upload failed. Try again.");
    }
    setUploading(false);
    setTimeout(()=>setUploadMsg(""),3000);
  };

  const handleMemPhoto=async e=>{
    const f=e.target.files[0];if(!f)return;
    setUploadMsg("Uploading memory photo... 🌸");
    try {
      const url=await uploadToCloudinary(f);
      setMemForm(m=>({...m,photo:url}));
      setUploadMsg("✅ Memory photo uploaded!");
    } catch {
      setUploadMsg("❌ Upload failed.");
    }
    setTimeout(()=>setUploadMsg(""),3000);
  };

  const finish=()=>{
    if(!data.friendName.trim())return;
    const payload={...data,photos:photoFiles};
    onDone(payload);
  };

  const steps=[
    // Step 0: Basic info
    <motion.div key="s0" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
      <div style={{textAlign:"center",marginBottom:"24px"}}>
        <div style={{fontSize:"44px",marginBottom:"8px",animation:"floatY 2s ease-in-out infinite"}}>✨</div>
        <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"26px",color:C.rose,marginBottom:"6px"}}>Create the Surprise</h2>
        <p style={{color:C.textSoft,fontSize:"14px"}}>Fill in the details for your bestie's special experience</p>
      </div>
      <Input label="💖 Friend's Name *" value={data.friendName} onChange={v=>set("friendName",v)} placeholder="e.g. Priya"/>
      <Input label="🌸 Nickname" value={data.nickname} onChange={v=>set("nickname",v)} placeholder="e.g. Pookie, Bestie, Jaan"/>
      <Input label="💌 Personal Message" value={data.personalMsg} onChange={v=>set("personalMsg",v)} placeholder="Something heartfelt for them..." rows={3}/>
      <Input label="🤫 Secret Message (Only they'll see)" value={data.secretMsg} onChange={v=>set("secretMsg",v)} placeholder="The thing you've never told them..." rows={3}/>
      <Btn onClick={()=>setStep(1)} style={{width:"100%",justifyContent:"center"}} disabled={!data.friendName.trim()}>
        Next: Add Memories ➜
      </Btn>
    </motion.div>,

    // Step 1: Extra personal
    <motion.div key="s1" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
      <div style={{textAlign:"center",marginBottom:"24px"}}>
        <div style={{fontSize:"44px",marginBottom:"8px"}}>🎀</div>
        <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"22px",color:C.rose}}>Personal Touches</h2>
      </div>
      <Input label="🌟 Future Promise" value={data.futurePromise} onChange={v=>set("futurePromise",v)} placeholder="e.g. We'll travel to Bali together someday!" rows={2}/>
      <Input label="💬 Your Favorite Quote Together" value={data.favoriteQuote} onChange={v=>set("favoriteQuote",v)} placeholder="Your inside joke or shared quote..."/>
      <Input label="📅 Best Memory Date" value={data.bestMemoryDate} onChange={v=>set("bestMemoryDate",v)} type="date"/>
      <div style={{display:"flex",gap:"10px",marginTop:"8px"}}>
        <Btn onClick={()=>setStep(0)} variant="ghost" style={{flex:1}}>← Back</Btn>
        <Btn onClick={()=>setStep(2)} style={{flex:2}}>Next: Memory Timeline ➜</Btn>
      </div>
    </motion.div>,

    // Step 2: Memories
    <motion.div key="s2" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
      <div style={{textAlign:"center",marginBottom:"20px"}}>
        <div style={{fontSize:"40px"}}>🗓️</div>
        <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"22px",color:C.rose,marginBottom:"4px"}}>Memory Timeline</h2>
        <p style={{color:C.textSoft,fontSize:"13px"}}>Add your shared memories (optional)</p>
      </div>
      <Input label="Memory Title" value={memForm.title} onChange={v=>setMemForm(m=>({...m,title:v}))} placeholder="e.g. That crazy road trip 🚗"/>
      <Input label="Date" value={memForm.date} onChange={v=>setMemForm(m=>({...m,date:v}))} type="date"/>
      <Input label="Story" value={memForm.desc} onChange={v=>setMemForm(m=>({...m,desc:v}))} placeholder="What happened? Make them smile..." rows={2}/>
      <div style={{marginBottom:"12px"}}>
        <label style={{display:"block",fontFamily:"'Fredoka',cursive",fontSize:"14px",color:C.rose,marginBottom:"6px",fontWeight:600}}>📸 Memory Photo</label>
        <input type="file" accept="image/*" onChange={handleMemPhoto} style={{fontSize:"13px",color:C.textSoft}}/>
        {uploadMsg&&<p style={{fontSize:"12px",color:C.rose,marginTop:"4px",fontFamily:"'Fredoka',cursive"}}>{uploadMsg}</p>}
        {memForm.photo&&<img src={memForm.photo} alt="" style={{width:"100%",height:"100px",objectFit:"cover",borderRadius:"12px",marginTop:"8px"}}/>}
      </div>
      <Btn onClick={addMemory} variant="soft" style={{width:"100%",marginBottom:"12px"}} disabled={!memForm.title}>+ Add Memory</Btn>
      {data.memories.length>0&&(
        <div style={{marginBottom:"16px"}}>
          {data.memories.map((m,i)=>(
            <div key={m.id} style={{background:"rgba(255,182,193,.2)",borderRadius:"14px",padding:"10px 14px",marginBottom:"8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Fredoka',cursive",color:C.rose,fontSize:"15px"}}>{m.title}</div>
                {m.date&&<div style={{fontSize:"12px",color:C.textLight}}>{m.date}</div>}
              </div>
              <button onClick={()=>setData(d=>({...d,memories:d.memories.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",cursor:"pointer",fontSize:"18px",color:C.rose}}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:"10px"}}>
        <Btn onClick={()=>setStep(1)} variant="ghost" style={{flex:1}}>← Back</Btn>
        <Btn onClick={()=>setStep(3)} style={{flex:2}}>Next: Add Photos ➜</Btn>
      </div>
    </motion.div>,

    // Step 3: Photos
    <motion.div key="s3" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
      <div style={{textAlign:"center",marginBottom:"20px"}}>
        <div style={{fontSize:"40px"}}>📸</div>
        <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"22px",color:C.rose,marginBottom:"4px"}}>Photo Story</h2>
        <p style={{color:C.textSoft,fontSize:"13px"}}>Upload your best photos together (optional)</p>
      </div>
      <div style={{
        border:"2px dashed #FFB6C1",borderRadius:"20px",padding:"24px",
        textAlign:"center",marginBottom:"16px",cursor:"pointer",
        background:"rgba(255,182,193,.1)",
      }} onClick={()=>document.getElementById("photoUpload").click()}>
        <div style={{fontSize:"36px",marginBottom:"8px"}}>🖼️</div>
        <p style={{fontFamily:"'Fredoka',cursive",color:C.rose,fontSize:"16px"}}>Tap to upload photos</p>
        <p style={{color:C.textLight,fontSize:"13px"}}>Multiple photos supported</p>
        <input id="photoUpload" type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{display:"none"}}/>
      </div>
      {photoFiles.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"16px"}}>
          {photoFiles.map((src,i)=>(
            <div key={i} style={{position:"relative"}}>
              <img src={src} alt="" style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:"12px"}}/>
              <button onClick={()=>setPhotoFiles(p=>p.filter((_,j)=>j!==i))}
                style={{position:"absolute",top:4,right:4,background:"#FF6B8A",border:"none",borderRadius:"50%",width:"20px",height:"20px",cursor:"pointer",color:"#fff",fontSize:"12px",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:"10px"}}>
        <Btn onClick={()=>setStep(2)} variant="ghost" style={{flex:1}}>← Back</Btn>
        <Btn onClick={finish} style={{flex:2}} variant="gold" disabled={uploading}>🎁 Generate Surprise Link!</Btn>
      </div>
      {uploadMsg&&(
        <div style={{marginTop:"12px",padding:"10px 16px",background:"rgba(255,182,193,.3)",borderRadius:"14px",
          fontFamily:"'Fredoka',cursive",fontSize:"14px",color:C.rose,textAlign:"center"}}>
          {uploadMsg}
        </div>
      )}
    </motion.div>,
  ];

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"40px",paddingBottom:"60px",padding:"40px 12px 60px"}}>
      <GlassCard style={{padding:"28px 22px"}}>
        {/* Progress dots */}
        <div style={{display:"flex",justifyContent:"center",gap:"8px",marginBottom:"24px"}}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{
              width:step===i?"28px":"10px",height:"10px",borderRadius:"50px",
              background:step>=i?C.rose:"rgba(255,182,193,.4)",
              transition:"all .3s",
            }}/>
          ))}
        </div>
        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      </GlassCard>
    </div>
  );
}

/* ─── SCREEN 1: Gift Box Intro ─────────────────────────────────────────── */
function GiftBoxScreen({friendName,onOpen}){
  const [clicked,setClicked]=useState(false);
  const [burst,setBurst]=useState(false);

  const handleClick=()=>{
    if(clicked)return;
    setClicked(true);
    setBurst(true);
    setTimeout(()=>setBurst(false),1200);
    setTimeout(onOpen,1800);
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",textAlign:"center",padding:"24px"}}>
      <ParticleBurst active={burst}/>
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.8,ease:"easeOut"}}>
        <p style={{fontFamily:"'Caveat',cursive",fontSize:"22px",color:C.textSoft,marginBottom:"8px"}}>
          Hey {friendName} 👋
        </p>
        <h1 style={{fontFamily:"'Pacifico',cursive",fontSize:"32px",color:C.rose,marginBottom:"8px",lineHeight:1.3}}>
          A Special Surprise<br/>Is Waiting For You
        </h1>
        <p style={{color:C.textSoft,fontSize:"14px",marginBottom:"40px"}}>Your bestie made something just for you 🥺</p>

        {/* Gift Box */}
        <motion.div
          onClick={handleClick}
          whileHover={{scale:1.05,y:-8}}
          whileTap={{scale:.95}}
          style={{cursor:clicked?"default":"pointer",display:"inline-block",marginBottom:"32px"}}
          animate={clicked?{scale:[1,1.3,0.8,1.2,1],rotate:[0,5,-5,3,0]}:{}}
          transition={clicked?{duration:.6,times:[0,.2,.4,.6,1]}:{}}
        >
          {/* Box body */}
          <div style={{position:"relative",width:"160px",height:"160px",margin:"0 auto"}}>
            {/* Lid */}
            <motion.div
              animate={clicked?{rotateX:-140,y:-20}:{rotateX:0}}
              transition={{duration:.6,delay:.1}}
              style={{
                position:"absolute",top:"-24px",left:"-8px",right:"-8px",height:"40px",
                background:"linear-gradient(135deg,#FF6B8A,#FF4070)",borderRadius:"10px 10px 0 0",
                transformOrigin:"bottom center",zIndex:2,
                boxShadow:"0 -4px 16px rgba(255,64,112,.3)",
              }}>
              {/* Ribbon on lid */}
              <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"20px",height:"100%",background:"rgba(255,255,255,.4)",borderRadius:"4px"}}/>
              <div style={{position:"absolute",top:"50%",left:0,right:0,height:"20px",transform:"translateY(-50%)",background:"rgba(255,255,255,.4)",borderRadius:"4px"}}/>
              {/* Bow */}
              <div style={{position:"absolute",top:"-16px",left:"50%",transform:"translateX(-50%)",fontSize:"24px"}}>🎀</div>
            </motion.div>
            {/* Box */}
            <div style={{
              position:"absolute",top:"16px",left:0,right:0,bottom:0,
              background:"linear-gradient(135deg,#FF85A1,#FF6B8A)",borderRadius:"0 0 16px 16px",
              boxShadow:"0 12px 40px rgba(255,107,138,.5)",
            }}>
              {/* Box ribbon vertical */}
              <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"16px",height:"100%",background:"rgba(255,255,255,.35)",borderRadius:"4px"}}/>
              <div style={{position:"absolute",top:"50%",left:0,right:0,height:"16px",transform:"translateY(-50%)",background:"rgba(255,255,255,.35)",borderRadius:"4px"}}/>
              {/* Sparkle inside */}
              {clicked&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"40px",animation:"bounce2 .5s ease"}}>✨</div>}
            </div>
          </div>
        </motion.div>

        {!clicked&&(
          <motion.div animate={{y:[0,-6,0]}} transition={{duration:1.5,repeat:Infinity}}>
            <p style={{fontFamily:"'Fredoka',cursive",color:C.rose,fontSize:"18px",marginBottom:"8px"}}>Tap the gift box to open 🎁</p>
            <p style={{color:C.textLight,fontSize:"13px"}}>Something magical is inside...</p>
          </motion.div>
        )}
        {clicked&&(
          <motion.p initial={{opacity:0}} animate={{opacity:1}} style={{fontFamily:"'Caveat',cursive",fontSize:"24px",color:C.rose}}>
            Opening your surprise... 🌸
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

/* ─── SCREEN 2: Funny Gate (Nope button runs) ───────────────────────────── */
function FunnyGate({friendName,onYes}){
  const [noPos,setNoPos]=useState(null);
  const [clicks,setClicks]=useState(0);
  const msgs=["Nahh run run! 🏃","You'll NEVER click me 🤣","Scared? 😂","Come on bestieeee 😭","Stop chasing!! 😝","Ugh FINE..."];

  const moveNo=()=>{
    const x=Math.random()*(window.innerWidth-140);
    const y=Math.random()*(window.innerHeight-80);
    setNoPos({x,y});setClicks(c=>c+1);
  };

  return(
    <>
      {/* Flying Nope */}
      <motion.button
        onHoverStart={moveNo} onClick={moveNo}
        animate={noPos?{x:noPos.x,y:noPos.y}:{x:"60%",y:"75%"}}
        transition={{type:"spring",stiffness:200,damping:18}}
        style={{
          position:"fixed",zIndex:500,border:"none",borderRadius:"50px",
          background:"linear-gradient(135deg,#FFF4A3,#FFD966)",
          color:"#8B4513",padding:"12px 26px",
          fontFamily:"'Fredoka',cursive",fontSize:"16px",fontWeight:700,
          cursor:"pointer",boxShadow:"0 4px 16px rgba(255,210,0,.35)",
        }}
      >
        {clicks>0?msgs[Math.min(clicks-1,msgs.length-1)]:"Nope 🙄"}
      </motion.button>

      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
        <GlassCard glow>
          <div style={{textAlign:"center"}}>
            <motion.div animate={{rotate:[0,10,-10,10,0]}} transition={{duration:1.5,repeat:Infinity,repeatDelay:2}} style={{fontSize:"56px",marginBottom:"12px"}}>🥹</motion.div>
            <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"24px",color:C.rose,marginBottom:"8px"}}>Wait wait wait...</h2>
            <p style={{fontFamily:"'Fredoka',cursive",fontSize:"18px",color:C.text,marginBottom:"6px"}}>
              {friendName}, someone made this<br/>especially for YOU 🌸
            </p>
            <p style={{color:C.textSoft,fontSize:"14px",marginBottom:"28px"}}>Do you REALLY want to see<br/>what they made? 👀</p>
            <Btn onClick={onYes} style={{width:"100%",justifyContent:"center",fontSize:"18px"}}>
              ofcc!! Show me 🐾
            </Btn>
          </div>
        </GlassCard>
      </div>
    </>
  );
}

/* ─── SCREEN 3: Photo Story Mode ────────────────────────────────────────── */
function PhotoStory({photos,friendName,onDone}){
  const [idx,setIdx]=useState(0);
  const [prog,setProg]=useState(0);
  const timerRef=useRef(null);
  const DURATION=4000;

  useEffect(()=>{
    setProg(0);
    const start=Date.now();
    timerRef.current=setInterval(()=>{
      const elapsed=Date.now()-start;
      const p=Math.min((elapsed/DURATION)*100,100);
      setProg(p);
      if(p>=100){
        clearInterval(timerRef.current);
        setIdx(i=>{
          if(i<photos.length-1)return i+1;
          onDone();return i;
        });
      }
    },50);
    return()=>clearInterval(timerRef.current);
  },[idx,photos.length]);

  const goNext=()=>{clearInterval(timerRef.current);if(idx<photos.length-1)setIdx(idx+1);else onDone();};
  const goPrev=()=>{clearInterval(timerRef.current);if(idx>0)setIdx(idx-1);};

  if(!photos||photos.length===0){onDone();return null;}

  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"#000"}}>
      {/* Progress bars */}
      <div style={{position:"absolute",top:"12px",left:"12px",right:"12px",display:"flex",gap:"4px",zIndex:10}}>
        {photos.map((_,i)=>(
          <div key={i} style={{flex:1,height:"3px",background:"rgba(255,255,255,.3)",borderRadius:"3px",overflow:"hidden"}}>
            <div style={{
              height:"100%",borderRadius:"3px",
              background:"#fff",
              width:i<idx?"100%":i===idx?`${prog}%`:"0%",
              transition:i===idx?"width .05s linear":"none",
            }}/>
          </div>
        ))}
      </div>

      {/* Photo with Ken Burns */}
      <AnimatePresence mode="wait">
        <motion.img
          key={idx} src={photos[idx]} alt=""
          initial={{opacity:0,scale:1.05}} animate={{opacity:1,scale:1.12}}
          exit={{opacity:0}} transition={{duration:.6,ease:"easeOut"}}
          style={{width:"100%",height:"100%",objectFit:"cover",animation:"kenburns 5s ease-out forwards"}}
        />
      </AnimatePresence>

      {/* Overlay gradient */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,.3) 0%,transparent 30%,transparent 60%,rgba(0,0,0,.5) 100%)"}}/>

      {/* Name overlay */}
      <div style={{position:"absolute",bottom:"40px",left:"24px",right:"24px",textAlign:"center"}}>
        <p style={{fontFamily:"'Caveat',cursive",fontSize:"28px",color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.5)"}}>
          {friendName} 💖
        </p>
        <p style={{color:"rgba(255,255,255,.7)",fontSize:"13px"}}>Photo {idx+1} of {photos.length}</p>
      </div>

      {/* Tap areas */}
      <div style={{position:"absolute",inset:0,display:"flex"}}>
        <div style={{flex:1,cursor:"pointer"}} onClick={goPrev}/>
        <div style={{flex:1,cursor:"pointer"}} onClick={goNext}/>
      </div>

      {/* Floating particles */}
      {["💖","✨","🌸"].map((e,i)=>(
        <div key={i} style={{
          position:"absolute",fontSize:"20px",
          left:`${20+i*30}%`,bottom:"120px",
          animation:`floatY ${3+i}s ${i*0.8}s ease-in-out infinite`,
          pointerEvents:"none",
        }}>{e}</div>
      ))}
    </div>
  );
}

/* ─── SCREEN 4: Flowers gift ────────────────────────────────────────────── */
function FlowersScreen({friendName,onNext}){
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <GlassCard>
        <div style={{textAlign:"center"}}>
          <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:200,delay:.2}}>
            <div style={{fontSize:"72px",animation:"floatY 2.5s ease-in-out infinite"}}>💐</div>
          </motion.div>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.4}}>
            <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"26px",color:C.rose,margin:"16px 0 8px"}}>
              First... flowers for you!! 🌿
            </h2>
            <p style={{fontFamily:"'Caveat',cursive",fontSize:"22px",color:C.textSoft,fontStyle:"italic",margin:"0 0 24px"}}>
              Roses, pinks & sunshine — all for you, {friendName} 🌸
            </p>
            <div style={{fontSize:"32px",marginBottom:"24px"}}>💝 🌸 💝 🌺 💝</div>
            <Btn onClick={onNext} style={{width:"100%",justifyContent:"center"}}>See more 🎁</Btn>
          </motion.div>
        </div>
      </GlassCard>
    </div>
  );
}

/* ─── SCREEN 5: Memory Timeline ─────────────────────────────────────────── */
function MemoryTimeline({memories,onNext}){
  if(!memories||memories.length===0){onNext();return null;}
  return(
    <div style={{minHeight:"100vh",padding:"40px 16px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} style={{textAlign:"center",marginBottom:"32px"}}>
        <div style={{fontSize:"44px",marginBottom:"8px"}}>🗓️</div>
        <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"28px",color:C.rose}}>Our Journey ❤️</h2>
        <p style={{color:C.textSoft,fontSize:"14px"}}>Every memory we made together...</p>
      </motion.div>

      <div style={{width:"100%",maxWidth:"420px",position:"relative"}}>
        {/* Timeline line */}
        <div style={{position:"absolute",left:"32px",top:0,bottom:0,width:"2px",background:"linear-gradient(to bottom,#FFB6C1,#FF6B8A,#FFB6C1)"}}/>

        {memories.map((m,i)=>(
          <motion.div
            key={m.id||i}
            initial={{opacity:0,x:-40}}
            animate={{opacity:1,x:0}}
            transition={{delay:i*0.15,type:"spring",stiffness:120}}
            style={{display:"flex",gap:"16px",marginBottom:"24px",paddingLeft:"16px"}}
          >
            {/* Dot */}
            <div style={{
              width:"32px",height:"32px",borderRadius:"50%",flexShrink:0,
              background:"linear-gradient(135deg,#FF85A1,#FF6B8A)",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 4px 12px rgba(255,107,138,.4)",zIndex:1,
              fontSize:"14px",
            }}>💖</div>

            {/* Card */}
            <div style={{
              flex:1,background:"rgba(255,255,255,.75)",backdropFilter:"blur(12px)",
              borderRadius:"20px",padding:"16px",
              border:"1.5px solid rgba(255,182,193,.4)",
              boxShadow:"0 4px 20px rgba(255,107,138,.1)",
            }}>
              <div style={{fontFamily:"'Fredoka',cursive",fontSize:"17px",color:C.rose,marginBottom:"4px"}}>{m.title}</div>
              {m.date&&<div style={{fontFamily:"'Caveat',cursive",fontSize:"14px",color:C.textLight,marginBottom:"8px"}}>📅 {m.date}</div>}
              {m.desc&&<p style={{color:C.textSoft,fontSize:"14px",lineHeight:1.6,marginBottom:m.photo?"10px":0}}>{m.desc}</p>}
              {m.photo&&<img src={m.photo} alt="" style={{width:"100%",height:"140px",objectFit:"cover",borderRadius:"12px"}}/>}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:memories.length*0.15+.3}}>
        <Btn onClick={onNext} style={{marginTop:"16px",padding:"16px 40px"}}>Continue 💌</Btn>
      </motion.div>
    </div>
  );
}

/* ─── SCREEN 6: Envelope Letter Reveal ─────────────────────────────────── */
function EnvelopeLetter({secretMsg,friendName,personalMsg,favoriteQuote,futurePromise,onNext}){
  const [phase,setPhase]=useState(0); // 0=closed,1=opening,2=letter,3=typing
  const [typed,setTyped]=useState("");
  const fullMsg=secretMsg||personalMsg||`${friendName}, you're the most irreplaceable person in my life. Thank you for every laugh, every late night talk, and every moment we've shared. I genuinely don't know what I'd do without you. 💖`;

  useEffect(()=>{if(phase===3){let i=0;const t=setInterval(()=>{setTyped(fullMsg.slice(0,i+1));i++;if(i>=fullMsg.length)clearInterval(t);},35);return()=>clearInterval(t);}},[ phase]);

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:"24px"}}>
      {/* Envelope */}
      <AnimatePresence>
        {phase===0&&(
          <motion.div key="env" initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-20,opacity:0}} style={{textAlign:"center"}}>
            <motion.div animate={{y:[0,-8,0]}} transition={{duration:1.8,repeat:Infinity}}>
              <div style={{fontSize:"100px",cursor:"pointer"}} onClick={()=>setPhase(1)}>💌</div>
            </motion.div>
            <p style={{fontFamily:"'Caveat',cursive",fontSize:"22px",color:C.rose,marginTop:"12px"}}>There's a letter for you...</p>
            <p style={{color:C.textSoft,fontSize:"14px",marginBottom:"20px"}}>Tap the envelope to open</p>
          </motion.div>
        )}

        {phase===1&&(
          <motion.div key="opening" initial={{scale:1}} animate={{scale:[1,1.2,0.9,1.1,1],rotate:[0,5,-5,3,0]}}
            transition={{duration:.8,onComplete:()=>setPhase(2)}} style={{fontSize:"100px"}}>
            📬
          </motion.div>
        )}

        {(phase===2||phase===3)&&(
          <motion.div key="letter" initial={{opacity:0,y:30,scale:.9}} animate={{opacity:1,y:0,scale:1}}
            transition={{duration:.6}} onAnimationComplete={()=>{if(phase===2)setPhase(3);}}>
            <GlassCard style={{maxWidth:"400px",background:"rgba(255,248,240,.92)"}}>
              {/* Letter paper styling */}
              <div style={{
                backgroundImage:"repeating-linear-gradient(transparent,transparent 27px,rgba(255,182,193,.3) 27px,rgba(255,182,193,.3) 28px)",
                padding:"8px 4px",
              }}>
                <p style={{fontFamily:"'Caveat',cursive",fontSize:"18px",color:C.rose,marginBottom:"12px"}}>
                  Dear {friendName}, 🌸
                </p>
                <p style={{fontFamily:"'Caveat',cursive",fontSize:"17px",color:C.text,lineHeight:1.9,minHeight:"120px"}}>
                  {typed}
                  {phase===3&&typed.length<fullMsg.length&&<span style={{animation:"blink .7s step-end infinite"}}>|</span>}
                </p>
                {favoriteQuote&&typed.length>=fullMsg.length&&(
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}} style={{
                    marginTop:"16px",padding:"12px",borderLeft:"3px solid #FF85A1",
                    background:"rgba(255,182,193,.15)",borderRadius:"0 12px 12px 0",
                  }}>
                    <p style={{fontFamily:"'Caveat',cursive",fontSize:"16px",color:C.textSoft,fontStyle:"italic"}}>"{favoriteQuote}"</p>
                  </motion.div>
                )}
                {futurePromise&&typed.length>=fullMsg.length&&(
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}}>
                    <p style={{fontFamily:"'Caveat',cursive",fontSize:"16px",color:C.rose,marginTop:"12px"}}>📌 Promise: {futurePromise}</p>
                  </motion.div>
                )}
                {typed.length>=fullMsg.length&&(
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}}>
                    <p style={{fontFamily:"'Caveat',cursive",fontSize:"18px",color:C.rose,marginTop:"16px",textAlign:"right"}}>
                      With all my love 💖<br/>— Your Bestie
                    </p>
                  </motion.div>
                )}
              </div>
              {typed.length>=fullMsg.length&&(
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2}} style={{textAlign:"center",marginTop:"20px"}}>
                  <Btn onClick={onNext} style={{width:"100%",justifyContent:"center"}}>Continue 💝</Btn>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── SCREEN 7: Friendship Meter ────────────────────────────────────────── */
function FriendshipMeter({friendName,onDone}){
  const [pct,setPct]=useState(0);
  const [done,setDone]=useState(false);
  const labels=["Analyzing bond..","Measuring loyalty..","Counting laughs..","Calculating love..","Computing memories..","Almost done!! 💝"];
  const [li,setLi]=useState(0);

  useEffect(()=>{
    const t=setInterval(()=>setPct(p=>{if(p>=100){clearInterval(t);setTimeout(()=>setDone(true),600);return 100;}return Math.min(p+1,100);}),35);
    return()=>clearInterval(t);
  },[]);
  useEffect(()=>{const t=setInterval(()=>setLi(i=>(i+1)%labels.length),600);return()=>clearInterval(t);},[]);

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <GlassCard glow>
        <div style={{textAlign:"center"}}>
          {!done?(
            <>
              <motion.div animate={{scale:[1,1.2,1]}} transition={{duration:1,repeat:Infinity}} style={{fontSize:"56px",marginBottom:"12px"}}>🤍</motion.div>
              <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"22px",color:C.rose,marginBottom:"8px"}}>Analyzing Friendship...</h2>
              <p style={{color:C.textSoft,fontSize:"14px",marginBottom:"20px",minHeight:"22px"}}>{labels[li]}</p>
              <div style={{background:"rgba(255,182,193,.2)",borderRadius:"50px",height:"20px",overflow:"hidden",marginBottom:"8px",boxShadow:"inset 0 2px 8px rgba(255,107,138,.1)"}}>
                <motion.div animate={{width:`${pct}%`}} transition={{ease:"easeOut"}} style={{
                  height:"100%",borderRadius:"50px",
                  background:"linear-gradient(90deg,#FF85A1,#FF6B8A,#FF4070)",
                  boxShadow:"0 2px 8px rgba(255,64,112,.4)",
                }}/>
              </div>
              <p style={{fontFamily:"'Pacifico',cursive",fontSize:"28px",color:C.rose}}>{pct}%</p>
            </>
          ):(
            <motion.div initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} transition={{type:"spring",stiffness:200}}>
              <div style={{fontSize:"64px",marginBottom:"16px",animation:"heartbeat 1s ease-in-out infinite"}}>❤️</div>
              <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"24px",color:C.rose,marginBottom:"8px"}}>You Are Irreplaceable ❤️</h2>
              <p style={{fontFamily:"'Fredoka',cursive",fontSize:"20px",color:C.text,marginBottom:"6px"}}>
                {friendName}, your friendship scored
              </p>
              <div style={{
                display:"inline-block",padding:"8px 24px",borderRadius:"50px",
                background:"linear-gradient(135deg,#FF6B8A,#FF4070)",
                fontFamily:"'Pacifico',cursive",fontSize:"36px",color:"#fff",
                boxShadow:"0 8px 24px rgba(255,64,112,.4)",marginBottom:"20px",
              }}>100% 💯</div>
              <p style={{color:C.textSoft,fontSize:"14px",marginBottom:"24px"}}>The highest score possible 🌟</p>
              <Btn onClick={onDone} style={{width:"100%",justifyContent:"center",fontSize:"18px"}}>See the Final Surprise 🎊</Btn>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

/* ─── SCREEN 8: Celebration + Certificate ──────────────────────────────── */
function CelebrationScreen({data}){
  const today=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  const name=data.friendName;
  const nick=data.nickname;
  const shareUrl=typeof window!=="undefined"?window.location.href:"";

  const copyLink=()=>{
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied! Send it to your bestie 💖");
  };
  const shareWA=()=>window.open(`https://wa.me/?text=${encodeURIComponent(`💖 Someone made this especially for you! Open now: ${shareUrl}`)}`,"_blank");
  const shareTG=()=>window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("💖 You have a special surprise waiting!")}`,"_blank");

  return(
    <div style={{minHeight:"100vh",padding:"40px 16px 60px",display:"flex",flexDirection:"column",alignItems:"center",gap:"24px"}}>
      {/* Final message card */}
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.7}} style={{width:"100%",maxWidth:"420px"}}>
        <GlassCard glow>
          <div style={{textAlign:"center"}}>
            <motion.div animate={{scale:[1,1.15,1]}} transition={{duration:1.5,repeat:Infinity}}>
              <div style={{fontSize:"52px",marginBottom:"8px"}}>🎊</div>
            </motion.div>
            <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"26px",color:C.rose,marginBottom:"6px"}}>
              Happy Best Friends Day!
            </h2>
            <p style={{fontFamily:"'Fredoka',cursive",fontSize:"20px",color:C.text,marginBottom:"4px"}}>
              {nick?`${nick} aka `:""}{name} 💖
            </p>
            <p style={{color:C.textSoft,fontSize:"14px",lineHeight:1.7,marginBottom:"16px"}}>
              You are kind, funny, irreplaceable and the best part of someone's world. Thank you for existing. 🌸
            </p>
            <div style={{fontSize:"28px"}}>💖 🌸 ✨ 🌸 💖</div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Certificate */}
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:.3,duration:.7}} style={{width:"100%",maxWidth:"420px"}}>
        <div style={{
          background:"linear-gradient(135deg,rgba(255,248,240,.97),rgba(255,240,247,.97))",
          backdropFilter:"blur(20px)",borderRadius:"28px",padding:"28px 22px",
          border:"3px solid #FF6B8A",
          boxShadow:"0 12px 40px rgba(255,107,138,.25),0 0 0 6px rgba(255,182,193,.2)",
          textAlign:"center",position:"relative",overflow:"hidden",
        }}>
          {/* Corner decorations */}
          {["top-left","top-right","bottom-left","bottom-right"].map((pos,i)=>(
            <div key={pos} style={{
              position:"absolute",
              top:pos.includes("top")?"12px":"auto",
              bottom:pos.includes("bottom")?"12px":"auto",
              left:pos.includes("left")?"12px":"auto",
              right:pos.includes("right")?"12px":"auto",
              fontSize:"24px",
            }}>{["🌸","⭐","💝","🌺"][i]}</div>
          ))}

          <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"4px",color:C.textLight,textTransform:"uppercase",marginBottom:"4px"}}>BEST</p>
          <p style={{fontFamily:"'Pacifico',cursive",fontSize:"32px",color:C.rose,marginBottom:"8px"}}>Bestfriend</p>
          <div style={{height:"1.5px",background:"linear-gradient(90deg,transparent,#FF85A1,transparent)",margin:"8px 0 16px"}}/>
          <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"3px",color:C.textLight,textTransform:"uppercase",marginBottom:"8px"}}>THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
          <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"36px",color:C.rose,marginBottom:"4px"}}>{name}</h2>
          {nick&&<p style={{fontFamily:"'Caveat',cursive",fontSize:"20px",color:C.textSoft,marginBottom:"16px"}}>aka "{nick}"</p>}
          <div style={{height:"1px",background:"rgba(255,182,193,.4)",margin:"0 0 16px"}}/>
          <p style={{fontFamily:"'Caveat',cursive",color:C.textSoft,fontSize:"17px",lineHeight:1.9,marginBottom:"16px",fontStyle:"italic"}}>
            For being more than just a friend — for being my partner in crime, my 3AM caller, my secret keeper, my happiness and the one who knows me better than anyone.
          </p>
          <p style={{fontFamily:"'Caveat',cursive",color:C.textSoft,fontSize:"16px",fontStyle:"italic",marginBottom:"20px"}}>
            Thank you for being the best part of my life!
          </p>
          {data.bestMemoryDate&&(
            <p style={{fontFamily:"'Caveat',cursive",fontSize:"15px",color:C.rose,marginBottom:"16px"}}>
              💫 Since {data.bestMemoryDate}
            </p>
          )}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"12px"}}>
            <div>
              <div style={{fontFamily:"'Caveat',cursive",fontSize:"18px",color:C.rose}}>Your Bestie ♥</div>
              <div style={{height:"1px",background:"#ddd",margin:"4px 0"}}/>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",color:C.textLight,letterSpacing:"1px",textTransform:"uppercase"}}>Signature</div>
            </div>
            <div style={{
              width:"68px",height:"68px",borderRadius:"50%",
              background:"linear-gradient(135deg,#FF6B8A,#FF4070)",
              display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",
              color:"#fff",fontFamily:"'Fredoka',cursive",fontSize:"10px",fontWeight:700,lineHeight:1.3,
              boxShadow:"0 4px 16px rgba(255,64,112,.4)",
            }}>BEST<br/>FRIEND<br/>EVER</div>
            <div>
              <div style={{fontFamily:"'Fredoka',cursive",fontSize:"14px",color:C.rose}}>{today}</div>
              <div style={{height:"1px",background:"#ddd",margin:"4px 0"}}/>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",color:C.textLight,letterSpacing:"1px",textTransform:"uppercase"}}>Date</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share section */}
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:.6}} style={{width:"100%",maxWidth:"420px"}}>
        <GlassCard>
          <div style={{textAlign:"center"}}>
            <p style={{fontFamily:"'Pacifico',cursive",fontSize:"20px",color:C.rose,marginBottom:"4px"}}>Now prank your friends 😈</p>
            <p style={{color:C.textSoft,fontSize:"13px",marginBottom:"18px"}}>Share & start the viral loop! 💫</p>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {[
                {icon:"💚",label:"Share on WhatsApp",color:"#25D366",fn:shareWA},
                {icon:"✈️",label:"Share on Telegram",color:"#229ED9",fn:shareTG},
                {icon:"🔗",label:"Copy Link",color:C.rose,fn:copyLink},
              ].map((b,i)=>(
                <motion.button key={i} whileHover={{scale:1.03}} whileTap={{scale:.97}} onClick={b.fn} style={{
                  background:b.color,color:"#fff",border:"none",borderRadius:"50px",
                  padding:"14px",fontFamily:"'Fredoka',cursive",fontSize:"16px",fontWeight:600,
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                  boxShadow:`0 4px 16px ${b.color}44`,
                }}>{b.icon} {b.label}</motion.button>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Footer */}
      <p style={{fontFamily:"'Caveat',cursive",fontSize:"14px",color:"rgba(180,120,140,.6)",textAlign:"center",paddingBottom:"8px"}}>
        Made by Aadarsh ❤️‍🩹
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  ROOT APP                                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function App(){
  // Screens: creator|gift|gate|photos|flowers|timeline|envelope|meter|celebrate
  const [screen,setScreen]=useState("creator");
  const [creatorData,setCreatorData]=useState(null);
  const [showConf,setShowConf]=useState(false);
  const [showHearts,setShowHearts]=useState(false);
  const [burst,setBurst]=useState(false);

  const go=useCallback((s)=>{
    if(s==="celebrate"){setShowConf(true);setShowHearts(true);setBurst(true);setTimeout(()=>setBurst(false),1200);}
    setScreen(s);
  },[]);

  const handleCreatorDone=useCallback((data)=>{
    setCreatorData(data);
    go("gift");
  },[go]);

  const skipIfEmpty=(condition,nextScreen)=>condition?go(nextScreen):undefined;

  const screens={
    creator:<CreatorMode onDone={handleCreatorDone}/>,
    gift:<GiftBoxScreen friendName={creatorData?.friendName||"Bestie"} onOpen={()=>go("gate")}/>,
    gate:<FunnyGate friendName={creatorData?.friendName||"Bestie"} onYes={()=>{
      if(creatorData?.photos?.length>0)go("photos");
      else go("flowers");
    }}/>,
    photos:<PhotoStory photos={creatorData?.photos||[]} friendName={creatorData?.friendName||"Bestie"} onDone={()=>go("flowers")}/>,
    flowers:<FlowersScreen friendName={creatorData?.friendName||"Bestie"} onNext={()=>{
      if(creatorData?.memories?.length>0)go("timeline");
      else go("envelope");
    }}/>,
    timeline:<MemoryTimeline memories={creatorData?.memories||[]} onNext={()=>go("envelope")}/>,
    envelope:<EnvelopeLetter
      secretMsg={creatorData?.secretMsg} personalMsg={creatorData?.personalMsg}
      friendName={creatorData?.friendName||"Bestie"}
      favoriteQuote={creatorData?.favoriteQuote} futurePromise={creatorData?.futurePromise}
      onNext={()=>go("meter")}
    />,
    meter:<FriendshipMeter friendName={creatorData?.friendName||"Bestie"} onDone={()=>go("celebrate")}/>,
    celebrate:<CelebrationScreen data={creatorData||{friendName:"Bestie"}}/>,
  };

  return(
    <>
      {FONTS}
      <PremiumBG/>
      <ConfettiCanvas active={showConf}/>
      <HeartRain active={showHearts}/>
      <ParticleBurst active={burst}/>

      <AnimatePresence mode="wait">
        <motion.div key={screen} initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-24}} transition={{duration:.45,ease:"easeInOut"}}>
          {screens[screen]}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
