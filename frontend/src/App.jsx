import { useEffect, useState } from 'react'

const STATUS_TEXT = {
  pending: '待处理',
  running: '判定中',
  done: '已完成',
}

const VERDICT_STYLE = {
  套准: { color: '#1a7f37', background: '#dafbe1' },
  套不准: { color: '#cf222e', background: '#ffebe9' },
}

export default function App() {
  const [username, setUsername] = useState('printer')
  const [password, setPassword] = useState('print123456')
  const [token, setToken] = useState(localStorage.getItem('print_token') || '')
  const [role, setRole] = useState(localStorage.getItem('print_role') || '')
  const [rows, setRows] = useState([])
  const [sheet, setSheet] = useState('插页-02')
  const [cyan, setCyan] = useState('0.08')
  const [magenta, setMagenta] = useState('0.02')
  const [error, setError] = useState('')

  async function api(path, options = {}) {
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.detail || '请求失败')
    return data
  }

  async function load() {
    const data = await api('/api/jobs')
    setRows(data || [])
  }

  useEffect(() => {
    if (!token) return
    load()
    const timer = setInterval(load, 1000)
    return () => clearInterval(timer)
  }, [token])

  async function enter() {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    localStorage.setItem('print_token', data.access_token)
    localStorage.setItem('print_role', data.role)
    setToken(data.access_token)
    setRole(data.role)
  }

  async function send() {
    setError('')
    try {
      await api('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          sheet,
          cyan_mm: Number(cyan),
          magenta_mm: Number(magenta),
        }),
      })
    } catch (err) {
      setError(err.message)
    }
  }

  function leave() {
    localStorage.clear()
    setToken('')
    setRole('')
  }

  if (!token) {
    return (
      <main>
        <h1>印刷套准复核台</h1>
        <p>提交后接口只入队。另一进程领走偏差并写结论，页面轮询到结论出现。</p>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={enter}>登录</button>
        <p>printer / print123456 可送复核；checker / check123456 只看</p>
      </main>
    )
  }

  return (
    <main>
      <h1>印刷套准复核台</h1>
      <button onClick={leave}>退出</button>
      {role === 'writer' && (
        <p>
          <input value={sheet} onChange={(e) => setSheet(e.target.value)} />
          <input value={cyan} onChange={(e) => setCyan(e.target.value)} />
          <input value={magenta} onChange={(e) => setMagenta(e.target.value)} />
          <button onClick={send}>送复核</button>
        </p>
      )}
      {error && <p>{error}</p>}
      <table>
        <thead>
          <tr><th>印张</th><th>青</th><th>品</th><th>状态</th><th>结论</th><th>理由</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const style = VERDICT_STYLE[row.verdict]
            return (
              <tr key={row.id}>
                <td>{row.sheet}</td>
                <td>{row.cyan_mm}</td>
                <td>{row.magenta_mm}</td>
                <td>{STATUS_TEXT[row.status] || row.status}</td>
                <td>
                  {row.verdict ? (
                    <span
                      style={{
                        color: style.color,
                        background: style.background,
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {row.verdict}
                    </span>
                  ) : (
                    <span style={{ color: '#8c8c8c' }}>等待</span>
                  )}
                </td>
                <td>{row.reason}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </main>
  )
}
