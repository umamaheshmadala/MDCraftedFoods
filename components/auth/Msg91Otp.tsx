'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    initSendOTP?: (configuration: unknown) => void
    sendOtp?: (identifier: string, success: (data: unknown) => void, failure: (error: unknown) => void) => void
    verifyOtp?: (otp: string, success: (data: unknown) => void, failure: (error: unknown) => void) => void
    retryOtp?: (channel: string, success: (data: unknown) => void, failure: (error: unknown) => void) => void
  }
}

const WIDGET_ID = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || ''
const TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || ''

const accessTokenFrom = (data: any) =>
  data?.accessToken ?? data?.access_token ?? data?.token ?? data?.data?.accessToken ?? data?.data?.access_token ?? null

export function Msg91Otp({onAuthenticated}:{onAuthenticated:(token:string,phone:string)=>Promise<void>}) {
  const [phone,setPhone]=useState('')
  const [otp,setOtp]=useState('')
  const [sent,setSent]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [resendIn,setResendIn]=useState(0)
  const [verifiedToken,setVerifiedToken]=useState<string|null>(null)

  useEffect(()=>{
    const script=document.createElement('script')
    script.src='https://verify.msg91.com/otp-provider.js'
    script.async=true
    script.onload=()=>window.initSendOTP?.({
      widgetId:WIDGET_ID, tokenAuth:TOKEN_AUTH, identifier:'', exposeMethods:true, captchaRenderId:'',
      success:(data:any)=>{const token=accessTokenFrom(data);if(token)setVerifiedToken(token)},
      failure:(reason:any)=>console.error('MSG91 failure',reason)
    })
    script.onerror=()=>setError('Unable to load verification service.')
    document.body.appendChild(script)
    return()=>script.remove()
  },[])

  useEffect(()=>{if(!resendIn)return;const id=window.setInterval(()=>setResendIn(x=>Math.max(0,x-1)),1000);return()=>window.clearInterval(id)},[resendIn])

  const normalized=phone.replace(/\D/g,'')
  const send=()=>{setError('');if(normalized.length<10)return setError('Enter a valid mobile number.');setBusy(true);window.sendOtp?.(normalized,()=>{setSent(true);setResendIn(60);setBusy(false)},()=>{setError('Unable to send OTP. Please try again.');setBusy(false)})}
  const verify=()=>{setError('');if(!/^\d{4,8}$/.test(otp))return setError('Enter the OTP sent to your phone.');setBusy(true);window.verifyOtp?.(otp,async(data:any)=>{const token=accessTokenFrom(data)||verifiedToken;if(!token){setError('No verification token was returned.');setBusy(false);return}try{await onAuthenticated(token,normalized)}catch(e:any){setError(e?.message||'Sign in failed.')}finally{setBusy(false)}},()=>{setError('Incorrect or expired OTP.');setBusy(false)})}
  const resend=()=>{if(resendIn)return;setBusy(true);window.retryOtp?.('text',()=>{setResendIn(60);setBusy(false)},()=>{setError('Unable to resend OTP.');setBusy(false)})}

  return <div className="auth-card"><p className="eyebrow">BADAM RESERVE</p><h1>{sent?'Verify your number':'Sign in or sign up'}</h1><p className="muted">{sent?'Enter the OTP sent to your phone.':'Use your mobile number to continue.'}</p>{!sent?<><label>Mobile number</label><input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210"/><button disabled={busy} onClick={send}>{busy?'Sending…':'Send OTP'}</button></>:<><label>OTP</label><input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} inputMode="numeric" autoComplete="one-time-code" maxLength={8} placeholder="Enter OTP"/><button disabled={busy} onClick={verify}>{busy?'Verifying…':'Verify & continue'}</button><button className="secondary" disabled={busy||!!resendIn} onClick={resend}>{resendIn?`Resend in ${resendIn}s`:'Resend OTP'}</button></>}{error&&<p className="error" role="alert">{error}</p>}<p className="fine">By continuing, you agree to the MD Crafted Foods terms and privacy policy.</p></div>
}
