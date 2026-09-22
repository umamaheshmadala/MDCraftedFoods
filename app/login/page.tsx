'use client'

import { useState } from 'react'
import { Msg91Otp } from '../../components/auth/Msg91Otp'
import { completeMsg91Login } from '../../lib/badamReserveAuth'

export default function LoginPage() {
  const [signedIn, setSignedIn] = useState(false)
  return <main className="auth-shell">{signedIn ? <div className="auth-card"><h1>You're signed in</h1><a href="/">Continue to Badam Reserve</a></div> : <Msg91Otp onAuthenticated={async (token,phone)=>{await completeMsg91Login(token,phone);setSignedIn(true)}}/>}</main>
}
