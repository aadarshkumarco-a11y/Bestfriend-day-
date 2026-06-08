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
    @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Fredoka:wght@400;600;700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Caveat:wght@400;600;700&family=Dancing+Script:wght@600;700&display=swap');
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
  const [voiceUrl,setVoiceUrl]=useState("");
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
    const payload={...data,photos:photoFiles,voiceUrl};
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

      {/* Voice Upload */}
      <div style={{marginBottom:"16px",textAlign:"left"}}>
        <label style={{display:"block",fontFamily:"'Fredoka',cursive",fontSize:"14px",color:C.rose,marginBottom:"6px",fontWeight:600}}>🎙️ Voice Message (optional)</label>
        <input type="file" accept="audio/*" onChange={async e=>{
          const f=e.target.files[0];if(!f)return;
          setUploadMsg("Uploading voice... 🎙️");
          try{
            const fd=new FormData();fd.append("file",f);fd.append("upload_preset",UPLOAD_PRESET);fd.append("resource_type","video");
            const res=await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,{method:"POST",body:fd});
            const data=await res.json();
            if(data.secure_url){setVoiceUrl(data.secure_url);setUploadMsg("✅ Voice uploaded!");}
            else setUploadMsg("❌ Voice upload failed.");
          }catch{setUploadMsg("❌ Upload failed.");}
          setTimeout(()=>setUploadMsg(""),3000);
        }} style={{fontSize:"13px",color:C.textSoft,width:"100%"}}/>
        {voiceUrl&&<p style={{fontFamily:"'Fredoka',cursive",fontSize:"13px",color:"#25a244",marginTop:"4px"}}>✅ Voice message ready!</p>}
      </div>
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
  const certRef=useRef(null);
  const [downloading,setDownloading]=useState(false);

  const downloadCert=async()=>{
    if(!certRef.current)return;
    setDownloading(true);
    try{
      // Use html2canvas via CDN script tag approach
      if(!window.html2canvas){
        await new Promise((res,rej)=>{
          const s=document.createElement("script");
          s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          s.onload=res;s.onerror=rej;
          document.head.appendChild(s);
        });
      }
      const canvas=await window.html2canvas(certRef.current,{scale:2,useCORS:true,backgroundColor:"#fff8f0"});
      const link=document.createElement("a");
      link.download=`bestfriend-certificate-${name}.png`;
      link.href=canvas.toDataURL("image/png");
      link.click();
    }catch(e){alert("Download failed. Try screenshot!");}
    setDownloading(false);
  };

  const copyLink=()=>{navigator.clipboard.writeText(shareUrl);alert("Link copied! Send it to your bestie 💖");};
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
        <div ref={certRef} style={{
          background:"linear-gradient(135deg,rgba(255,248,240,.97),rgba(255,240,247,.97))",
          backdropFilter:"blur(20px)",borderRadius:"28px",padding:"28px 22px",
          border:"3px solid #FF6B8A",
          boxShadow:"0 12px 40px rgba(255,107,138,.25),0 0 0 6px rgba(255,182,193,.2)",
          textAlign:"center",position:"relative",overflow:"hidden",
        }}>
          {["top-left","top-right","bottom-left","bottom-right"].map((pos,i)=>(
            <div key={pos} style={{position:"absolute",top:pos.includes("top")?"12px":"auto",bottom:pos.includes("bottom")?"12px":"auto",left:pos.includes("left")?"12px":"auto",right:pos.includes("right")?"12px":"auto",fontSize:"24px"}}>{["🌸","⭐","💝","🌺"][i]}</div>
          ))}
          <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"4px",color:C.textLight,textTransform:"uppercase",marginBottom:"4px"}}>BEST</p>
          <p style={{fontFamily:"'Pacifico',cursive",fontSize:"32px",color:C.rose,marginBottom:"8px"}}>Bestfriend</p>
          <div style={{height:"1.5px",background:"linear-gradient(90deg,transparent,#FF85A1,transparent)",margin:"8px 0 16px"}}/>
          <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"3px",color:C.textLight,textTransform:"uppercase",marginBottom:"8px"}}>THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
          <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"36px",color:C.rose,marginBottom:"4px"}}>{name}</h2>
          {nick&&<p style={{fontFamily:"'Dancing Script',cursive",fontSize:"22px",color:C.textSoft,marginBottom:"16px"}}>aka "{nick}"</p>}
          <div style={{height:"1px",background:"rgba(255,182,193,.4)",margin:"0 0 16px"}}/>
          <p style={{fontFamily:"'Dancing Script',cursive",color:C.textSoft,fontSize:"19px",lineHeight:1.9,marginBottom:"16px",fontStyle:"italic"}}>
            For being more than just a friend — for being my partner in crime, my 3AM caller, my secret keeper, my happiness and the one who knows me better than anyone.
          </p>
          <p style={{fontFamily:"'Dancing Script',cursive",color:C.textSoft,fontSize:"17px",fontStyle:"italic",marginBottom:"20px"}}>
            Thank you for being the best part of my life!
          </p>
          {data.bestMemoryDate&&(
            <p style={{fontFamily:"'Caveat',cursive",fontSize:"15px",color:C.rose,marginBottom:"16px"}}>💫 Since {data.bestMemoryDate}</p>
          )}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"12px"}}>
            <div>
              <div style={{fontFamily:"'Dancing Script',cursive",fontSize:"20px",color:C.rose}}>Your Bestie ♥</div>
              <div style={{height:"1px",background:"#ddd",margin:"4px 0"}}/>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",color:C.textLight,letterSpacing:"1px",textTransform:"uppercase"}}>Signature</div>
            </div>
            <div style={{width:"68px",height:"68px",borderRadius:"50%",background:"linear-gradient(135deg,#FF6B8A,#FF4070)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",color:"#fff",fontFamily:"'Fredoka',cursive",fontSize:"10px",fontWeight:700,lineHeight:1.3,boxShadow:"0 4px 16px rgba(255,64,112,.4)"}}>BEST<br/>FRIEND<br/>EVER</div>
            <div>
              <div style={{fontFamily:"'Fredoka',cursive",fontSize:"14px",color:C.rose}}>{today}</div>
              <div style={{height:"1px",background:"#ddd",margin:"4px 0"}}/>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",color:C.textLight,letterSpacing:"1px",textTransform:"uppercase"}}>Date</div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}} onClick={downloadCert} disabled={downloading}
          style={{
            width:"100%",marginTop:"12px",padding:"13px",borderRadius:"50px",border:"none",
            background:downloading?"#ccc":"linear-gradient(135deg,#FF6B8A,#FF4070)",
            color:"#fff",fontFamily:"'Fredoka',cursive",fontSize:"16px",fontWeight:600,
            cursor:downloading?"not-allowed":"pointer",
            boxShadow:"0 4px 16px rgba(255,64,112,.3)",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
          }}>
          {downloading?"⏳ Generating...":"📥 Download Certificate"}
        </motion.button>
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
/*  V3 NEW SCREENS                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Cinematic Black Intro ──────────────────────────────────────────────── */
function CinematicIntro({onDone}){
  const [phase,setPhase]=useState(0);
  const [lineIdx,setLineIdx]=useState(0);
  const lines=["Someone special","prepared something","just for you..."];
  useEffect(()=>{
    if(phase===0){const t=setTimeout(()=>setPhase(1),900);return()=>clearTimeout(t);}
    if(phase===1){
      if(lineIdx<lines.length-1){const t=setTimeout(()=>setLineIdx(i=>i+1),1200);return()=>clearTimeout(t);}
      else{const t=setTimeout(()=>setPhase(2),1400);return()=>clearTimeout(t);}
    }
  },[phase,lineIdx]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:999,background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",textAlign:"center",padding:"24px"}}>
      {Array.from({length:35},(_,i)=>(
        <div key={i} style={{position:"absolute",left:`${(i*7+3)%99}%`,top:`${(i*11+5)%95}%`,width:`${Math.random()*2+1}px`,height:`${Math.random()*2+1}px`,borderRadius:"50%",background:"#fff",opacity:Math.random()*.5+.15,animation:`heartbeat ${2+i%4}s ${i%3}s ease-in-out infinite`}}/>
      ))}
      <AnimatePresence mode="wait">
        {phase===0&&(<motion.div key="p0" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:1}}><div style={{fontSize:"64px"}}>💌</div></motion.div>)}
        {phase===1&&(
          <motion.div key="p1" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            {lines.slice(0,lineIdx+1).map((l,i)=>(
              <motion.p key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.7}}
                style={{fontFamily:"'Caveat',cursive",fontSize:"30px",color:"rgba(255,255,255,.88)",lineHeight:1.9}}>
                {l}
              </motion.p>
            ))}
          </motion.div>
        )}
        {phase===2&&(
          <motion.div key="p2" initial={{opacity:0,scale:.85}} animate={{opacity:1,scale:1}} transition={{duration:.8,type:"spring"}}>
            <p style={{fontFamily:"'Caveat',cursive",fontSize:"20px",color:"rgba(255,255,255,.55)",marginBottom:"36px"}}>Ready to see it?</p>
            <motion.button whileHover={{scale:1.07}} whileTap={{scale:.95}} onClick={onDone} style={{
              background:"linear-gradient(135deg,#FF6B8A,#FF4070)",border:"none",borderRadius:"50px",
              padding:"18px 44px",fontFamily:"'Pacifico',cursive",fontSize:"20px",color:"#fff",
              cursor:"pointer",boxShadow:"0 8px 32px rgba(255,64,112,.55)",
            }}>🎁 Open Surprise</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Polaroid Memory Wall ───────────────────────────────────────────────── */
function PolaroidWall({photos,onNext}){
  const [sel,setSel]=useState(null);
  if(!photos||photos.length===0){onNext();return null;}
  const rots=[-4,-2,3,-3,2,-5,4,-1,5,-4];
  return(
    <div style={{minHeight:"100vh",padding:"40px 16px 80px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} style={{textAlign:"center",marginBottom:"28px"}}>
        <div style={{fontSize:"40px",marginBottom:"8px"}}>📸</div>
        <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"26px",color:C.rose}}>Memory Wall 🎞️</h2>
        <p style={{color:C.textSoft,fontSize:"14px"}}>Tap any photo to enlarge 💖</p>
      </motion.div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"18px",maxWidth:"420px",width:"100%"}}>
        {photos.map((src,i)=>(
          <motion.div key={i}
            initial={{opacity:0,y:30,rotate:rots[i%rots.length]}} animate={{opacity:1,y:0,rotate:rots[i%rots.length]}}
            whileHover={{scale:1.07,rotate:0,zIndex:10}} whileTap={{scale:.96}}
            transition={{delay:i*.09,type:"spring",stiffness:120}}
            onClick={()=>setSel(src)} style={{cursor:"pointer",position:"relative"}}>
            <div style={{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",width:"38px",height:"14px",background:"rgba(255,240,180,.75)",borderRadius:"2px",zIndex:2}}/>
            <div style={{background:"#fff",padding:"10px 10px 30px",boxShadow:"0 8px 28px rgba(0,0,0,.18)",borderRadius:"3px"}}>
              <img src={src} alt="" style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}/>
              <p style={{fontFamily:"'Caveat',cursive",fontSize:"13px",color:"#aaa",textAlign:"center",marginTop:"6px"}}>bestie 💕</p>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {sel&&(
          <motion.div key="fv" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setSel(null)}
            style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
            <motion.img src={sel} alt="" initial={{scale:.7}} animate={{scale:1}} exit={{scale:.7}}
              style={{maxWidth:"100%",maxHeight:"80vh",objectFit:"contain",borderRadius:"8px",boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}
              onClick={e=>e.stopPropagation()}/>
            <div style={{position:"absolute",top:"20px",right:"24px",fontSize:"32px",cursor:"pointer",color:"#fff"}} onClick={()=>setSel(null)}>×</div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:photos.length*.09+.3}} style={{marginTop:"32px"}}>
        <Btn onClick={onNext} style={{padding:"14px 40px"}}>Continue 💌</Btn>
      </motion.div>
    </div>
  );
}

/* ─── Friendship Quiz ────────────────────────────────────────────────────── */
function FriendshipQuiz({friendName,onNext}){
  const qs=[
    {q:"Who is more annoying? 😂",opts:["Me 😭","My Bestie 😂"]},
    {q:"Who texts first? 📱",opts:["Me always","Them always"]},
    {q:"Who gets angry first? 😤",opts:["Me ngl 😅","Bestie definitely 😂"]},
    {q:"Who laughs first? 😂",opts:["Me every time","We both lose it 😭"]},
    {q:"Who eats more? 🍕",opts:["Me 100%","Bestie no contest 😂"]},
  ];
  const [qi,setQi]=useState(0);
  const [done,setDone]=useState(false);
  const pick=()=>{
    if(qi<qs.length-1){setTimeout(()=>setQi(qi+1),400);}
    else{setTimeout(()=>setDone(true),500);}
  };
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <GlassCard glow>
        {!done?(
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Fredoka',cursive",fontSize:"13px",color:C.textLight,marginBottom:"8px"}}>Question {qi+1}/{qs.length}</div>
            <div style={{background:"rgba(255,182,193,.2)",borderRadius:"50px",height:"6px",marginBottom:"20px",overflow:"hidden"}}>
              <div style={{height:"100%",background:C.rose,borderRadius:"50px",width:`${(qi/qs.length)*100}%`,transition:"width .3s"}}/>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={qi} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
                <div style={{fontSize:"48px",marginBottom:"12px"}}>🤔</div>
                <h2 style={{fontFamily:"'Fredoka',cursive",fontSize:"22px",color:C.rose,marginBottom:"24px"}}>{qs[qi].q}</h2>
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  {qs[qi].opts.map((opt,i)=>(
                    <motion.button key={i} whileHover={{scale:1.04,background:C.rose,color:"#fff"}} whileTap={{scale:.97}}
                      onClick={pick}
                      style={{padding:"14px 20px",borderRadius:"50px",border:"2px solid #FFB6C1",background:"rgba(255,255,255,.7)",fontFamily:"'Fredoka',cursive",fontSize:"16px",color:C.text,cursor:"pointer",transition:"all .2s"}}>
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ):(
          <motion.div initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{type:"spring"}} style={{textAlign:"center"}}>
            <div style={{fontSize:"56px",marginBottom:"12px",animation:"heartbeat 1s ease-in-out infinite"}}>🎉</div>
            <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"22px",color:C.rose,marginBottom:"8px"}}>You two are iconic 😭</h2>
            <p style={{color:C.textSoft,fontSize:"14px",marginBottom:"24px"}}>{friendName}, your bestie knows you SO well 💖</p>
            <Btn onClick={onNext} style={{width:"100%",justifyContent:"center"}}>Continue 💝</Btn>
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}

/* ─── Friendship Wrapped ─────────────────────────────────────────────────── */
function FriendshipWrapped({data,onNext}){
  const years=data.bestMemoryDate?Math.max(1,new Date().getFullYear()-new Date(data.bestMemoryDate).getFullYear()):3;
  const targets={years,memories:Math.max(data.memories?.length||0,5),talks:247,jokes:1829,photos:Math.max(data.photos?.length||0,42),love:100};
  const [counts,setCounts]=useState({years:0,memories:0,talks:0,jokes:0,photos:0,love:0});
  useEffect(()=>{
    const t=setInterval(()=>setCounts(c=>{
      const nd=Object.fromEntries(Object.keys(targets).map(k=>[k,Math.min(c[k]+Math.ceil(targets[k]/55),targets[k])]));
      if(Object.keys(targets).every(k=>nd[k]>=targets[k]))clearInterval(t);
      return nd;
    }),28);return()=>clearInterval(t);
  },[]);
  const stats=[
    {icon:"🗓️",label:"Years Together",k:"years",suffix:"+"},
    {icon:"💭",label:"Memories Made",k:"memories",suffix:"+"},
    {icon:"🌙",label:"Late Night Talks",k:"talks",suffix:"+"},
    {icon:"😂",label:"Inside Jokes",k:"jokes",suffix:"+"},
    {icon:"📸",label:"Photos Together",k:"photos",suffix:"+"},
    {icon:"💖",label:"Love Score",k:"love",suffix:"%"},
  ];
  return(
    <div style={{minHeight:"100vh",padding:"40px 16px 80px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} style={{textAlign:"center",marginBottom:"24px"}}>
        <div style={{fontSize:"40px",marginBottom:"8px"}}>🎵</div>
        <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"26px",color:C.rose}}>Friendship Wrapped</h2>
        <p style={{color:C.textSoft,fontSize:"14px"}}>Your friendship in numbers 💕</p>
      </motion.div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",maxWidth:"420px",width:"100%",marginBottom:"28px"}}>
        {stats.map((s,i)=>(
          <motion.div key={i} initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} transition={{delay:i*.1,type:"spring"}}
            style={{background:"rgba(255,255,255,.75)",backdropFilter:"blur(12px)",borderRadius:"20px",padding:"20px 12px",textAlign:"center",border:"1.5px solid rgba(255,182,193,.4)",boxShadow:"0 4px 20px rgba(255,107,138,.1)"}}>
            <div style={{fontSize:"28px",marginBottom:"6px"}}>{s.icon}</div>
            <div style={{fontFamily:"'Pacifico',cursive",fontSize:"22px",color:C.rose}}>{counts[s.k]}{s.suffix}</div>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:C.textSoft,marginTop:"4px"}}>{s.label}</div>
          </motion.div>
        ))}
      </div>
      <Btn onClick={onNext} style={{padding:"14px 40px"}}>Continue 💌</Btn>
    </div>
  );
}

/* ─── Why You Are Special ────────────────────────────────────────────────── */
function WhySpecial({friendName,onNext}){
  const cards=[
    {icon:"❤️",title:"Your Kindness",desc:"You always know when someone needs warmth — and you give it freely."},
    {icon:"😂",title:"Your Humor",desc:"You can make anyone laugh even on their absolute worst days."},
    {icon:"🤝",title:"Your Loyalty",desc:"You show up, every single time. No conditions, no excuses."},
    {icon:"🌟",title:"Your Support",desc:"You believe in people even when they've stopped believing in themselves."},
    {icon:"💖",title:"Your Presence",desc:"Just having you around makes everything better. Always."},
  ];
  return(
    <div style={{minHeight:"100vh",padding:"40px 16px 80px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} style={{textAlign:"center",marginBottom:"28px"}}>
        <div style={{fontSize:"40px",marginBottom:"8px"}}>🌟</div>
        <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"26px",color:C.rose}}>Why You're Special</h2>
        <p style={{color:C.textSoft,fontSize:"14px"}}>{friendName}, this is all you 💖</p>
      </motion.div>
      <div style={{display:"flex",flexDirection:"column",gap:"14px",maxWidth:"420px",width:"100%",marginBottom:"28px"}}>
        {cards.map((c,i)=>(
          <motion.div key={i} initial={{opacity:0,x:-40}} animate={{opacity:1,x:0}} transition={{delay:i*.12,type:"spring"}}
            style={{background:"rgba(255,255,255,.75)",backdropFilter:"blur(12px)",borderRadius:"20px",padding:"18px 20px",border:"1.5px solid rgba(255,182,193,.4)",boxShadow:"0 4px 20px rgba(255,107,138,.1)",display:"flex",gap:"16px",alignItems:"flex-start"}}>
            <div style={{fontSize:"32px",flexShrink:0}}>{c.icon}</div>
            <div>
              <div style={{fontFamily:"'Fredoka',cursive",fontSize:"18px",color:C.rose,marginBottom:"4px"}}>{c.title}</div>
              <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",color:C.textSoft,lineHeight:1.6}}>{c.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <Btn onClick={onNext} style={{padding:"14px 40px"}}>Continue 💝</Btn>
    </div>
  );
}

/* ─── Voice Player ───────────────────────────────────────────────────────── */
function VoicePlayer({voiceUrl,onNext}){
  const [playing,setPlaying]=useState(false);
  const [progress,setProgress]=useState(0);
  const [dur,setDur]=useState(0);
  const aRef=useRef(null);
  useEffect(()=>{
    if(!voiceUrl)return;
    aRef.current=new Audio(voiceUrl);
    aRef.current.onloadedmetadata=()=>setDur(aRef.current.duration);
    aRef.current.ontimeupdate=()=>{if(aRef.current.duration)setProgress((aRef.current.currentTime/aRef.current.duration)*100);};
    aRef.current.onended=()=>setPlaying(false);
    return()=>aRef.current?.pause();
  },[voiceUrl]);
  const toggle=()=>{if(!aRef.current)return;if(playing){aRef.current.pause();setPlaying(false);}else{aRef.current.play();setPlaying(true);}};
  if(!voiceUrl){onNext();return null;}
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <GlassCard glow>
        <div style={{textAlign:"center"}}>
          <motion.div animate={{scale:playing?[1,1.1,1]:[1]}} transition={{duration:.8,repeat:playing?Infinity:0}}>
            <div style={{fontSize:"60px",marginBottom:"12px"}}>🎙️</div>
          </motion.div>
          <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"22px",color:C.rose,marginBottom:"6px"}}>Voice Message 🥺</h2>
          <p style={{color:C.textSoft,fontSize:"14px",marginBottom:"24px"}}>Your bestie recorded something for you</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"3px",height:"40px",marginBottom:"16px"}}>
            {Array.from({length:24},(_,i)=>(
              <div key={i} style={{width:"4px",borderRadius:"4px",background:i/24*100<progress?C.rose:"rgba(255,182,193,.35)",height:`${14+Math.sin(i)*6}px`,transition:"background .1s"}}/>
            ))}
          </div>
          <div style={{background:"rgba(255,182,193,.3)",borderRadius:"50px",height:"6px",marginBottom:"16px",cursor:"pointer"}}
            onClick={e=>{const r=e.currentTarget.getBoundingClientRect();const p=(e.clientX-r.left)/r.width;if(aRef.current)aRef.current.currentTime=p*aRef.current.duration;}}>
            <div style={{height:"100%",borderRadius:"50px",background:C.rose,width:`${progress}%`,transition:"width .1s"}}/>
          </div>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",color:C.textLight,marginBottom:"20px"}}>
            {Math.floor((progress/100)*dur)}s / {Math.floor(dur)}s
          </div>
          <Btn onClick={toggle} style={{width:"100%",justifyContent:"center",marginBottom:"10px"}}>{playing?"⏸ Pause":"▶️ Play Voice Message"}</Btn>
          <Btn onClick={onNext} variant="ghost" style={{width:"100%",justifyContent:"center"}}>Continue 💌</Btn>
        </div>
      </GlassCard>
    </div>
  );
}

/* ─── Memory Movie (Cinematic Slideshow) ─────────────────────────────────── */
function MemoryMovie({photos,friendName,onNext}){
  const [idx,setIdx]=useState(0);
  const [started,setStarted]=useState(false);
  const SLIDE_DUR=3500;
  const transitions=["fade","zoom","blur"];

  useEffect(()=>{
    if(!started||!photos||photos.length===0)return;
    const t=setTimeout(()=>{
      if(idx<photos.length-1)setIdx(i=>i+1);
      else onNext();
    },SLIDE_DUR);
    return()=>clearTimeout(t);
  },[idx,started,photos]);

  if(!photos||photos.length===0){onNext();return null;}

  if(!started){
    return(
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",textAlign:"center",padding:"24px"}}>
        <GlassCard glow>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"52px",marginBottom:"12px",animation:"heartbeat 1.5s ease-in-out infinite"}}>🎬</div>
            <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"24px",color:C.rose,marginBottom:"8px"}}>Memory Movie</h2>
            <p style={{color:C.textSoft,fontSize:"14px",marginBottom:"8px"}}>A cinematic journey through your memories</p>
            <p style={{fontFamily:"'Dancing Script',cursive",fontSize:"20px",color:C.rose,marginBottom:"24px"}}>starring {friendName} 💖</p>
            <Btn onClick={()=>setStarted(true)} style={{width:"100%",justifyContent:"center"}}>▶️ Play Movie</Btn>
          </div>
        </GlassCard>
      </div>
    );
  }

  return(
    <div style={{position:"fixed",inset:0,zIndex:300,background:"#000",overflow:"hidden"}}>
      {/* Film grain overlay */}
      <div style={{position:"absolute",inset:0,zIndex:5,pointerEvents:"none",opacity:.04,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")"}}/>

      {/* Photo with Ken Burns */}
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{opacity:0,scale:1.08}}
          animate={{opacity:1,scale:1.14}}
          exit={{opacity:0,scale:1}}
          transition={{duration:1,ease:"easeOut"}}
          style={{position:"absolute",inset:0}}>
          <img src={photos[idx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </motion.div>
      </AnimatePresence>

      {/* Dark cinematic overlay */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,.5) 0%,transparent 25%,transparent 65%,rgba(0,0,0,.7) 100%)",zIndex:2}}/>

      {/* Top film strip */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:"40px",background:"rgba(0,0,0,.8)",zIndex:6,display:"flex",alignItems:"center",gap:"8px",padding:"0 16px",overflow:"hidden"}}>
        {Array.from({length:20},(_,i)=>(
          <div key={i} style={{width:"24px",height:"20px",border:"1px solid rgba(255,255,255,.2)",borderRadius:"2px",flexShrink:0,background:i%3===0?"rgba(255,255,255,.08)":"transparent"}}/>
        ))}
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"40px",background:"rgba(0,0,0,.8)",zIndex:6,display:"flex",alignItems:"center",gap:"8px",padding:"0 16px",overflow:"hidden"}}>
        {Array.from({length:20},(_,i)=>(
          <div key={i} style={{width:"24px",height:"20px",border:"1px solid rgba(255,255,255,.2)",borderRadius:"2px",flexShrink:0}}/>
        ))}
      </div>

      {/* Progress dots */}
      <div style={{position:"absolute",top:"50px",left:0,right:0,display:"flex",justifyContent:"center",gap:"6px",zIndex:7}}>
        {photos.map((_,i)=>(
          <div key={i} style={{width:i===idx?"20px":"6px",height:"6px",borderRadius:"6px",background:i<=idx?"#fff":"rgba(255,255,255,.3)",transition:"all .3s"}}/>
        ))}
      </div>

      {/* Caption */}
      <div style={{position:"absolute",bottom:"50px",left:"24px",right:"24px",textAlign:"center",zIndex:7}}>
        <motion.p key={idx} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.5}}
          style={{fontFamily:"'Dancing Script',cursive",fontSize:"28px",color:"#fff",textShadow:"0 2px 12px rgba(0,0,0,.8)",marginBottom:"4px"}}>
          {friendName} 💖
        </motion.p>
        <p style={{color:"rgba(255,255,255,.6)",fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase"}}>
          Memory {idx+1} of {photos.length}
        </p>
      </div>

      {/* Skip button */}
      <button onClick={onNext} style={{position:"absolute",top:"52px",right:"16px",zIndex:8,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",borderRadius:"50px",padding:"6px 14px",color:"#fff",fontFamily:"'Fredoka',cursive",fontSize:"13px",cursor:"pointer"}}>
        Skip ⏭
      </button>
    </div>
  );
}

/* ─── Future Promise Cards ───────────────────────────────────────────────── */
function FuturePromises({promise,friendName,onNext}){
  const defaultPromises=[
    "I will always be there for you, no matter what 🤝",
    "I promise to never let distance break our bond 💌",
    "I'll always answer your 3AM calls 🌙",
    "I promise to celebrate every win with you 🎉",
    "I'll never stop making memories with you 📸",
  ];
  const promises=promise?[promise,...defaultPromises.slice(0,3)]:defaultPromises;
  const [revealed,setRevealed]=useState([]);

  const reveal=(i)=>{
    if(!revealed.includes(i))setRevealed(r=>[...r,i]);
  };

  return(
    <div style={{minHeight:"100vh",padding:"40px 16px 80px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} style={{textAlign:"center",marginBottom:"28px"}}>
        <div style={{fontSize:"40px",marginBottom:"8px"}}>🌟</div>
        <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"26px",color:C.rose}}>Promises to You</h2>
        <p style={{color:C.textSoft,fontSize:"14px"}}>{friendName}, these are forever 💖</p>
        <p style={{color:C.textLight,fontSize:"12px",marginTop:"4px"}}>Tap each card to reveal</p>
      </motion.div>

      <div style={{display:"flex",flexDirection:"column",gap:"14px",maxWidth:"420px",width:"100%",marginBottom:"28px"}}>
        {promises.map((p,i)=>(
          <motion.div key={i}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.1,type:"spring"}}
            onClick={()=>reveal(i)}
            whileHover={{scale:1.02}} whileTap={{scale:.98}}
            style={{
              background:revealed.includes(i)
                ?"linear-gradient(135deg,rgba(255,107,138,.15),rgba(255,182,193,.2))"
                :"rgba(255,255,255,.6)",
              backdropFilter:"blur(12px)",borderRadius:"20px",padding:"18px 20px",
              border:`1.5px solid ${revealed.includes(i)?C.rose:"rgba(255,182,193,.4)"}`,
              boxShadow:revealed.includes(i)?"0 6px 24px rgba(255,107,138,.2)":"0 4px 16px rgba(255,107,138,.08)",
              cursor:"pointer",transition:"all .3s",
              display:"flex",alignItems:"center",gap:"14px",
            }}>
            <div style={{fontSize:"28px",flexShrink:0,animation:revealed.includes(i)?"heartbeat 1.5s ease-in-out infinite":"none"}}>
              {revealed.includes(i)?"💖":"🔒"}
            </div>
            <div>
              {revealed.includes(i)?(
                <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.5}}
                  style={{fontFamily:"'Dancing Script',cursive",fontSize:"18px",color:C.rose,lineHeight:1.5}}>
                  {p}
                </motion.p>
              ):(
                <p style={{fontFamily:"'Fredoka',cursive",fontSize:"15px",color:C.textLight}}>
                  Tap to unlock promise #{i+1}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {revealed.length===promises.length&&(
        <motion.div initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{type:"spring"}}>
          <Btn onClick={onNext} style={{padding:"14px 40px"}}>Continue 💌</Btn>
        </motion.div>
      )}
      {revealed.length<promises.length&&(
        <p style={{color:C.textLight,fontSize:"13px",fontFamily:"'Caveat',cursive"}}>
          Unlock all {promises.length} promises to continue ✨
        </p>
      )}
    </div>
  );
}

/* ─── Memory Capsule ─────────────────────────────────────────────────────── */
function MemoryCapsule({data,onNext}){
  const [opened,setOpened]=useState(false);
  const [burst,setBurst]=useState(false);
  const secretPhoto=data.photos?.[data.photos.length-1]||null;
  const secretMsg=data.secretMsg||"You found the hidden treasure! 🎉 This is what your bestie thinks about you — you are absolutely irreplaceable and loved more than words can say. 💖";

  const open=()=>{
    if(opened)return;
    setBurst(true);
    setTimeout(()=>setBurst(false),1200);
    setTimeout(()=>setOpened(true),600);
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:"24px"}}>
      <ParticleBurst active={burst}/>
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} style={{textAlign:"center",marginBottom:"16px"}}>
        <div style={{fontSize:"16px",letterSpacing:"3px",color:C.textLight,fontFamily:"'Poppins',sans-serif",textTransform:"uppercase",marginBottom:"8px"}}>
          🔐 Hidden Treasure
        </div>
        <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"26px",color:C.rose,marginBottom:"6px"}}>Memory Capsule</h2>
        <p style={{color:C.textSoft,fontSize:"14px"}}>You completed the full journey! 🎊<br/>A special secret is waiting...</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!opened?(
          <motion.div key="closed" style={{textAlign:"center"}}>
            <motion.div
              animate={{y:[0,-10,0],rotate:[0,3,-3,0]}}
              transition={{duration:2,repeat:Infinity}}
              onClick={open}
              whileHover={{scale:1.08}} whileTap={{scale:.95}}
              style={{cursor:"pointer",display:"inline-block",marginBottom:"20px"}}>
              <div style={{
                width:"120px",height:"120px",borderRadius:"20px",margin:"0 auto",
                background:"linear-gradient(135deg,#FF6B8A,#FF4070)",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 12px 40px rgba(255,64,112,.5)",
                fontSize:"52px",
              }}>🏺</div>
            </motion.div>
            <p style={{fontFamily:"'Caveat',cursive",fontSize:"20px",color:C.rose,marginBottom:"8px"}}>Tap to open your capsule</p>
            <p style={{color:C.textLight,fontSize:"13px"}}>One final secret inside... 🤫</p>
          </motion.div>
        ):(
          <motion.div key="open" initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} transition={{type:"spring",stiffness:200}} style={{width:"100%",maxWidth:"420px"}}>
            <GlassCard glow>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:"44px",marginBottom:"12px",animation:"heartbeat 1s ease-in-out infinite"}}>💝</div>
                <h3 style={{fontFamily:"'Pacifico',cursive",fontSize:"20px",color:C.rose,marginBottom:"12px"}}>
                  The Secret Message
                </h3>
                {secretPhoto&&(
                  <img src={secretPhoto} alt="" style={{width:"100%",height:"180px",objectFit:"cover",borderRadius:"16px",marginBottom:"16px",boxShadow:"0 8px 24px rgba(255,107,138,.3)"}}/>
                )}
                <div style={{background:"rgba(255,182,193,.1)",borderRadius:"16px",padding:"16px",marginBottom:"20px",borderLeft:"3px solid #FF85A1"}}>
                  <p style={{fontFamily:"'Dancing Script',cursive",fontSize:"20px",color:C.rose,lineHeight:1.7,fontStyle:"italic"}}>
                    "{secretMsg}"
                  </p>
                </div>
                <div style={{fontSize:"24px",marginBottom:"16px"}}>💖 🌸 ✨ 🌸 💖</div>
                <Btn onClick={onNext} style={{width:"100%",justifyContent:"center"}}>
                  See Your Certificate 🎓
                </Btn>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Dark Mode BG ───────────────────────────────────────────────────────── */
function DarkBG(){
  return(
    <div style={{position:"fixed",inset:0,zIndex:-2,overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#0d0015,#150025,#0a001a)"}}/>
      {[{x:"20%",y:"30%",c:"rgba(120,0,180,.25)"},{x:"70%",y:"10%",c:"rgba(255,0,100,.2)"},{x:"50%",y:"70%",c:"rgba(0,100,200,.15)"}].map((b,i)=>(
        <div key={i} style={{position:"absolute",left:b.x,top:b.y,width:"350px",height:"350px",borderRadius:"50%",background:b.c,filter:"blur(80px)",animation:`floatYslow ${10+i*2}s ${i*3}s ease-in-out infinite`}}/>
      ))}
      {Array.from({length:50},(_,i)=>(
        <div key={i} style={{position:"absolute",left:`${(i*7)%99}%`,top:`${(i*13)%95}%`,width:`${Math.random()*2+1}px`,height:`${Math.random()*2+1}px`,borderRadius:"50%",background:"#fff",opacity:Math.random()*.6+.1,animation:`heartbeat ${2+i%5}s ${i%4}s ease-in-out infinite`}}/>
      ))}
    </div>
  );
}

/* ─── Link Generator Screen ──────────────────────────────────────────────── */
function LinkGenerated({data}){
  const [copied,setCopied]=useState(false);

  // Encode data into URL-safe base64
  const encoded=useMemo(()=>{
    try{
      const json=JSON.stringify(data);
      const b64=btoa(unescape(encodeURIComponent(json)));
      return b64;
    }catch{return "";}
  },[data]);

  const url=`${typeof window!=="undefined"?window.location.origin+window.location.pathname:""}?s=${encoded}`;

  const copy=()=>{
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(()=>setCopied(false),2500);
  };

  const shareWA=()=>window.open(`https://wa.me/?text=${encodeURIComponent(`💖 Maine tumhare liye kuch special banaya hai... kholo: ${url}`)}`,"_blank");
  const shareTG=()=>window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent("💖 Tumhare liye ek surprise hai...")}`,"_blank");

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <GlassCard glow>
        <div style={{textAlign:"center"}}>
          <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:200}}>
            <div style={{fontSize:"60px",marginBottom:"12px"}}>🎉</div>
          </motion.div>
          <h2 style={{fontFamily:"'Pacifico',cursive",fontSize:"24px",color:C.rose,marginBottom:"6px"}}>
            Surprise Link Ready!
          </h2>
          <p style={{color:C.textSoft,fontSize:"14px",marginBottom:"20px"}}>
            Share this link with <strong style={{color:C.rose}}>{data.friendName}</strong> 💖<br/>
            <span style={{fontSize:"12px"}}>They'll see the full surprise — you won't be visible!</span>
          </p>

          {/* Link preview box */}
          <div style={{
            background:"rgba(255,182,193,.15)",border:"1.5px dashed #FFB6C1",
            borderRadius:"16px",padding:"12px 16px",marginBottom:"20px",
            fontFamily:"'Poppins',sans-serif",fontSize:"12px",color:C.textSoft,
            wordBreak:"break-all",textAlign:"left",maxHeight:"80px",overflow:"hidden",
          }}>
            {url.slice(0,80)}...
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}} onClick={copy} style={{
              background:copied?"#25a244":"linear-gradient(135deg,#FF6B8A,#FF4070)",
              color:"#fff",border:"none",borderRadius:"50px",padding:"14px",
              fontFamily:"'Fredoka',cursive",fontSize:"16px",fontWeight:600,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
              boxShadow:"0 4px 16px rgba(255,64,112,.35)",transition:"background .3s",
            }}>{copied?"✅ Copied!":"🔗 Copy Link"}</motion.button>

            <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}} onClick={shareWA} style={{
              background:"#25D366",color:"#fff",border:"none",borderRadius:"50px",padding:"14px",
              fontFamily:"'Fredoka',cursive",fontSize:"16px",fontWeight:600,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
              boxShadow:"0 4px 16px #25D36644",
            }}>💚 Share on WhatsApp</motion.button>

            <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}} onClick={shareTG} style={{
              background:"#229ED9",color:"#fff",border:"none",borderRadius:"50px",padding:"14px",
              fontFamily:"'Fredoka',cursive",fontSize:"16px",fontWeight:600,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
              boxShadow:"0 4px 16px #229ED944",
            }}>✈️ Share on Telegram</motion.button>
          </div>

          <p style={{fontFamily:"'Caveat',cursive",fontSize:"13px",color:C.textLight,marginTop:"16px"}}>
            Made by Aadarsh ❤️‍🩹
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  ROOT APP                                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function App(){
  const [mode,setMode]=useState(null); // null=loading | "creator" | "receiver"
  const [receiverData,setReceiverData]=useState(null);
  const [screen,setScreen]=useState("intro");
  const [creatorData,setCreatorData]=useState(null);
  const [creatorDone,setCreatorDone]=useState(false);
  const [showConf,setShowConf]=useState(false);
  const [showHearts,setShowHearts]=useState(false);
  const [burst,setBurst]=useState(false);
  const [dark,setDark]=useState(false);

  // On mount: check URL for ?s= param
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const encoded=params.get("s");
    if(encoded){
      try{
        const json=decodeURIComponent(escape(atob(encoded)));
        const data=JSON.parse(json);
        setReceiverData(data);
        setMode("receiver");
        setScreen("intro");
      }catch{
        setMode("creator");
      }
    }else{
      setMode("creator");
    }
  },[]);

  const go=useCallback((s)=>{
    if(s==="celebrate"){setShowConf(true);setShowHearts(true);setBurst(true);setTimeout(()=>setBurst(false),1200);}
    setScreen(s);
  },[]);

  const handleCreatorDone=useCallback((data)=>{
    setCreatorData(data);
    setCreatorDone(true);
  },[]);

  // ── RECEIVER mode screens
  const d=receiverData;
  const name=d?.friendName||"Bestie";

  const receiverScreens={
    intro:     <CinematicIntro onDone={()=>go("gift")}/>,
    gift:      <GiftBoxScreen friendName={name} onOpen={()=>go("gate")}/>,
    gate:      <FunnyGate friendName={name} onYes={()=>go("quiz")}/>,
    quiz:      <FriendshipQuiz friendName={name} onNext={()=>{
                 if(d?.photos?.length>0)go("photos");else go("flowers");
               }}/>,
    photos:    <PhotoStory photos={d?.photos||[]} friendName={name} onDone={()=>go("polaroid")}/>,
    polaroid:  <PolaroidWall photos={d?.photos||[]} onNext={()=>go("flowers")}/>,
    flowers:   <FlowersScreen friendName={name} onNext={()=>{
                 if(d?.memories?.length>0)go("timeline");else go("whyspecial");
               }}/>,
    timeline:  <MemoryTimeline memories={d?.memories||[]} onNext={()=>go("wrapped")}/>,
    wrapped:   <FriendshipWrapped data={d||{}} onNext={()=>go("whyspecial")}/>,
    whyspecial:<WhySpecial friendName={name} onNext={()=>{
                 if(d?.voiceUrl)go("voice");else go("envelope");
               }}/>,
    voice:     <VoicePlayer voiceUrl={d?.voiceUrl} onNext={()=>go("envelope")}/>,
    envelope:  <EnvelopeLetter secretMsg={d?.secretMsg} personalMsg={d?.personalMsg} friendName={name} favoriteQuote={d?.favoriteQuote} futurePromise={d?.futurePromise} onNext={()=>go("meter")}/>,
    meter:     <FriendshipMeter friendName={name} onDone={()=>go("celebrate")}/>,
    celebrate: <CelebrationScreen data={d||{friendName:"Bestie"}}/>,
  };

  if(mode===null) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:"48px",animation:"heartbeat 1s ease-in-out infinite"}}>💖</div>
    </div>
  );

  return(
    <>
      {FONTS}
      {dark?<DarkBG/>:<PremiumBG/>}
      <ConfettiCanvas active={showConf}/>
      <HeartRain active={showHearts}/>
      <ParticleBurst active={burst}/>

      {/* Dark mode toggle */}
      {mode==="receiver"&&screen!=="intro"&&(
        <motion.button whileHover={{scale:1.1}} whileTap={{scale:.9}} onClick={()=>setDark(v=>!v)}
          style={{position:"fixed",top:"16px",left:"16px",zIndex:300,width:"40px",height:"40px",borderRadius:"50%",
            background:dark?"rgba(255,255,255,.15)":"rgba(255,107,138,.15)",border:"1.5px solid rgba(255,182,193,.4)",
            cursor:"pointer",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {dark?"☀️":"🌙"}
        </motion.button>
      )}

      {/* ── CREATOR mode ── */}
      {mode==="creator"&&(
        <AnimatePresence mode="wait">
          {!creatorDone?(
            <motion.div key="form" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-24}} transition={{duration:.4}}>
              <CreatorMode onDone={handleCreatorDone}/>
            </motion.div>
          ):(
            <motion.div key="link" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-24}} transition={{duration:.4}}>
              <LinkGenerated data={creatorData}/>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── RECEIVER mode ── */}
      {mode==="receiver"&&(
        <AnimatePresence mode="wait">
          <motion.div key={screen} initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-24}} transition={{duration:.42,ease:"easeInOut"}}>
            {receiverScreens[screen]}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
