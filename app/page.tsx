import Link from 'next/link'

export default function Home() {
  return <main style={{maxWidth:1100,margin:'0 auto',padding:'48px 24px'}}><header style={{display:'flex',justifyContent:'space-between'}}><strong style={{fontSize:24}}>MD Crafted Foods</strong><Link href="/login">Sign in</Link></header><section style={{padding:'120px 0'}}><p className="eyebrow">BADAM RESERVE</p><h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(44px,8vw,82px)',margin:'12px 0'}}>Thick. Rich. Velvety.</h1><p style={{fontSize:20}}>Premium Instant Badam Milk Mix.</p><Link href="/login">Sign in / Sign up</Link></section></main>
}
