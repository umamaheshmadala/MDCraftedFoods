const BASE=(process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL||'https://tzzzltezvwxrqgthglsu.supabase.co/functions/v1').replace(/\/$/,'')
const AUTH=`${BASE}/auth-session`
const KEY='badam-reserve.auth-session'

export interface Customer{id:string;phone:string;name:string|null;email:string|null;phone_verification_status:string}
export interface AppSession{token:string;expires_at:string}

export async function completeMsg91Login(accessToken:string,phone:string){
  const r=await fetch(`${AUTH}/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accessToken,phone:phone.replace(/\D/g,'')})})
  const b=await r.json().catch(()=>({}))
  if(!r.ok)throw new Error(b.error||'Authentication failed')
  localStorage.setItem(KEY,JSON.stringify(b.session))
  return b as {session:AppSession;customer:Customer}
}

export async function getCurrentSession(){
  const raw=localStorage.getItem(KEY)
  if(!raw)return{authenticated:false,customer:null}
  const s=JSON.parse(raw) as AppSession
  const r=await fetch(`${AUTH}/session`,{headers:{Authorization:`Bearer ${s.token}`}})
  if(!r.ok){localStorage.removeItem(KEY);return{authenticated:false,customer:null}}
  return{authenticated:true,...await r.json()}
}

export async function logout(){
  const raw=localStorage.getItem(KEY)
  try{if(raw){const s=JSON.parse(raw) as AppSession;await fetch(`${AUTH}/logout`,{method:'POST',headers:{Authorization:`Bearer ${s.token}`}})}}finally{localStorage.removeItem(KEY)}
}
